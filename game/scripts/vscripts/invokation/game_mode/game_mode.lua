--- GameMode Setup
-- @submodule invokation.GameMode

local S = require("invokation.const.settings")

--- GameMode Setup
-- @section game_mode

function GameMode:setupGameMode()
  self.gameMode = GameRules:GetGameModeEntity()

  self.gameMode:SetAlwaysShowPlayerInventory(S.ALWAYS_SHOW_PLAYER_INVENTORY)
  self.gameMode:SetAlwaysShowPlayerNames(S.ALWAYS_SHOW_PLAYER_NAMES)
  self.gameMode:SetAnnouncerDisabled(S.DISABLE_ANNOUNCER)
  self.gameMode:SetBotThinkingEnabled(S.USE_STANDARD_DOTA_BOT_THINKING)
  self.gameMode:SetBotsAlwaysPushWithHuman(S.BOTS_ALWAYS_PUSH_WITH_HUMAN)
  self.gameMode:SetBotsInLateGame(S.BOTS_LATE_GAME_BEHAVIOR)
  self.gameMode:SetBotsMaxPushTier(S.BOTS_MAX_PUSH_TIER)
  self.gameMode:SetBountyRuneSpawnInterval(S.BOUNTY_RUNE_SPAWN_INTERVAL)
  self.gameMode:SetBuybackEnabled(S.BUYBACK_ENABLED)
  self.gameMode:SetCameraDistanceOverride(S.CAMERA_DISTANCE_OVERRIDE)
  self.gameMode:SetCameraSmoothCountOverride(S.CAMERA_SMOOTH_COUNT)
  self.gameMode:SetCustomBackpackCooldownPercent(S.CUSTOM_BACKPACK_COOLDOWN_PERCENT)
  self.gameMode:SetCustomBackpackSwapCooldown(S.CUSTOM_BACKPACK_SWAP_COOLDOWN)
  self.gameMode:SetCustomBuybackCooldownEnabled(S.CUSTOM_BUYBACK_COOLDOWN_ENABLED)
  self.gameMode:SetCustomBuybackCostEnabled(S.CUSTOM_BUYBACK_COST_ENABLED)
  self.gameMode:SetCustomGlyphCooldown(S.CUSTOM_GLYPH_COOLDOWN)
  self.gameMode:SetCustomScanCooldown(S.CUSTOM_SCAN_COOLDOWN)
  self.gameMode:SetDaynightCycleDisabled(S.DISABLE_DAY_NIGHT_CYCLE)
  self.gameMode:SetDeathOverlayDisabled(S.DISABLE_DEATH_OVERLAY)
  self.gameMode:SetDraftingBanningTimeOverride(S.DRAFTING_BANNING_TIME)
  self.gameMode:SetDraftingHeroPickSelectTimeOverride(S.DRAFTING_HERO_PICK_SELECTION_TIME)
  self.gameMode:SetFixedRespawnTime(S.FIXED_RESPAWN_TIME)
  self.gameMode:SetFogOfWarDisabled(S.DISABLE_FOG_OF_WAR)
  self.gameMode:SetFountainConstantManaRegen(S.FOUNTAIN_CONSTANT_MANA_REGEN)
  self.gameMode:SetFountainPercentageHealthRegen(S.FOUNTAIN_PERCENTAGE_HEALTH_REGEN)
  self.gameMode:SetFountainPercentageManaRegen(S.FOUNTAIN_PERCENTAGE_MANA_REGEN)
  self.gameMode:SetFriendlyBuildingMoveToEnabled(S.ENABLE_FRIENDLY_BUILDING_MOVE_TO_CLICK)
  self.gameMode:SetGoldSoundDisabled(S.DISABLE_GOLD_SOUNDS)
  self.gameMode:SetHudCombatEventsDisabled(S.DISABLE_COMBAT_EVENTS_HUD)
  self.gameMode:SetKillingSpreeAnnouncerDisabled(S.DISABLE_KILLING_SPREE_ANNOUNCER)
  self.gameMode:SetLoseGoldOnDeath(S.LOSE_GOLD_ON_DEATH)
  self.gameMode:SetMaximumAttackSpeed(S.MAXIMUM_ATTACK_SPEED)
  self.gameMode:SetMinimumAttackSpeed(S.MINIMUM_ATTACK_SPEED)
  self.gameMode:SetPauseEnabled(S.ENABLE_PAUSE)
  self.gameMode:SetPowerRuneSpawnInterval(S.POWER_RUNE_SPAWN_INTERVAL)
  self.gameMode:SetRecommendedItemsDisabled(S.RECOMMENDED_BUILDS_DISABLED)
  self.gameMode:SetRemoveIllusionsOnDeath(S.REMOVE_ILLUSIONS_ON_DEATH)
  self.gameMode:SetRespawnTimeScale(S.RESPAWN_TIME_SCALE)
  self.gameMode:SetSelectionGoldPenaltyEnabled(S.ENABLE_SELECTION_GOLD_PENALTY)
  self.gameMode:SetStashPurchasingDisabled(S.DISABLE_STASH_PURCHASING)
  self.gameMode:SetStickyItemDisabled(S.DISABLE_STICKY_ITEM)
  self.gameMode:SetTopBarTeamValuesOverride(S.USE_CUSTOM_TOP_BAR_VALUES)
  self.gameMode:SetTopBarTeamValuesVisible(S.TOP_BAR_VISIBLE)
  self.gameMode:SetTowerBackdoorProtectionEnabled(S.ENABLE_TOWER_BACKDOOR_PROTECTION)
  self.gameMode:SetUnseenFogOfWarEnabled(S.USE_UNSEEN_FOG_OF_WAR)
  self.gameMode:SetUseDefaultDOTARuneSpawnLogic(S.USE_DEFAULT_DOTA_RUNE_SPAWN_LOGIC)
  self.gameMode:SetWeatherEffectsDisabled(S.DISABLE_WEATHER_EFFECTS)

  self.gameMode:SetCustomXPRequiredToReachNextLevel(S.XP_PER_LEVEL_TABLE) -- Must be set before `SetUseCustomHeroLevels`
  self.gameMode:SetUseCustomHeroLevels(S.USE_CUSTOM_HERO_LEVELS)

  -- self.gameMode:SetCustomAttributeDerivedStatValue(nStatType, flNewValue)
  -- self.gameMode:SetHUDVisible(iHUDElement, bVisible)
  -- self.gameMode:SetKillableTombstones(S.KILLABLE_TOMBSTONES)
  -- self.gameMode:SetTopBarTeamValue(iTeam, nValue)

  if S.FORCE_PICKED_HERO ~= nil then
    self.gameMode:SetCustomGameForceHero(S.FORCE_PICKED_HERO)
  end

  if S.CUSTOM_TERRAIN_WEATHER_EFFECT ~= nil then
    self.gameMode:SetCustomTerrainWeatherEffect(S.CUSTOM_TERRAIN_WEATHER_EFFECT)
  end

  for rune, spawn in pairs(S.ENABLED_RUNES) do
    self.gameMode:SetRuneEnabled(rune, spawn)
  end

  self:d("  setup GameMode")
end
