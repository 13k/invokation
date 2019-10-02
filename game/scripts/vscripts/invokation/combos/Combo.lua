--- Combo class.
-- @classmod invokation.combos.Combo

-- local pp = require("pl.pretty")
local fsm = require("invokation.fsm")
local tablex = require("pl.tablex")
local BaseCombo = require("invokation.combos.BaseCombo")
local ComboStep = require("invokation.combos.ComboStep")

local M = require("pl.class")(BaseCombo)

local INITIAL_STATE = "start"
local FINISH_STATE = "finish"
local RESET_EVENT = "reset"
local FINISH_EVENT = "finish"

-- @todo Use a limited-size LRU cache
local CACHE = {}

local function parseSequence(sequence)
  local nextSteps = {}
  local steps = {{name = INITIAL_STATE, state = INITIAL_STATE, next = {sequence[1].id}}}
  local states = {FINISH_STATE}
  local events = {}

  tablex.insertvalues(steps, sequence)

  for _, step in ipairs(steps) do
    table.insert(states, step.state)

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

  table.insert(events, {name = FINISH_EVENT, from = states[#states], to = FINISH_STATE})
  table.insert(events, {name = RESET_EVENT, from = states, to = INITIAL_STATE})

  local fsmDef = {initial = INITIAL_STATE, events = events}

  return fsmDef, nextSteps
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
-- @tparam {int, int, int} spec.orbs List of recommended orb abilities levels (quas, wex, exort)
-- @tparam int spec.talents Bitmap of recommended talent abilities
-- @tparam array(ComboStep) spec.sequence List of @{ComboStep}
-- @tparam[opt] table options Options
-- @tparam invokation.Logger options.logger Logger instance
function M:_init(spec, options)
  self:super(options)

  tablex.update(self, spec)

  self.sequence = tablex.map(ComboStep, self.sequence)

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
  self.nextSteps = nextSteps
end

--- Generates a DOT formatted string from the combo's FSM.
-- @treturn string DOT string
function M:todot()
  return self.fsm:todot()
end

--- Progresses the combo with the given ability if possible.
-- @tparam invokation.dota2.Ability ability Ability instance
-- @treturn bool `true` if combo progressed, `false` otherwise
function M:Progress(ability)
  local eventFn = self.fsm[ability.name]

  if eventFn == nil then
    return nil
  end

  local progressed = eventFn(self.fsm)

  if progressed then
    self.count = self.count + 1
  end

  return progressed
end

--- Marks the combo as failed.
function M:Fail()
  self.failed = true
end

--- Finishes the combo if possible.
-- @treturn bool `true` if combo finished, `false` otherwise
function M:Finish()
  return self.fsm:finish()
end

--- Returns the current step id.
-- @treturn ?int The current step id or `nil`.
function M:CurrentStepId()
  return ComboStep.StepId(self.fsm.current)
end

--- Returns the current step.
-- @treturn ?ComboStep The current step or `nil`.
function M:CurrentStep()
  return self.sequence[self:CurrentStepId()]
end

--- Returns the current next steps.
-- @treturn array(ComboStep)|nil List of next
--   @{ComboStep} or `nil` if the combo is at the last step
function M:NextSteps()
  return self.nextSteps[self.fsm.current]
end

return M
