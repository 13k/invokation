--- FreestyleCombo is a Combo class that implements a freestyle sequence.
-- @classmod invokation.combos.FreestyleCombo

local M = require("pl.class")()

M.COMBO_ID = "freestyle"

function M:_init()
  self.id = M.COMBO_ID
  self.heroLevel = 1
  self.items = {}

  self.count = 0
  self.damage = 0
  self.failed = false
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
-- @treturn bool `false`
-- luacheck: no self
function M:Fail()
  return false
end

--- Freestyle combos never finish.
-- @treturn bool `false`.
-- luacheck: no self
function M:Finish()
  return false
end

--- Returns the current next steps.
-- @treturn {} Always returns an empty list.
-- luacheck: no self
function M:NextSteps()
  return {}
end

--- Increments the total amount of damage dealt during this combo session.
-- @tparam int amount Damage amount
-- @treturn int Accumulated damage amount
function M:IncrementDamage(amount)
  self.damage = self.damage + amount
  return self.damage
end

return M
