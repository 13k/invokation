---
-- @submodule invokation.GameMode

--- Internal Game Events Listeners
-- @section internal_game_events

local Settings = require("invokation.const.settings")

--- Called when the overall game state has changed.
-- @tparam table payload
function GameMode:_OnGameRulesStateChange(payload)
  if GameMode._reentrantCheck then
    return
  end

  local state = GameRules:State_Get()

  GameMode._reentrantCheck = true
  self:OnGameRulesStateChange(payload)
  GameMode._reentrantCheck = false

  if state == DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD then
    self.seenWaitForPlayers = true
  elseif state == DOTA_GAMERULES_STATE_HERO_SELECTION then
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
  elseif state == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
    self:OnGameInProgress()
  end
end

--- Called once when the player fully connects and becomes "Ready" during loading.
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam int payload.userid User ID
function GameMode:_OnConnectFull(payload)
  self:d("_OnConnectFull", payload)

  if GameMode._reentrantCheck then
    return
  end

  self:_CaptureGameMode()

  local player = PlayerResource:GetPlayer(payload.PlayerID)

  self.users = self.users or {}
  self.users[payload.userid] = player

  self.players = self.players or {}
  self.players[player:GetPlayerID()] = player

  GameMode._reentrantCheck = true
  self:OnConnectFull(player)
  GameMode._reentrantCheck = false
end

--- Called as the first player loads and sets up the GameMode parameters.
function GameMode:_CaptureGameMode()
  if self.gameMode ~= nil then
    return
  end

  self:d("_CaptureGameMode")

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

--- Called when an NPC has spawned somewhere in game, including heroes.
-- @tparam table payload
-- @tparam int payload.entindex Unit entity index
function GameMode:_OnNPCSpawned(payload)
  self:d("_OnNPCSpawned", payload)

  if GameMode._reentrantCheck then
    return
  end

  local npc = EntIndexToHScript(payload.entindex)

  if npc:IsRealHero() and npc.bFirstSpawned == nil then
    npc.bFirstSpawned = true
    self:OnHeroInGame(npc)
  end

  GameMode._reentrantCheck = true
  self:OnNPCSpawned(npc)
  GameMode._reentrantCheck = false
end

--- Called when an entity was killed.
-- @tparam table payload
-- @tparam int payload.entindex_killed Victim (unit) entity index
-- @tparam[opt] int payload.entindex_attacker Attacker (unit) entity index
-- @tparam[opt] int payload.entindex_inflictor Inflictor (item, ability, etc) entity index
function GameMode:_OnEntityKilled(payload)
  self:d("_OnEntityKilled", payload)

  if GameMode._reentrantCheck then
    return
  end

  local killed = EntIndexToHScript(payload.entindex_killed)
  local attacker = nil
  local inflictor = nil

  if payload.entindex_attacker ~= nil then
    attacker = EntIndexToHScript(payload.entindex_attacker)
  end

  if payload.entindex_inflictor ~= nil then
    inflictor = EntIndexToHScript(payload.entindex_inflictor)
  end

  if killed:IsRealHero() then
    if Settings.END_GAME_ON_KILLS and attacker ~= nil then
      local attackerTeam = attacker:GetTeam()
      if GetTeamHeroKills(attackerTeam) >= Settings.KILLS_TO_END_GAME_FOR_TEAM then
        GameRules:SetSafeToLeave(true)
        GameRules:SetGameWinner(attackerTeam)
      end
    end

    if Settings.SHOW_KILLS_ON_TOPBAR then
      GameRules:GetGameModeEntity():SetTopBarTeamValue(DOTA_TEAM_BADGUYS, GetTeamHeroKills(DOTA_TEAM_BADGUYS))
      GameRules:GetGameModeEntity():SetTopBarTeamValue(DOTA_TEAM_GOODGUYS, GetTeamHeroKills(DOTA_TEAM_GOODGUYS))
    end
  end

  GameMode._reentrantCheck = true
  self:OnEntityKilled(killed, attacker, inflictor)
  GameMode._reentrantCheck = false
end
