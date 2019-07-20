--- GameMode Setup
-- @submodule invokation.GameMode

local Settings = require("invokation.const.settings")

--- GameMode Setup
-- @section game_mode

function GameMode:setupGameMode()
  self.gameMode = GameRules:GetGameModeEntity()

  self.gameMode:SetRecommendedItemsDisabled(Settings.RECOMMENDED_BUILDS_DISABLED)
  self.gameMode:SetCameraDistanceOverride(Settings.CAMERA_DISTANCE_OVERRIDE)
  self.gameMode:SetCustomBuybackCostEnabled(Settings.CUSTOM_BUYBACK_COST_ENABLED)
  self.gameMode:SetCustomBuybackCooldownEnabled(Settings.CUSTOM_BUYBACK_COOLDOWN_ENABLED)
  self.gameMode:SetBuybackEnabled(Settings.BUYBACK_ENABLED)
  self.gameMode:SetTopBarTeamValuesOverride(Settings.USE_CUSTOM_TOP_BAR_VALUES)
  self.gameMode:SetTopBarTeamValuesVisible(Settings.TOP_BAR_VISIBLE)
  self.gameMode:SetUseCustomHeroLevels(Settings.USE_CUSTOM_HERO_LEVELS)
  self.gameMode:SetCustomXPRequiredToReachNextLevel(Settings.XP_PER_LEVEL_TABLE)
  self.gameMode:SetBotThinkingEnabled(Settings.USE_STANDARD_DOTA_BOT_THINKING)
  self.gameMode:SetTowerBackdoorProtectionEnabled(Settings.ENABLE_TOWER_BACKDOOR_PROTECTION)
  self.gameMode:SetFogOfWarDisabled(Settings.DISABLE_FOG_OF_WAR_ENTIRELY)
  self.gameMode:SetGoldSoundDisabled(Settings.DISABLE_GOLD_SOUNDS)
  self.gameMode:SetRemoveIllusionsOnDeath(Settings.REMOVE_ILLUSIONS_ON_DEATH)
  self.gameMode:SetAlwaysShowPlayerInventory(Settings.SHOW_ONLY_PLAYER_INVENTORY)
  self.gameMode:SetAnnouncerDisabled(Settings.DISABLE_ANNOUNCER)

  if Settings.FORCE_PICKED_HERO ~= nil then
    self.gameMode:SetCustomGameForceHero(Settings.FORCE_PICKED_HERO)
  end

  self.gameMode:SetFixedRespawnTime(Settings.FIXED_RESPAWN_TIME)
  self.gameMode:SetFountainConstantManaRegen(Settings.FOUNTAIN_CONSTANT_MANA_REGEN)
  self.gameMode:SetFountainPercentageHealthRegen(Settings.FOUNTAIN_PERCENTAGE_HEALTH_REGEN)
  self.gameMode:SetFountainPercentageManaRegen(Settings.FOUNTAIN_PERCENTAGE_MANA_REGEN)
  self.gameMode:SetLoseGoldOnDeath(Settings.LOSE_GOLD_ON_DEATH)
  self.gameMode:SetMaximumAttackSpeed(Settings.MAXIMUM_ATTACK_SPEED)
  self.gameMode:SetMinimumAttackSpeed(Settings.MINIMUM_ATTACK_SPEED)
  self.gameMode:SetStashPurchasingDisabled(Settings.DISABLE_STASH_PURCHASING)

  for rune, spawn in pairs(Settings.ENABLED_RUNES) do
    self.gameMode:SetRuneEnabled(rune, spawn)
  end

  self.gameMode:SetUnseenFogOfWarEnabled(Settings.USE_UNSEEN_FOG_OF_WAR)
  self.gameMode:SetDaynightCycleDisabled(Settings.DISABLE_DAY_NIGHT_CYCLE)
  self.gameMode:SetKillingSpreeAnnouncerDisabled(Settings.DISABLE_KILLING_SPREE_ANNOUNCER)
  self.gameMode:SetStickyItemDisabled(Settings.DISABLE_STICKY_ITEM)

  self:d("  setup GameMode")
end
