local class = require("middleclass")

local Ability = require("invk.dota2.ability")
local I = require("invk.const.invoker")
local tbl = require("invk.lang.table")

--- @alias invk.dota2.invoker.AbilityName string

--- @alias invk.dota2.invoker.OrbTriplet {
---   [1]: invk.dota2.invoker.AbilityName,
---   [2]: invk.dota2.invoker.AbilityName,
---   [3]: invk.dota2.invoker.AbilityName,
--- }

--- Invoker class.
--- @class invk.dota2.Invoker : middleclass.Class
--- @field hero CDOTA_BaseNPC_Hero
local M = class("invk.dota2.Invoker")

--- Constructor.
--- @param hero CDOTA_BaseNPC_Hero # Hero entity
function M:initialize(hero)
  self.hero = hero
end

--- @param ability1 invk.dota2.Ability
--- @param ability2 invk.dota2.Ability
function M:swap_abilities(ability1, ability2)
  return self.hero:SwapAbilities(
    ability1.name,
    ability2.name,
    ability2.index <= I.MAX_VISIBLE_ABILITY_INDEX,
    ability1.index <= I.MAX_VISIBLE_ABILITY_INDEX
  )
end

--- Invokes an ability by name.
--- @param ability_name invk.dota2.invoker.AbilityName Ability name
function M:invoke(ability_name)
  local base_ability = self.hero:FindAbilityByName(ability_name)

  if not base_ability then
    return
  end

  local invoked = Ability:new(base_ability)

  -- I(i) : [i, s2], [s3, s4, s5] -> [i, s2], [s3, s4, s5]
  if invoked.index == I.AbilityIndex.EMPTY1 then
    return
  end

  local base_spell1 = self.hero:GetAbilityByIndex(I.AbilityIndex.EMPTY1)

  if not base_spell1 then
    return
  end

  local spell1 = Ability:new(base_spell1)

  -- I(i) : [s1, i], [s2, s3, s4] -> [i, s1], [s2, s3, s4]
  if invoked.index == I.AbilityIndex.EMPTY2 then
    self:swap_abilities(spell1, invoked)
    return
  end

  local base_spell2 = self.hero:GetAbilityByIndex(I.AbilityIndex.EMPTY2)

  if not base_spell2 then
    return
  end

  local spell2 = Ability:new(base_spell2)

  -- I(i) : [s1, s2], [s3, s4, i] -> [s2, s1], [s3, s4, i] -> [i, s1], [s3, s4, s2]
  self:swap_abilities(spell1, spell2)
  self:swap_abilities(spell2, invoked)
end

--- @param hero CDOTA_BaseNPC_Hero
--- @param ability CDOTABaseAbility
--- @param target_level integer
--- @return boolean
local function can_level_up_ability(hero, ability, target_level)
  return (ability:CanAbilityBeUpgraded() == ABILITY_CAN_BE_UPGRADED)
    and (hero:GetAbilityPoints() > 0)
    and (ability:GetLevel() < target_level)
end

--- Ability level up option.
---
--- If no option is given, level up the ability 1 level.
--- @class invk.dota2.invoker.AbilityLevelUpOption
--- @field level? integer # Specific level
--- @field max_level? boolean # Level up to max ability level

--- @class invk.dota2.invoker.LevelUpAbilitiesOptions
--- @field max_level? boolean # Level up abilities to max level (default: `false`)
--- @field [invk.dota2.invoker.AbilityName] invk.dota2.invoker.AbilityLevelUpOption? # Orb ability level up option

--- Levels up orb abilities.
--- @param options? invk.dota2.invoker.LevelUpAbilitiesOptions
function M:level_up_abilities(options)
  local opts = options or {}

  for _, name in ipairs(I.ORB_ABILITIES) do
    if opts.max_level or opts[name] then
      local ability = assertf(self.hero:FindAbilityByName(name), "could not find ability %q", name)
      local ability_opt = opts[name] or {}
      --- @type integer
      local target_level

      if opts.max_level or ability_opt.max_level then
        target_level = ability:GetMaxLevel()
      elseif ability_opt.level then
        target_level = ability_opt.level
      else
        target_level = ability:GetLevel() + 1
      end

      while can_level_up_ability(self.hero, ability, target_level) do
        self.hero:UpgradeAbility(ability)
      end
    end
  end
end

--[[
  This is a hack. "AbilityValues" values for Invoker spells that depend on
  orb ability level (specials that have "levelkey" set to "quaslevel",
  "wexlevel" or "exortlevel") don't change when orb ability levels are
  manually changed (with `CDOTABaseAbility:SetLevel`). Since we're resetting
  orb levels to zero, this hack "resets" spell abilities by removing and
  reinserting them on the hero.

  WARNING: when removing an ability, make sure they aren't visible (invoked),
  otherwise the whole ability slot will disappear from the UI.
]]
--- @param hero CDOTA_BaseNPC_Hero
--- @param ability CDOTABaseAbility
local function reinsert_spell_ability(hero, ability)
  local name = ability:GetAbilityName()

  if not ability:IsHidden() then
    errorf("Tried to remove visible ability %q.", name)
  end

  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(name)

  ability = hero:AddAbility(name)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end

--- @class invk.dota2.invoker.ResetAbilitiesOptions
--- @field reinsert? bool Reinsert (reset) spell abilities (default: `false`)

--- Resets orb abilities levels to zero.
---
--- Reinsert option is a workaround to fix spells not scaling back (special values that
--- depend on orb levels). Another way to fix this is to completely replace the
--- player's hero with [PlayerResource:ReplaceHeroWith]. If hero replacement is
--- being used, this option is not needed.
--- @param options? invk.dota2.invoker.ResetAbilitiesOptions # Options table
--- @return integer # The number of ability points gained by downgrading orb abilities
function M:reset_abilities(options)
  local opts = options or {}
  local points = 0
  local reset_abilities = tbl.append(I.ORB_ABILITIES, I.TALENT_ABILITIES)

  for _, name in ipairs(reset_abilities) do
    local ability = self.hero:FindAbilityByName(name)

    if ability ~= nil then
      points = points + ability:GetLevel()
      ability:SetLevel(0)
    end
  end

  if opts.reinsert then
    self:invoke(I.AbilityName.EMPTY2)
    self:invoke(I.AbilityName.EMPTY1)

    for _, name in ipairs(I.SPELL_ABILITIES) do
      local ability = self.hero:FindAbilityByName(name)

      if ability then
        reinsert_spell_ability(self.hero, ability)
      end
    end
  end

  return points
end

return M
