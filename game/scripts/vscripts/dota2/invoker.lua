local M = require("pl.class")()

local tablex = require("pl.tablex")
local Ability = require("dota2.ability")
local Invoker = require("const.invoker")

tablex.update(M, Invoker)

function M:_init(hero)
  self.hero = hero
end

function M:swapAbilities(ability1, ability2)
  return self.hero:SwapAbilities(
    ability1.name,
    ability2.name,
    ability2.index <= Invoker.MAX_VISIBLE_ABILITY_INDEX,
    ability1.index <= Invoker.MAX_VISIBLE_ABILITY_INDEX
  )
end

function M:Invoke(abilityName)
  local invoked = Ability(self.hero:FindAbilityByName(abilityName))

  -- I(i) : [i, s2], [s3, s4, s5] -> [i, s2], [s3, s4, s5]
  if invoked.index == Invoker.INDEX_ABILITY_EMPTY1 then
    return
  end

  local spell1 = Ability(self.hero:GetAbilityByIndex(Invoker.INDEX_ABILITY_EMPTY1))

  -- I(i) : [s1, i], [s2, s3, s4] -> [i, s1], [s2, s3, s4]
  if invoked.index == Invoker.INDEX_ABILITY_EMPTY2 then
    self:swapAbilities(spell1, invoked)
    return
  end

  local spell2 = Ability(self.hero:GetAbilityByIndex(Invoker.INDEX_ABILITY_EMPTY2))

  -- I(i) : [s1, s2], [s3, s4, i] -> [s2, s1], [s3, s4, i] -> [i, s1], [s3, s4, s2]
  self:swapAbilities(spell1, spell2)
  self:swapAbilities(spell2, invoked)
end

function M:ResetOrbAbilities()
  local points = 0

  for _, name in ipairs(Invoker.ORB_ABILITIES) do
    local ability = self.hero:FindAbilityByName(name)
    points = points + ability:GetLevel()
    ability:SetLevel(0)
  end

  return points
end

return M
