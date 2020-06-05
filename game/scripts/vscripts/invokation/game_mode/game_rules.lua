--- GameRules Setup
-- @submodule invokation.GameMode

--- GameRules Setup
-- @section game_rules

local S = require("invokation.const.settings")

function GameMode:setupGameRules()
  GameRules:SetCreepMinimapIconScale(S.MINIMAP_CREEP_ICON_SCALE)
  GameRules:SetCreepSpawningEnabled(S.ENABLE_CREEP_SPAWN)
  GameRules:SetCustomGameAllowBattleMusic(S.ENABLE_BATTLE_MUSIC)
  GameRules:SetCustomGameAllowHeroPickMusic(S.ENABLE_HERO_PICK_MUSIC)
  GameRules:SetCustomGameAllowMusicAtGameStart(S.ENABLE_GAME_START_MUSIC)
  GameRules:SetCustomGameEndDelay(S.GAME_END_DELAY)
  GameRules:SetCustomGameSetupRemainingTime(S.GAME_SETUP_TIME)
  GameRules:SetCustomGameSetupTimeout(S.GAME_SETUP_TIMEOUT)
  GameRules:SetCustomVictoryMessage(S.VICTORY_MESSAGE)
  GameRules:SetCustomVictoryMessageDuration(S.VICTORY_MESSAGE_DURATION)
  GameRules:SetFirstBloodActive(S.ENABLE_FIRST_BLOOD)
  GameRules:SetGoldPerTick(S.GOLD_PER_TICK)
  GameRules:SetGoldTickTime(S.GOLD_TICK_TIME)
  GameRules:SetHeroMinimapIconScale(S.MINIMAP_HERO_ICON_SCALE)
  GameRules:SetHeroRespawnEnabled(S.ENABLE_HERO_RESPAWN)
  GameRules:SetHeroSelectionTime(S.HERO_SELECTION_TIME)
  GameRules:SetHeroSelectPenaltyTime(S.HERO_SELECTION_PENALTY_TIME)
  GameRules:SetHideKillMessageHeaders(S.HIDE_KILL_BANNERS)
  GameRules:SetPostGameTime(S.POST_GAME_TIME)
  GameRules:SetPreGameTime(S.PRE_GAME_TIME)
  GameRules:SetRuneMinimapIconScale(S.MINIMAP_RUNE_ICON_SCALE)
  GameRules:SetRuneSpawnTime(S.RUNE_SPAWN_TIME)
  GameRules:SetSameHeroSelectionEnabled(S.ALLOW_SAME_HERO_SELECTION)
  GameRules:SetShowcaseTime(S.SHOWCASE_TIME)
  GameRules:SetStartingGold(S.STARTING_GOLD)
  GameRules:SetStrategyTime(S.STRATEGY_TIME)
  GameRules:SetTreeRegrowTime(S.TREE_REGROW_TIME)
  GameRules:SetUseBaseGoldBountyOnHeroes(S.USE_BASE_HERO_GOLD_BOUNTY)
  GameRules:SetUseCustomHeroXPValues(S.USE_CUSTOM_XP_VALUES)
  GameRules:SetUseUniversalShopMode(S.UNIVERSAL_SHOP_MODE)

  if self.env.development then
    GameRules:EnableCustomGameSetupAutoLaunch(true)
    GameRules:LockCustomGameSetupTeamAssignment(true)
    GameRules:SetCustomGameSetupAutoLaunchDelay(0)
  else
    GameRules:EnableCustomGameSetupAutoLaunch(S.ENABLE_AUTO_LAUNCH)
    GameRules:LockCustomGameSetupTeamAssignment(S.LOCK_TEAM_SETUP)
    GameRules:SetCustomGameSetupAutoLaunchDelay(S.AUTO_LAUNCH_DELAY)
  end

  for team, number in pairs(S.CUSTOM_TEAM_PLAYER_COUNT) do
    GameRules:SetCustomGameTeamMaxPlayers(team, number)
  end

  if S.USE_CUSTOM_TEAM_COLORS then
    for team, color in pairs(S.TEAM_COLORS) do
      SetTeamCustomHealthbarColor(team, color[1], color[2], color[3])
    end
  end

  -- Sets a callback to handle saving custom game account records (callback is
  -- passed a player id and should return a flat simple table) [Preview/Unreleased]
  -- GameRules:SetCustomGameAccountRecordSaveFunction(handle, handle)

  -- Set the difficulty level of the custom game mode
  -- GameRules:SetCustomGameDifficulty(int)

  -- Event-only (table hMetadataTable)
  -- GameRules:SetEventMetadataCustomTable(handle)

  -- Event-only (table hMetadataTable)
  -- GameRules:SetEventSignoutCustomTable(handle)

  self:d("  setup GameRules")
end