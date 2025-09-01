local inspect = require("inspect")

local M = {}

--- @param ability CDOTABaseAbility?
--- @param simple boolean
--- @return table?
local function debug_ability(ability, simple)
  if ability == nil then
    return nil
  end

  if simple then
    return {
      ability:GetAbilityIndex(),
      ability:GetAbilityName(),
      ability:GetLevel(),
    }
  end

  return {
    name = ability:GetAbilityName(),
    index = ability:GetAbilityIndex(),
    type = ability:GetAbilityType(),
    level = ability:GetLevel(),
    max_level = ability:GetMaxLevel(),
    damage = ability:GetAbilityDamage(),
    damage_type = ability:GetAbilityDamageType(),
    is_castable = ability:IsFullyCastable(),
    is_activated = ability:IsActivated(),
    is_hidden = ability:IsHidden(),
    is_attribute_bonus = ability:IsAttributeBonus(),
    is_item = ability:IsItem(),
    is_passive = ability:IsPassive(),
    procs_magic_stick = ability:ProcsMagicStick(),
    is_trained = ability:IsTrained(),
    can_be_upgraded = ability:CanAbilityBeUpgraded(),
    hero_level_to_upgrade = ability:GetHeroLevelRequiredToUpgrade(),
    duration = ability:GetDuration(),
    cast_range = ability:GetCastRange(),
    cast_point = ability:GetCastPoint(),
    backswing_time = ability:GetBackswingTime(),
    channel_time = ability:GetChannelTime(),
  }
end

--- @param player CDOTAPlayerController
--- @param simple boolean
function M.run(player, simple)
  local hero = player:GetAssignedHero()

  for i = 0, hero:GetAbilityCount() - 1 do
    local ability = hero:GetAbilityByIndex(i)
    local repr = inspect(debug_ability(ability, simple))

    print(F("[%d] %s", i, repr))
  end
end

return M
