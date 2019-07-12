local Settings = require("const.settings")

--[[
  _OnGameRulesStateChange() is called when the overall game state has
  changed.
]]
function GameMode:_OnGameRulesStateChange(keys)
  if GameMode._reentrantCheck then
    return
  end

  local newState = GameRules:State_Get()

  if newState == DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD then
    self.seenWaitForPlayers = true
  elseif newState == DOTA_GAMERULES_STATE_HERO_SELECTION then
    self:PostLoadPrecache()
    self:OnAllPlayersLoaded()

    if Settings.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS then
      for i = 0, 9 do
        if PlayerResource:IsValidPlayer(i) then
          local color = Settings.TEAM_COLORS[PlayerResource:GetTeam(i)]
          PlayerResource:SetCustomPlayerColor(i, color[1], color[2], color[3])
        end
      end
    end
  elseif newState == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
    self:OnGameInProgress()
  end

  GameMode._reentrantCheck = true
  self:OnGameRulesStateChange(keys)
  GameMode._reentrantCheck = false
end

--[[
  _OnNPCSpawned() is called when an NPC has spawned somewhere in game,
  including heroes.
]]
function GameMode:_OnNPCSpawned(keys)
  if GameMode._reentrantCheck then
    return
  end

  local npc = EntIndexToHScript(keys.entindex)

  if npc:IsRealHero() and npc.bFirstSpawned == nil then
    npc.bFirstSpawned = true
    self:OnHeroInGame(npc)
  end

  GameMode._reentrantCheck = true
  self:OnNPCSpawned(keys)
  GameMode._reentrantCheck = false
end

--[[
  _OnEntityKilled() is called when an entity was killed.
]]
function GameMode:_OnEntityKilled(keys)
  if GameMode._reentrantCheck then
    return
  end

  -- The Unit that was Killed
  local killedUnit = EntIndexToHScript(keys.entindex_killed)
  -- The Killing entity
  local killerEntity = nil

  if keys.entindex_attacker ~= nil then
    killerEntity = EntIndexToHScript(keys.entindex_attacker)
  end

  if killedUnit:IsRealHero() then
    self:d("KILLED:", killedUnit:GetName(), "KILLER:", killerEntity:GetName())

    if Settings.END_GAME_ON_KILLS then
      if GetTeamHeroKills(killerEntity:GetTeam()) >= Settings.KILLS_TO_END_GAME_FOR_TEAM then
        GameRules:SetSafeToLeave(true)
        GameRules:SetGameWinner(killerEntity:GetTeam())
      end
    end

    --PlayerResource:GetTeamKills
    if Settings.SHOW_KILLS_ON_TOPBAR then
      GameRules:GetGameModeEntity():SetTopBarTeamValue(DOTA_TEAM_BADGUYS, GetTeamHeroKills(DOTA_TEAM_BADGUYS))
      GameRules:GetGameModeEntity():SetTopBarTeamValue(DOTA_TEAM_GOODGUYS, GetTeamHeroKills(DOTA_TEAM_GOODGUYS))
    end
  end

  GameMode._reentrantCheck = true
  self:OnEntityKilled(keys)
  GameMode._reentrantCheck = false
end

--[[
  _OnConnectFull() is called once when the player fully connects and becomes
  "Ready" during loading.
]]
function GameMode:_OnConnectFull(keys)
  if GameMode._reentrantCheck then
    return
  end

  self:_CaptureGameMode()

  local entIndex = keys.index + 1
  local player = EntIndexToHScript(entIndex)
  local userID = keys.userid

  self.users = self.users or {}
  self.users[userID] = player

  self.players = self.players or {}
  self.players[player:GetPlayerID()] = player

  GameMode._reentrantCheck = true
  self:OnConnectFull(keys)
  GameMode._reentrantCheck = false
end

--[[
  _CaptureGameMode() is called as the first player loads and sets up the
  GameMode parameters.
]]
function GameMode:_CaptureGameMode()
  if self.gameMode ~= nil then
    return
  end

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

  self:OnFirstPlayerLoaded()
end
