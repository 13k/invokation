local class = require("middleclass")
local inspect = require("inspect")

local Base = require("invk.game_mode.command.base")
local val = require("invk.lang.value")

--- Dumps current hero abilities.
---
--- Usage: invk_ability_dump [simplified:bool]
---
--- @class invk.game_mode.commands.AbilityDump : invk.game_mode.command.Base
--- @field simplified boolean
local M = class("invk.game_mode.commands.AbilityDump", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.AbilityDump,
  name = "invk_ability_dump",
  help = "Dump current hero abilities ([simplified:bool])",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  self.simplified = val.non_nil(Base.bool(args[1]), false)
end

function M:run()
  self:d(self.spec.id, self.args)

  local hero = self.player:GetAssignedHero()

  for i = 0, hero:GetAbilityCount() - 1 do
    local ability = hero:GetAbilityByIndex(i)
    local repr = inspect(self:debug_ability(ability))

    print(F("[%d] %s", i, repr))
  end
end

--- @param ability CDOTABaseAbility?
--- @return table?
function M:debug_ability(ability)
  if ability == nil then
    return nil
  end

  if self.simplified then
    return {
      index = ability:GetAbilityIndex(),
      name = ability:GetAbilityName(),
      max_level = ability:GetMaxLevel(),
      level = ability:GetLevel(),
    }
  end

  return {
    index = ability:GetAbilityIndex(),
    name = ability:GetAbilityName(),
    type = ability:GetAbilityType(),
    max_level = ability:GetMaxLevel(),
    level = ability:GetLevel(),
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

return M
