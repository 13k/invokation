local class = require("middleclass")
local fsm = require("fsm")

local ComboStep = require("invk.combo.combo_step")
local Logger = require("invk.logger")
local func = require("invk.lang.function")
local tbl = require("invk.lang.table")

--- @todo Use an LRU cache
local CACHE = {}

--- ComboSequence class.
--- @class invk.combo.ComboSequence : middleclass.Class, invk.log.Mixin
--- @field id integer
--- @field clock invk.dota2.ClockFn
--- @field sequence invk.combo.ComboStep[]
--- @field current_id integer?
--- @field current invk.combo.ComboStep?
--- @field next_ids integer[]
--- @field next invk.combo.ComboStep[]
--- @field enter_times { [invk.combo.StateName]: number? }
--- @field leave_times { [invk.combo.StateName]: number? }
--- @field fsm any
--- @field logger? invk.Logger
local M = class("invk.combo.ComboSequence")

M:include(Logger.Mixin)

--- @alias invk.combo.StateName (invk.combo.MetaStateName | string)

--- Sequence state.
--- @enum invk.combo.MetaStateName
M.STATES = {
  INITIAL = "start",
  PRE_FINISH = "pre_finish",
  FINISH = "finish",
}

--- @alias invk.combo.EventName (invk.combo.MetaEventName | string)

--- @enum invk.combo.MetaEventName
M.EVENTS = {
  PRE_FINISH = "pre_finish",
  FINISH = "finish",
}

--- @class invk.combo.Event
--- @field name invk.combo.EventName
--- @field from invk.combo.StateName
--- @field to invk.combo.StateName

--- @param steps invk.combo.ComboStep[]
--- @param step invk.combo.ComboStep
--- @return invk.combo.Event[]
local function step_events(steps, step)
  local next_ids = step.next or {}

  return tbl.lmap(next_ids, function(next_id)
    local next_step = assertf(steps[next_id], "invalid next_id %d", next_id)

    --- @type invk.combo.Event
    local event = {
      name = next_step.event,
      from = step.state,
      to = next_step.state,
    }

    return event
  end)
end

--- @param steps invk.combo.ComboStep[]
local function fsm_def(steps)
  local first_step = assert(steps[1], "received empty steps sequence")
  local last_step = assert(steps[#steps], "received empty steps sequence")

  --- @type invk.combo.Event
  local ev_init = {
    name = first_step.event,
    from = M.STATES.INITIAL,
    to = first_step.state,
  }

  --- @type invk.combo.Event
  local ev_prefinish = {
    name = M.EVENTS.PRE_FINISH,
    from = last_step.state,
    to = M.STATES.PRE_FINISH,
  }

  --- @type invk.combo.Event
  local ev_finish = {
    name = M.EVENTS.FINISH,
    from = M.STATES.PRE_FINISH,
    to = M.STATES.FINISH,
  }

  --- @type invk.combo.Event[]
  local events = { ev_init }

  for _, step in ipairs(steps) do
    events = tbl.append(events, step_events(steps, step))
  end

  events[#events + 1] = ev_prefinish
  events[#events + 1] = ev_finish

  return { initial = M.STATES.INITIAL, events = events }
end

--- @class invk.combo.ComboSequenceOptions
--- @field logger? invk.Logger # Logger instance
--- @field clock invk.dota2.ClockFn # Clock function that returns the current time

--- Constructor.
--- @param id integer # Combo id
--- @param specs invk.combo.ComboStepSpec[] # Sequence of steps
--- @param options? invk.combo.ComboSequenceOptions # Options
function M:initialize(id, specs, options)
  local opts = options or {}

  self.id = id
  self.logger = opts.logger
  self.clock = opts.clock
  self.sequence = tbl.lmap(specs, func.ctor(ComboStep))

  local first_step = assert(self.sequence[1], "received empty sequence")

  self.current_id = nil
  self.current = nil
  self.next_ids = { first_step.id }
  self.next = { first_step }
  self.enter_times = {}
  self.leave_times = {}

  self:create_fsm()
end

function M:create_fsm()
  if CACHE[self.id] == nil then
    CACHE[self.id] = fsm_def(self.sequence)
  end

  self.fsm = fsm.create(CACHE[self.id])

  --- @param from invk.combo.StateName
  --- @param to invk.combo.StateName
  self.fsm.onstatechange = function(_, _, from, to)
    local now = self.clock()

    self.leave_times[from] = now
    self.enter_times[to] = now
    self.current_id = ComboStep.extract_step_id(to)
    self.current = self.sequence[self.current_id or 0]
    self.next_ids = (self.current and self.current.next) or {}
    --- @diagnostic disable-next-line: param-type-not-match
    self.next = tbl.at(self.sequence, table.unpack(self.next_ids))

    self:debug_state("state_change")
  end

  self:debug_state("start")
end

--- Generates a DOT formatted string from the sequence's FSM.
--- @return string # DOT string
function M:todot()
  return self.fsm:todot()
end

function M:debug_state(message)
  local state = {
    state = self.fsm.current,
    current = self.current_id or "<nil>",
    next = self.next_ids,
  }

  self:d(message, state)
end

--- Returns the time when the sequence entered the given state.
--- @param state invk.combo.StateName # State name
--- @return number? # Time or `nil` if state is invalid
function M:enter_time(state)
  return self.enter_times[state]
end

--- Returns the time when the sequence left the given state.
--- @param state invk.combo.StateName # State name
--- @return number? # Time or `nil` if state is invalid
function M:leave_time(state)
  return self.leave_times[state]
end

--- Progresses the sequence with the given event if possible.
--- @param event invk.combo.EventName # Event
--- @return boolean # `true` if succeeded, `false` otherwise
function M:progress(event)
  local event_fn = self.fsm[event]

  if event_fn == nil then
    return false
  end

  return event_fn(self.fsm)
end

--- Progresses the sequence to pre finish if possible.
--- @return boolean # `true` if succeeded, `false` otherwise
function M:pre_finish()
  return self.fsm[M.EVENTS.PRE_FINISH](self.fsm)
end

--- Finishes the sequence if possible.
--- @return boolean # `true` if succeeded, `false` otherwise
function M:finish()
  local finished = self.fsm[M.EVENTS.FINISH](self.fsm)

  if finished then
    local started_at = self:leave_time(M.STATES.INITIAL)
    local finished_at = self:enter_time(M.STATES.FINISH)

    if started_at ~= nil and finished_at ~= nil then
      self.duration = finished_at - started_at
    end
  end

  return finished
end

return M
