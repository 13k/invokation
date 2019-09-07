--- FreestyleCombo is a Combo class that implements a freestyle sequence.
-- @classmod invokation.combos.FreestyleCombo

local M = require("pl.class")()

--- Hard-coded combo id.
-- @field[type=string] COMBO_ID
M.COMBO_ID = "freestyle"

function M:_init()
  self.id = M.COMBO_ID
  self.heroLevel = 1
  self.items = {}
  self.gold = 99999

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
function M:Fail() -- luacheck: no self
  return false
end

--- Freestyle combos never finish.
-- @treturn bool `false`
function M:Finish() -- luacheck: no self
  return false
end

--- Returns the current next steps.
-- @treturn table `{}` (always returns an empty list)
function M:NextSteps() -- luacheck: no self
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
