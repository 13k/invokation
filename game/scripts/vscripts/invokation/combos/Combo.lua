--- Combo class.
-- @classmod invokation.combos.Combo

local moses = require("moses")
local class = require("pl.class")
local tablex = require("pl.tablex")
local BaseCombo = require("invokation.combos.BaseCombo")
local ComboSequence = require("invokation.combos.ComboSequence")

local M = class(BaseCombo)

local STATES = ComboSequence.STATES

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

local function abilityWait(ability)
  if WAIT_ABILITY_SPECIALS[ability.name] == nil then
    return ability:GetDuration() or 0
  end

  local function getSpecialValue(specialKey)
    return ability:GetSpecialValueFor(specialKey) or 0
  end

  local values = moses.map(WAIT_ABILITY_SPECIALS[ability.name], getSpecialValue)

  return tablex.reduce("+", values)
end

--- Constructor.
-- @tparam BaseCombo.Spec spec Combo data
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
-- @tparam function options.clock Clock function that returns the current time
function M:_init(spec, options)
  self:super(spec, options)

  options = options or {}

  self.clock = options.clock or _G.Time
  self.sequence = ComboSequence(self.id, self.sequence, { clock = self.clock })
  self.waitQueue = {}
end

--- Generates a DOT formatted string from the combo's FSM.
-- @treturn string DOT string
function M:todot()
  return self.sequence:todot()
end

--- Returns the current step id.
-- @treturn ?int The current step id or `nil`
function M:CurrentStepId()
  return self.sequence.currentId
end

--- Returns the current step.
-- @treturn ?combos.ComboStep The current step or `nil`
function M:CurrentStep()
  return self.sequence.current
end

--- Returns the current next steps ids.
-- @treturn {int,...} Array of next steps ids
function M:NextStepsIds()
  return self.sequence.nextIds
end

--- Returns the current next steps.
-- @treturn {ComboStep,...} Array of next steps
function M:NextSteps()
  return self.sequence.next
end

--- Progresses the combo with the given ability if possible.
-- @tparam dota2.Ability ability Ability instance
-- @treturn bool `true` if succeeded, `false` otherwise
function M:Progress(ability)
  local progressed = self.sequence:Progress(ability.name)

  if progressed then
    self.started = true
    self.count = self.count + 1

    table.insert(self.waitQueue, self.clock() + abilityWait(ability))
  end

  return progressed
end

--- Progresses combo to pre finish if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
function M:PreFinish()
  self.preFinished = self.sequence:PreFinish()

  if self.preFinished then
    self.waitTime = math.max(unpack(self.waitQueue))
    self.waitDuration = self.waitTime - self.sequence:EnterTime(STATES.PRE_FINISH)
  end

  return self.preFinished
end

--- Finishes combo if possible.
-- @treturn bool `true` if succeeded, `false` otherwise
function M:Finish()
  self.finished = self.sequence:Finish()

  if self.finished then
    self.duration = self.sequence.duration
  end

  return self.finished
end

return M
