--- Invoker class.
-- @classmod invokation.dota2.Invoker

local List = require("pl.List")
local class = require("pl.class")
local tablex = require("pl.tablex")
local Ability = require("invokation.dota2.Ability")

local INVOKER = require("invokation.const.invoker")

local M = class()

tablex.update(M, INVOKER)

--- Constructor.
-- @tparam CDOTA_BaseNPC_Hero hero Hero entity
function M:_init(hero)
  self.hero = hero
end

function M:swapAbilities(ability1, ability2)
  return self.hero:SwapAbilities(
    ability1.name,
    ability2.name,
    ability2.index <= INVOKER.MAX_VISIBLE_ABILITY_INDEX,
    ability1.index <= INVOKER.MAX_VISIBLE_ABILITY_INDEX
  )
end

--- Invokes an ability by name.
-- @tparam string abilityName Ability name
function M:Invoke(abilityName)
  local invoked = Ability(self.hero:FindAbilityByName(abilityName))

  -- I(i) : [i, s2], [s3, s4, s5] -> [i, s2], [s3, s4, s5]
  if invoked.index == INVOKER.INDEX_ABILITY_EMPTY1 then return end

  local spell1 = Ability(self.hero:GetAbilityByIndex(INVOKER.INDEX_ABILITY_EMPTY1))

  -- I(i) : [s1, i], [s2, s3, s4] -> [i, s1], [s2, s3, s4]
  if invoked.index == INVOKER.INDEX_ABILITY_EMPTY2 then
    self:swapAbilities(spell1, invoked)
    return
  end

  local spell2 = Ability(self.hero:GetAbilityByIndex(INVOKER.INDEX_ABILITY_EMPTY2))

  -- I(i) : [s1, s2], [s3, s4, i] -> [s2, s1], [s3, s4, i] -> [i, s1], [s3, s4, s2]
  self:swapAbilities(spell1, spell2)
  self:swapAbilities(spell2, invoked)
end

--[[
  This is a hack. "AbilitySpecial" values for Invoker spells that depend on
  orb ability level (specials that have "levelkey" set to "quaslevel",
  "wexlevel" or "exortlevel") don't change when orb ability levels are
  manually changed (with `CDOTABaseAbility:SetLevel`). Since we're resetting
  orb levels to zero, this hack "resets" spell abilities by removing and
  reinserting them on the hero.

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

local function canLevelUpAbility(hero, ability, targetLevel)
  -- luacheck: no max line length
  return (ability:CanAbilityBeUpgraded() == ABILITY_CAN_BE_UPGRADED) and (hero:GetAbilityPoints() > 0) and (ability:GetLevel() < targetLevel)
end

--- Ability level up option.
--
-- If no option is given, level up the ability 1 level.
--
-- @table AbilityLevelUpOption
-- @tfield[opt] int level Specific level
-- @tfield[opt] bool maxLevel Level up to max ability level

--- Levels up orb abilities.
-- @tparam table options Options table
-- @tparam[opt=false] bool options.maxLevel Level up abilities to max level
-- @tparam[opt] AbilityLevelUpOption const.invoker.ABILITY_QUAS Quas level up option
-- @tparam[opt] AbilityLevelUpOption const.invoker.ABILITY_WEX Wex level up option
-- @tparam[opt] AbilityLevelUpOption const.invoker.ABILITY_EXORT Exort level up option
function M:LevelUpAbilities(options)
  options = options or {}

  for _, name in ipairs(INVOKER.ORB_ABILITIES) do
    if options.maxLevel or options[name] then
      local abilityOption = options[name] or {}
      local ability = self.hero:FindAbilityByName(name)
      local targetLevel

      if options.maxLevel or abilityOption.maxLevel then
        targetLevel = ability:GetMaxLevel()
      elseif abilityOption.level then
        targetLevel = abilityOption.level
      else
        targetLevel = ability:GetLevel() + 1
      end

      while canLevelUpAbility(self.hero, ability, targetLevel) do
        self.hero:UpgradeAbility(ability)
      end
    end
  end
end

--- Resets orb abilities levels to zero.
-- @tparam table options Options table
-- @tparam[opt=false] bool options.reinsertSpells Reinsert (reset) spell abilities
--   This is a workaround to fix spells not scaling back (special values that
--   depend on orb levels). Another way to fix this is to completely replace the
--   player's hero with `PlayerResource:ReplaceHeroWith`. If hero replacement is
--   being used, this option is not needed.
-- @treturn int The number of ability points gained by downgrading orb abilities
function M:ResetAbilities(options)
  options = options or {}

  local points = 0
  local resetAbilities = List.new(INVOKER.ORB_ABILITIES) .. List.new(INVOKER.TALENT_ABILITIES)

  for _, name in ipairs(resetAbilities) do
    local ability = self.hero:FindAbilityByName(name)

    if ability ~= nil then
      points = points + ability:GetLevel()
      ability:SetLevel(0)
    end
  end

  if options.reinsertSpells then
    self:Invoke(INVOKER.ABILITY_EMPTY2)
    self:Invoke(INVOKER.ABILITY_EMPTY1)

    for _, name in ipairs(INVOKER.SPELL_ABILITIES) do
      local ability = self.hero:FindAbilityByName(name)
      reinsertSpellAbility(self.hero, ability)
    end
  end

  return points
end

return M
