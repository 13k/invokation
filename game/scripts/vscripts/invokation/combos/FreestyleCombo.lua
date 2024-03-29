--- FreestyleCombo is a Combo class that implements a freestyle sequence.
-- @classmod invokation.combos.FreestyleCombo
local class = require("pl.class")
local BaseCombo = require("invokation.combos.BaseCombo")

local M = class(BaseCombo)

--- Hard-coded combo id.
-- @tfield string COMBO_ID
M.COMBO_ID = "freestyle"

local SPEC = { id = M.COMBO_ID, heroLevel = 1, gold = 99999, items = {} }

--- Constructor.
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
function M:_init(options)
  self:super(SPEC, options)
  self.started = true
end

--- Freestyle combos have no steps.
-- @treturn nil
function M:CurrentStepId()
  return nil
end

--- Freestyle combos have no steps.
-- @treturn nil
function M:CurrentStep()
  return nil
end

--- Freestyle combos have no steps.
-- @treturn {int,...} Always returns an empty array
function M:NextStepsIds()
  return {}
end

--- Freestyle combos have no steps.
-- @treturn {int,...} Always returns an empty array
function M:NextSteps()
  return {}
end

--- Always progresses the combo with the given ability.
-- @tparam dota2.Ability ability Ability instance
-- @treturn bool `true`
function M:Progress(ability)
  if ability:IsInvocationAbility() then
    return false
  end

  self.count = self.count + 1

  return true
end

--- Freestyle combos never fail.
function M:Fail()
  return
end

--- Freestyle combos never pre finish.
-- @treturn bool `false`
function M:PreFinish()
  return false
end

--- Freestyle combos never finish.
-- @treturn bool `false`
function M:Finish()
  return false
end

return M
