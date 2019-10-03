--- Combo class.
-- @classmod invokation.combos.Combo

local fsm = require("invokation.fsm")
local tablex = require("pl.tablex")
local BaseCombo = require("invokation.combos.BaseCombo")
local ComboStep = require("invokation.combos.ComboStep")

local M = require("pl.class")(BaseCombo)

local INITIAL_STATE = "start"
local DELAYED_FINISH_STATE = "delayed_finish"
local DELAYED_FINISH_EVENT = "delayed_finish"
local FINISH_STATE = "finish"
local FINISH_EVENT = "finish"

-- @todo Use an LRU cache
local CACHE = {}

local WAIT_ABILITY_SPECIALS = {
  invoker_alacrity = {"duration"},
  invoker_chaos_meteor = {"land_time", "burn_duration"},
  invoker_cold_snap = {"duration"},
  invoker_deafening_blast = {"disarm_duration"},
  invoker_emp = {"delay"},
  invoker_ice_wall = {"duration"},
  invoker_sun_strike = {"delay"},
  invoker_tornado = {"lift_duration"},
  item_black_king_bar = {"duration"},
  item_cyclone = {"cyclone_duration"},
  item_sheepstick = {"sheep_duration"},
  item_shivas_guard = {"blast_debuff_duration"}
}

local function parseSequence(sequence)
  local nextSteps = {}
  local steps = {{name = INITIAL_STATE, state = INITIAL_STATE, next = {sequence[1].id}}}
  local events = {}
  local lastState

  tablex.insertvalues(steps, sequence)

  for _, step in ipairs(steps) do
    lastState = step.state
    nextSteps[step.state] = {}

    if step.next == nil then
      break
    end

    for _, nextId in ipairs(step.next) do
      local nextStep = sequence[nextId]
      local event = {name = nextStep.event, from = step.state, to = nextStep.state}
      table.insert(events, event)
      table.insert(nextSteps[step.state], nextStep)
    end
  end

  table.insert(events, {name = DELAYED_FINISH_EVENT, from = lastState, to = DELAYED_FINISH_STATE})
  table.insert(events, {name = FINISH_EVENT, from = DELAYED_FINISH_STATE, to = FINISH_STATE})

  local fsmDef = {initial = INITIAL_STATE, events = events}

  return fsmDef, nextSteps
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

--- Constructor.
-- @tparam table spec Combo specification table
-- @tparam string spec.id ID
-- @tparam string spec.specialty Specialty
-- @tparam string spec.stance Stance
-- @tparam int spec.heroLevel Recommended hero level
-- @tparam int spec.damageRating Damage rating
-- @tparam int spec.difficultyRating Difficulty rating
-- @tparam array(string) spec.tags Tags
-- @tparam array(string) spec.items List of required items names
-- @tparam array(int) spec.orbs List of recommended orb abilities levels (`{quas, wex, exort}`)
-- @tparam int spec.talents Bitmap of recommended talent abilities
-- @tparam array(ComboStep) spec.sequence List of @{ComboStep}
-- @tparam[opt] table options Options
-- @tparam invokation.Logger options.logger Logger instance
function M:_init(spec, options)
  self:super(options)

  tablex.update(self, spec)

  self.sequence = tablex.map(ComboStep, self.sequence)
  self.startTimes = {}
  self.endTimes = {}
  self.waitQueue = {}

  self:createFSM()
end

function M:createFSM()
  local fsmDef
  local nextSteps

  if CACHE[self.id] ~= nil then
    local cached = CACHE[self.id]
    fsmDef = cached.fsmDef
    nextSteps = cached.nextSteps
  else
    fsmDef, nextSteps = parseSequence(self.sequence)
    CACHE[self.id] = {fsmDef = fsmDef, nextSteps = nextSteps}
  end

  self.fsm = fsm.create(fsmDef)

  self.fsm.onstatechange = function(_, _, from, to)
    local now = currentTime()
    self.endTimes[from] = now
    self.startTimes[to] = now
  end

  self.nextSteps = nextSteps
end

--- Generates a DOT formatted string from the combo's FSM.
-- @treturn string DOT string
function M:todot()
  return self.fsm:todot()
end

--- Returns the current step id.
-- @treturn ?int The current step id or `nil`
function M:CurrentStepId()
  return ComboStep.StepId(self.fsm.current)
end

--- Returns the current step.
-- @treturn ?ComboStep The current step or `nil`
function M:CurrentStep()
  return self.sequence[self:CurrentStepId()]
end

--- Returns the current next steps.
-- @treturn ?array(ComboStep) List of next @{ComboStep} or `nil`
function M:NextSteps()
  return self.nextSteps[self.fsm.current]
end

--- Progresses the combo with the given ability if possible.
-- @tparam invokation.dota2.Ability ability Ability instance
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
