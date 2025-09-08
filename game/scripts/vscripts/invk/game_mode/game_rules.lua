local Env = require("invk.game_mode.env")
local S = require("invk.const.settings")

local M = {}

--- @param env invk.Env
function M.setup(env)
  ----- states

  -- launch

  if env == Env.DEVELOPMENT then
    GameRules:EnableCustomGameSetupAutoLaunch(true)
    GameRules:LockCustomGameSetupTeamAssignment(true)
    GameRules:SetCustomGameSetupAutoLaunchDelay(0)
  else
    GameRules:EnableCustomGameSetupAutoLaunch(S.ENABLE_AUTO_LAUNCH)
    GameRules:LockCustomGameSetupTeamAssignment(S.LOCK_TEAM_SETUP)
    GameRules:SetCustomGameSetupAutoLaunchDelay(S.AUTO_LAUNCH_DELAY)
  end

  -- custom game setup

  GameRules:SetCustomGameSetupRemainingTime(S.GAME_SETUP_TIME)
  GameRules:SetCustomGameSetupTimeout(S.GAME_SETUP_TIMEOUT)

  -- hero selection

  GameRules:SetHeroSelectionTime(S.HERO_SELECTION_TIME)
  GameRules:SetHeroSelectPenaltyTime(S.HERO_SELECTION_PENALTY_TIME)
  GameRules:SetSameHeroSelectionEnabled(S.ALLOW_SAME_HERO_SELECTION)

  -- strategy

  GameRules:SetStrategyTime(S.STRATEGY_TIME)

  -- showcase

  GameRules:SetShowcaseTime(S.SHOWCASE_TIME)

  -- pre-game

  GameRules:SetPreGameTime(S.PRE_GAME_TIME)

  -- post-game

  GameRules:SetPostGameTime(S.POST_GAME_TIME)

  -- custom game end

  GameRules:SetCustomGameEndDelay(S.GAME_END_DELAY)

  ----- settings

  GameRules:SetCreepMinimapIconScale(S.MINIMAP_CREEP_ICON_SCALE)
  GameRules:SetCreepSpawningEnabled(S.ENABLE_CREEP_SPAWN)
  GameRules:SetCustomGameAllowBattleMusic(S.ENABLE_BATTLE_MUSIC)
  GameRules:SetCustomGameAllowHeroPickMusic(S.ENABLE_HERO_PICK_MUSIC)
  GameRules:SetCustomGameAllowMusicAtGameStart(S.ENABLE_GAME_START_MUSIC)
  GameRules:SetFirstBloodActive(S.ENABLE_FIRST_BLOOD)
  GameRules:SetGoldPerTick(S.GOLD_PER_TICK)
  GameRules:SetGoldTickTime(S.GOLD_TICK_TIME)
  GameRules:SetHeroMinimapIconScale(S.MINIMAP_HERO_ICON_SCALE)
  GameRules:SetHeroRespawnEnabled(S.ENABLE_HERO_RESPAWN)
  GameRules:SetHideKillMessageHeaders(S.HIDE_KILL_BANNERS)
  GameRules:SetRuneMinimapIconScale(S.MINIMAP_RUNE_ICON_SCALE)
  GameRules:SetRuneSpawnTime(S.RUNE_SPAWN_TIME)
  GameRules:SetStartingGold(S.STARTING_GOLD)
  GameRules:SetTreeRegrowTime(S.TREE_REGROW_TIME)
  GameRules:SetUseBaseGoldBountyOnHeroes(S.USE_BASE_HERO_GOLD_BOUNTY)
  GameRules:SetUseCustomHeroXPValues(S.USE_CUSTOM_XP_VALUES)
  GameRules:SetUseUniversalShopMode(S.UNIVERSAL_SHOP_MODE)

  if S.VICTORY_MESSAGE ~= nil then
    GameRules:SetCustomVictoryMessage(S.VICTORY_MESSAGE)
    GameRules:SetCustomVictoryMessageDuration(S.VICTORY_MESSAGE_DURATION)
  end

  for team, number in pairs(S.CUSTOM_TEAM_PLAYER_COUNT) do
    GameRules:SetCustomGameTeamMaxPlayers(team, number)
  end

  if S.USE_CUSTOM_TEAM_COLORS then
    for team, color in pairs(S.TEAM_COLORS) do
      SetTeamCustomHealthbarColor(team, color[1], color[2], color[3])
    end
  end
end

return M
