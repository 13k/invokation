--- Combo class.
-- @classmod invokation.combos.Combo

local fsm = require("invokation.fsm")
local class = require("pl.class")
local tablex = require("pl.tablex")
local BaseCombo = require("invokation.combos.BaseCombo")
local ComboStep = require("invokation.combos.ComboStep")

local M = class(BaseCombo)

local INITIAL_STATE = "start"
local DELAYED_FINISH_STATE = "delayed_finish"
local DELAYED_FINISH_EVENT = "delayed_finish"
local FINISH_STATE = "finish"
local FINISH_EVENT = "finish"

-- @todo Use an LRU cache
local CACHE = {}

local WAIT_ABILITY_SPECIALS = {
  invoker_alacrity = { "duration" },
  invoker_chaos_meteor = { "land_time", "burn_duration" },
  invoker_cold_snap = { "duration" },
  invoker_deafening_blast = { "disarm_duration" },
  invoker_emp = { "delay" },
  invoker_ice_wall = { "duration" },
  invoker_sun_strike = { "delay" },
  invoker_tornado = { "lift_duration" },
  item_black_king_bar = { "duration" },
  item_cyclone = { "cyclone_duration" },
  item_sheepstick = { "sheep_duration" },
  item_shivas_guard = { "blast_debuff_duration" },
}

local function fsmDef(sequence)
  local events = {}
  local lastState

  local firstStep = {
    name = INITIAL_STATE,
    state = INITIAL_STATE,
    next = { sequence[1].id },
  }

  local steps = { firstStep }

  tablex.insertvalues(steps, sequence)

  for _, step in ipairs(steps) do
    lastState = step.state

    for _, nextId in ipairs(step.next or {}) do
      local nextStep = sequence[nextId]

      table.insert(events, {
        name = nextStep.event,
        from = step.state,
        to = nextStep.state,
      })
    end
  end

  table.insert(events, {
    name = DELAYED_FINISH_EVENT,
    from = lastState,
    to = DELAYED_FINISH_STATE,
  })

  table.insert(events, {
    name = FINISH_EVENT,
    from = DELAYED_FINISH_STATE,
    to = FINISH_STATE,
  })

  return {
    initial = INITIAL_STATE,
    events = events,
  }
end

local function currentTime()
  return GameRules:GetGameTime()
end

local function abilityWait(ability)
  if WAIT_ABILITY_SPECIALS[ability.name] then
    local function getSpecialValue(specialKey)
      return ability:GetSpecialValueFor(specialKey)
    end

    local values = tablex.imap(getSpecialValue, WAIT_ABILITY_SPECIALS[ability.name])

    return tablex.reduce("+", values)
  end

  return ability:GetDuration() or 0
end

--- Combo specification.
-- @table Spec
-- @tfield string id id
-- @tfield string specialty Specialty
-- @tfield string stance Stance
-- @tfield int heroLevel Recommended hero level
-- @tfield int damageRating Damage rating
-- @tfield int difficultyRating Difficulty rating
-- @tfield {string,...} tags Tags
-- @tfield {string,...} items Array of required items names
-- @tfield {int,...} orbs Array of recommended orb abilities levels (`{quas, wex, exort}`)
-- @tfield int talents Bitmap of recommended talent abilities
-- @tfield {ComboStep,...} sequence Array of steps

--- Constructor.
-- @tparam Spec spec Combo data
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
function M:_init(spec, options)
  self:super(options)

  tablex.update(self, spec)

  self.sequence = tablex.map(ComboStep, self.sequence)
  self.startTimes = {}
  self.endTimes = {}
  self.waitQueue = {}
  self.stepId = 0
  self.nextSteps = { 1 }

  self:createFSM()
end

function M:createFSM()
  if CACHE[self.id] == nil then
    CACHE[self.id] = fsmDef(self.sequence)
  end

  self.fsm = fsm.create(CACHE[self.id])

  self.fsm.onstatechange = function(_, _, from, to)
    local now = currentTime()

    self.endTimes[from] = now
    self.startTimes[to] = now

    self.stepId = ComboStep.StepId(to)
    self.step = self.sequence[self.stepId]
    self.nextSteps = self.step and self.step.next

    self:debugState("state change")
  end

  self:debugState("start")
end

function M:debugState(message)
  self:d(message, {
    state = self.fsm.current,
    stepId = self:CurrentStepId() or "<nil>",
    nextSteps = self:NextStepsIds() or "<nil>",
  })
end

--- Generates a DOT formatted string from the combo's FSM.
-- @treturn string DOT string
function M:todot()
  return self.fsm:todot()
end

--- Returns the current step id.
-- @treturn ?int The current step id or `nil`
function M:CurrentStepId()
  return self.stepId
end

--- Returns the current step.
-- @treturn ?ComboStep The current step or `nil`
function M:CurrentStep()
  return self.sequence[self:CurrentStepId()]
end

--- Returns the current next steps ids.
-- @treturn ?{int,...} Array of next steps ids or `nil`
function M:NextStepsIds()
  return self.nextSteps
end

--- Progresses the combo with the given ability if possible.
-- @tparam dota2.Ability ability Ability instance
-- @treturn bool `true` if succeeded, `false` otherwise
function M:Progress(ability)
  local eventFn = self.fsm[ability.name]

  if eventFn == nil then
    return nil
  end

  local progressed = eventFn(self.fsm)

  if progressed then
    self.started = true
    self.count = self.count + 1
    table.insert(self.waitQueue, currentTime() + abilityWait(ability))
  end

  return progressed
end

--- Progresses combo to pre finish if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
function M:PreFinish()
  self.delayedFinish = self.fsm[DELAYED_FINISH_EVENT](self.fsm)

  if self.delayedFinish then
    self.waitTime = math.max(unpack(self.waitQueue))
    self.waitDuration = self.waitTime - self.startTimes[DELAYED_FINISH_STATE]
  end

  return self.delayedFinish
end

--- Finishes combo if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
function M:Finish()
  self.finished = self.fsm[FINISH_EVENT](self.fsm)

  if self.finished then
    self.duration = self.startTimes[FINISH_STATE] - self.endTimes[INITIAL_STATE]
  end

  return self.finished
end

return M
