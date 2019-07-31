--- GameMode Setup
-- @submodule invokation.GameMode

local S = require("invokation.const.settings")

--- GameMode Setup
-- @section game_mode

function GameMode:setupGameMode()
  self.gameMode = GameRules:GetGameModeEntity()

  self.gameMode:SetAlwaysShowPlayerInventory(S.SHOW_ONLY_PLAYER_INVENTORY)
  self.gameMode:SetAnnouncerDisabled(S.DISABLE_ANNOUNCER)
  self.gameMode:SetBotThinkingEnabled(S.USE_STANDARD_DOTA_BOT_THINKING)
  self.gameMode:SetBuybackEnabled(S.BUYBACK_ENABLED)
  self.gameMode:SetCameraDistanceOverride(S.CAMERA_DISTANCE_OVERRIDE)
  self.gameMode:SetCustomBuybackCooldownEnabled(S.CUSTOM_BUYBACK_COOLDOWN_ENABLED)
  self.gameMode:SetCustomBuybackCostEnabled(S.CUSTOM_BUYBACK_COST_ENABLED)
  self.gameMode:SetCustomXPRequiredToReachNextLevel(S.XP_PER_LEVEL_TABLE)
  self.gameMode:SetDaynightCycleDisabled(S.DISABLE_DAY_NIGHT_CYCLE)
  self.gameMode:SetFixedRespawnTime(S.FIXED_RESPAWN_TIME)
  self.gameMode:SetFogOfWarDisabled(S.DISABLE_FOG_OF_WAR_ENTIRELY)
  self.gameMode:SetFountainConstantManaRegen(S.FOUNTAIN_CONSTANT_MANA_REGEN)
  self.gameMode:SetFountainPercentageHealthRegen(S.FOUNTAIN_PERCENTAGE_HEALTH_REGEN)
  self.gameMode:SetFountainPercentageManaRegen(S.FOUNTAIN_PERCENTAGE_MANA_REGEN)
  self.gameMode:SetGoldSoundDisabled(S.DISABLE_GOLD_SOUNDS)
  self.gameMode:SetKillingSpreeAnnouncerDisabled(S.DISABLE_KILLING_SPREE_ANNOUNCER)
  self.gameMode:SetLoseGoldOnDeath(S.LOSE_GOLD_ON_DEATH)
  self.gameMode:SetMaximumAttackSpeed(S.MAXIMUM_ATTACK_SPEED)
  self.gameMode:SetMinimumAttackSpeed(S.MINIMUM_ATTACK_SPEED)
  self.gameMode:SetRecommendedItemsDisabled(S.RECOMMENDED_BUILDS_DISABLED)
  self.gameMode:SetRemoveIllusionsOnDeath(S.REMOVE_ILLUSIONS_ON_DEATH)
  self.gameMode:SetStashPurchasingDisabled(S.DISABLE_STASH_PURCHASING)
  self.gameMode:SetStickyItemDisabled(S.DISABLE_STICKY_ITEM)
  self.gameMode:SetTopBarTeamValuesOverride(S.USE_CUSTOM_TOP_BAR_VALUES)
  self.gameMode:SetTopBarTeamValuesVisible(S.TOP_BAR_VISIBLE)
  self.gameMode:SetTowerBackdoorProtectionEnabled(S.ENABLE_TOWER_BACKDOOR_PROTECTION)
  self.gameMode:SetUnseenFogOfWarEnabled(S.USE_UNSEEN_FOG_OF_WAR)
  self.gameMode:SetUseCustomHeroLevels(S.USE_CUSTOM_HERO_LEVELS)

  if S.FORCE_PICKED_HERO ~= nil then
    self.gameMode:SetCustomGameForceHero(S.FORCE_PICKED_HERO)
  end

  for rune, spawn in pairs(S.ENABLED_RUNES) do
    self.gameMode:SetRuneEnabled(rune, spawn)
  end

  self:d("  setup GameMode")
end
