--- ComboSequence class.
-- @classmod invokation.combos.ComboSequence
local m = require("moses")
local fsm = require("fsm")
local class = require("pl.class")
local Logger = require("invokation.Logger")
local ComboStep = require("invokation.combos.ComboStep")

local M = class()

Logger.Extend(M)

--- Sequence states
-- @table STATES
-- @tfield string INITIAL Initial
-- @tfield string PRE_FINISH Pre finish
-- @tfield string FINISH Finish
M.STATES = { INITIAL = "start", PRE_FINISH = "pre_finish", FINISH = "finish" }

local EVENTS = { PRE_FINISH = "pre_finish", FINISH = "finish" }

-- @todo Use an LRU cache
local CACHE = {}

local function stepEvents(sequence, step)
  return m.map(step.next or {}, function(nextId)
    local nextStep = sequence[nextId]

    return { name = nextStep.event, from = step.state, to = nextStep.state }
  end)
end

local function fsmDef(sequence)
  local firstStep = { name = M.STATES.INITIAL, state = M.STATES.INITIAL, next = { sequence[1].id } }
  local preFinishStep = {
    name = EVENTS.PRE_FINISH,
    from = sequence[#sequence].state,
    to = M.STATES.PRE_FINISH,
  }

  local finishStep = { name = EVENTS.FINISH, from = M.STATES.PRE_FINISH, to = M.STATES.FINISH }
  local steps = m.append({ firstStep }, sequence)
  local events = m.chain(steps):map(m.partial(stepEvents, sequence)):flatten(true)

  events = events:push(preFinishStep):push(finishStep):value()

  return { initial = M.STATES.INITIAL, events = events }
end

--- Constructor.
-- @tparam int id Combo id
-- @tparam {ComboStep.Spec,...} sequence Sequence of steps
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
-- @tparam function options.clock Clock function that returns the current time
function M:_init(id, sequence, options)
  options = options or {}

  self.id = id
  self.logger = options.logger
  self.clock = options.clock
  self.sequence = m.map(sequence, ComboStep)
  self.nextIds = { self.sequence[1].id }
  self.next = { self.sequence[1] }
  self.enterTimes = {}
  self.leaveTimes = {}

  self:createFSM()
end

function M:createFSM()
  if CACHE[self.id] == nil then
    CACHE[self.id] = fsmDef(self.sequence)
  end

  self.fsm = fsm.create(CACHE[self.id])

  self.fsm.onstatechange = function(_, _, from, to)
    local now = self.clock()

    self.leaveTimes[from] = now
    self.enterTimes[to] = now
    self.currentId = ComboStep.StepId(to)
    self.current = self.sequence[self.currentId]
    self.nextIds = (self.current and self.current.next) or {}
    self.next = m.at(self.sequence, unpack(self.nextIds))

    self:debugState("state_change")
  end

  self:debugState("start")
end

--- Generates a DOT formatted string from the sequence's FSM.
-- @treturn string DOT string
function M:todot()
  return self.fsm:todot()
end

function M:debugState(message)
  local state = { state = self.fsm.current, current = self.currentId or "<nil>", next = self.nextIds }
  self:d(message, state)
end

--- Returns the time when the sequence entered the given state.
-- @tparam string state State name
-- @treturn ?int Time or `nil` if state is invalid
function M:EnterTime(state)
  return self.enterTimes[state]
end

--- Returns the time when the sequence left the given state.
-- @tparam string state State name
-- @treturn ?int Time or `nil` if state is invalid
function M:LeaveTime(state)
  return self.leaveTimes[state]
end

--- Progresses the sequence with the given event if possible.
-- @tparam string event Event
-- @treturn bool `true` if succeeded, `false` otherwise
function M:Progress(event)
  local eventFn = self.fsm[event]

  if eventFn == nil then
    return false
  end

  return eventFn(self.fsm)
end

--- Progresses the sequence to pre finish if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
function M:PreFinish()
  return self.fsm[EVENTS.PRE_FINISH](self.fsm)
end

--- Finishes the sequence if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
function M:Finish()
  local finished = self.fsm[EVENTS.FINISH](self.fsm)

  if finished then
    self.duration = self:EnterTime(M.STATES.FINISH) - self:LeaveTime(M.STATES.INITIAL)
  end

  return finished
end

return M
