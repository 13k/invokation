local S = require("invk.const.settings")

local M = {}

--- @return CDOTABaseGameMode
function M.setup()
  local game_mode = GameRules:GetGameModeEntity()

  game_mode:SetAlwaysShowPlayerInventory(S.ALWAYS_SHOW_PLAYER_INVENTORY)
  game_mode:SetAlwaysShowPlayerNames(S.ALWAYS_SHOW_PLAYER_NAMES)
  game_mode:SetAnnouncerDisabled(S.DISABLE_ANNOUNCER)
  game_mode:SetBotThinkingEnabled(S.USE_STANDARD_DOTA_BOT_THINKING)
  game_mode:SetBotsAlwaysPushWithHuman(S.BOTS_ALWAYS_PUSH_WITH_HUMAN)
  game_mode:SetBotsInLateGame(S.BOTS_LATE_GAME_BEHAVIOR)
  game_mode:SetBotsMaxPushTier(S.BOTS_MAX_PUSH_TIER)
  game_mode:SetBountyRuneSpawnInterval(S.BOUNTY_RUNE_SPAWN_INTERVAL)
  game_mode:SetBuybackEnabled(S.BUYBACK_ENABLED)
  game_mode:SetCameraDistanceOverride(S.CAMERA_DISTANCE_OVERRIDE)
  game_mode:SetCameraSmoothCountOverride(S.CAMERA_SMOOTH_COUNT)
  game_mode:SetCustomBackpackCooldownPercent(S.CUSTOM_BACKPACK_COOLDOWN_PERCENT)
  game_mode:SetCustomBackpackSwapCooldown(S.CUSTOM_BACKPACK_SWAP_COOLDOWN)
  game_mode:SetCustomBuybackCooldownEnabled(S.CUSTOM_BUYBACK_COOLDOWN_ENABLED)
  game_mode:SetCustomBuybackCostEnabled(S.CUSTOM_BUYBACK_COST_ENABLED)
  game_mode:SetCustomGlyphCooldown(S.CUSTOM_GLYPH_COOLDOWN)
  game_mode:SetCustomScanCooldown(S.CUSTOM_SCAN_COOLDOWN)
  game_mode:SetDaynightCycleDisabled(S.DISABLE_DAY_NIGHT_CYCLE)
  game_mode:SetDeathOverlayDisabled(S.DISABLE_DEATH_OVERLAY)
  game_mode:SetDraftingBanningTimeOverride(S.DRAFTING_BANNING_TIME)
  game_mode:SetDraftingHeroPickSelectTimeOverride(S.DRAFTING_HERO_PICK_SELECTION_TIME)
  game_mode:SetFixedRespawnTime(S.FIXED_RESPAWN_TIME)
  game_mode:SetFogOfWarDisabled(S.DISABLE_FOG_OF_WAR)
  game_mode:SetFountainConstantManaRegen(S.FOUNTAIN_CONSTANT_MANA_REGEN)
  game_mode:SetFountainPercentageHealthRegen(S.FOUNTAIN_PERCENTAGE_HEALTH_REGEN)
  game_mode:SetFountainPercentageManaRegen(S.FOUNTAIN_PERCENTAGE_MANA_REGEN)
  game_mode:SetFriendlyBuildingMoveToEnabled(S.ENABLE_FRIENDLY_BUILDING_MOVE_TO_CLICK)
  game_mode:SetGoldSoundDisabled(S.DISABLE_GOLD_SOUNDS)
  game_mode:SetHudCombatEventsDisabled(S.DISABLE_COMBAT_EVENTS_HUD)
  game_mode:SetKillingSpreeAnnouncerDisabled(S.DISABLE_KILLING_SPREE_ANNOUNCER)
  game_mode:SetLoseGoldOnDeath(S.LOSE_GOLD_ON_DEATH)
  game_mode:SetMaximumAttackSpeed(S.MAXIMUM_ATTACK_SPEED)
  game_mode:SetMinimumAttackSpeed(S.MINIMUM_ATTACK_SPEED)
  game_mode:SetPauseEnabled(S.ENABLE_PAUSE)
  game_mode:SetPowerRuneSpawnInterval(S.POWER_RUNE_SPAWN_INTERVAL)
  game_mode:SetRecommendedItemsDisabled(S.RECOMMENDED_BUILDS_DISABLED)
  game_mode:SetRemoveIllusionsOnDeath(S.REMOVE_ILLUSIONS_ON_DEATH)
  game_mode:SetRespawnTimeScale(S.RESPAWN_TIME_SCALE)
  game_mode:SetSelectionGoldPenaltyEnabled(S.ENABLE_SELECTION_GOLD_PENALTY)
  game_mode:SetStashPurchasingDisabled(S.DISABLE_STASH_PURCHASING)
  game_mode:SetStickyItemDisabled(S.DISABLE_STICKY_ITEM)
  game_mode:SetTopBarTeamValuesOverride(S.USE_CUSTOM_TOP_BAR_VALUES)
  game_mode:SetTopBarTeamValuesVisible(S.TOP_BAR_VISIBLE)
  game_mode:SetTowerBackdoorProtectionEnabled(S.ENABLE_TOWER_BACKDOOR_PROTECTION)
  game_mode:SetUnseenFogOfWarEnabled(S.USE_UNSEEN_FOG_OF_WAR)
  game_mode:SetUseDefaultDOTARuneSpawnLogic(S.USE_DEFAULT_DOTA_RUNE_SPAWN_LOGIC)
  game_mode:SetWeatherEffectsDisabled(S.DISABLE_WEATHER_EFFECTS)

  -- Must be set before `SetUseCustomHeroLevels`
  game_mode:SetCustomXPRequiredToReachNextLevel(S.XP_PER_LEVEL_TABLE)
  game_mode:SetUseCustomHeroLevels(S.USE_CUSTOM_HERO_LEVELS)

  -- gameMode:SetCustomAttributeDerivedStatValue(nStatType, flNewValue)
  -- gameMode:SetHUDVisible(iHUDElement, bVisible)
  -- gameMode:SetKillableTombstones(S.KILLABLE_TOMBSTONES)
  -- gameMode:SetTopBarTeamValue(iTeam, nValue)

  if S.FORCE_PICKED_HERO ~= nil then
    game_mode:SetCustomGameForceHero(S.FORCE_PICKED_HERO)
  end

  if S.CUSTOM_TERRAIN_WEATHER_EFFECT ~= nil then
    game_mode:SetCustomTerrainWeatherEffect(S.CUSTOM_TERRAIN_WEATHER_EFFECT)
  end

  for rune, spawn in pairs(S.ENABLED_RUNES) do
    game_mode:SetRuneEnabled(rune, spawn)
  end

  return game_mode
end

return M
