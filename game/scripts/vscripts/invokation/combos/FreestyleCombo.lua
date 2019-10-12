--- FreestyleCombo is a Combo class that implements a freestyle sequence.
-- @classmod invokation.combos.FreestyleCombo

local BaseCombo = require("invokation.combos.BaseCombo")

local M = require("pl.class")(BaseCombo)

--- Hard-coded combo id.
-- @field[type=string] COMBO_ID
M.COMBO_ID = "freestyle"

--- Constructor.
-- @tparam[opt] table options Options
-- @tparam invokation.Logger options.logger Logger instance
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
function M:CurrentStepId() -- luacheck: no self
  return nil
end

--- Freestyle combos have no steps.
-- @treturn nil
function M:CurrentStep() -- luacheck: no self
  return nil
end

--- Freestyle combos have no steps.
-- @treturn table `{}` (always returns an empty list)
function M:NextSteps() -- luacheck: no self
  return {}
end

--- Always progresses the combo with the given ability.
-- @tparam invokation.dota2.Ability ability Ability instance
-- @treturn bool `true`
function M:Progress(ability)
  if ability:IsInvocationAbility() then
    return false
  end

  self.count = self.count + 1

  return true
end

--- Freestyle combos never fail.
function M:Fail() -- luacheck: no self
  return
end

--- Freestyle combos never pre finish.
-- @treturn bool `false`
function M:PreFinish() -- luacheck: no self
  return false
end

--- Freestyle combos never finish.
-- @treturn bool `false`
function M:Finish() -- luacheck: no self
  return false
end

return M