--- FreestyleCombo is a Combo class that implements a freestyle sequence.
-- @classmod invokation.combos.FreestyleCombo

local BaseCombo = require("invokation.combos.BaseCombo")

local M = require("pl.class")(BaseCombo)

--- Hard-coded combo id.
-- @tfield string COMBO_ID
M.COMBO_ID = "freestyle"

--- Constructor.
-- @tparam[opt] table options Options
-- @tparam Logger options.logger Logger instance
function M:_init(options)
  self:super(options)

  self.id = M.COMBO_ID
  self.started = true
  self.heroLevel = 1
  self.items = {}
  self.gold = 99999
end

--- Freestyle combos have no steps.
-- @treturn nil
--
-- luacheck: no self
function M:CurrentStepId()
  return nil
end

--- Freestyle combos have no steps.
-- @treturn nil
--
-- luacheck: no self
function M:CurrentStep()
  return nil
end

--- Freestyle combos have no steps.
-- @treturn table `{}` (always returns an empty array)
--
-- luacheck: no self
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
--
-- luacheck: no self
function M:Fail()
  return
end

--- Freestyle combos never pre finish.
-- @treturn bool `false`
--
-- luacheck: no self
function M:PreFinish()
  return false
end

--- Freestyle combos never finish.
-- @treturn bool `false`
--
-- luacheck: no self
function M:Finish()
  return false
end

return M
