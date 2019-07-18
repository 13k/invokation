--- Invoker class.
-- @classmod invokation.dota2.Invoker

local M = require("pl.class")()

local tablex = require("pl.tablex")
local Ability = require("invokation.dota2.Ability")
local Invoker = require("invokation.const.invoker")

tablex.update(M, Invoker)

--- Constructor.
-- @tparam CDOTA_BaseNPC_Hero hero Hero entity
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

--- Invokes an ability by name.
-- @tparam string abilityName Ability name
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

--[[
  This is a hack. "AbilitySpecial" values for Invoker spells that depend on
  orb ability level (specials that have "levelkey" set to "quaslevel",
  "wexlevel" or "exortlevel") don't change when orb ability levels are
  manually changed (with `SetLevel()`). Since we're resetting orb levels to
  zero, this hack "resets" spell abilities by removing and reinserting them
  on the hero.

  WARNING: when removing an ability, make sure they aren't visible (invoked),
  otherwise the whole ability slot will disappear from the UI.
]]
local function reinsertSpellAbility(hero, ability)
  local name = ability:GetAbilityName()

  if not ability:IsHidden() then
    error(string.format("Tried to remove visible ability %q.", name))
  end

  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(name)

  ability = hero:AddAbility(name)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end

--- Resets ability levels to zero.
-- @treturn int The number of ability points gained by downgrading abilities
function M:ResetAbilities()
  local points = 0

  for _, name in ipairs(Invoker.ORB_ABILITIES) do
    local ability = self.hero:FindAbilityByName(name)
    points = points + ability:GetLevel()
    ability:SetLevel(0)
  end

  self:Invoke(Invoker.ABILITY_EMPTY2)
  self:Invoke(Invoker.ABILITY_EMPTY1)

  for _, name in ipairs(Invoker.SPELL_ABILITIES) do
    local ability = self.hero:FindAbilityByName(name)
    reinsertSpellAbility(self.hero, ability)
  end

  return points
end

return M
