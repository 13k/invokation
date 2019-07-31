--- GameRules Setup
-- @submodule invokation.GameMode

local S = require("invokation.const.settings")

--- GameRules Setup
-- @section game_rules

function GameMode:setupGameRules()
  GameRules:SetHeroRespawnEnabled(S.ENABLE_HERO_RESPAWN)
  GameRules:SetUseUniversalShopMode(S.UNIVERSAL_SHOP_MODE)
  GameRules:SetSameHeroSelectionEnabled(S.ALLOW_SAME_HERO_SELECTION)
  GameRules:SetHeroSelectionTime(S.HERO_SELECTION_TIME)
  GameRules:SetPreGameTime(S.PRE_GAME_TIME)
  GameRules:SetPostGameTime(S.POST_GAME_TIME)
  GameRules:SetTreeRegrowTime(S.TREE_REGROW_TIME)
  GameRules:SetUseCustomHeroXPValues(S.USE_CUSTOM_XP_VALUES)
  GameRules:SetGoldPerTick(S.GOLD_PER_TICK)
  GameRules:SetGoldTickTime(S.GOLD_TICK_TIME)
  GameRules:SetRuneSpawnTime(S.RUNE_SPAWN_TIME)
  GameRules:SetUseBaseGoldBountyOnHeroes(S.USE_STANDARD_HERO_GOLD_BOUNTY)
  GameRules:SetHeroMinimapIconScale(S.MINIMAP_ICON_SIZE)
  GameRules:SetCreepMinimapIconScale(S.MINIMAP_CREEP_ICON_SIZE)
  GameRules:SetRuneMinimapIconScale(S.MINIMAP_RUNE_ICON_SIZE)
  GameRules:SetFirstBloodActive(S.ENABLE_FIRST_BLOOD)
  GameRules:SetHideKillMessageHeaders(S.HIDE_KILL_BANNERS)
  GameRules:SetCustomGameEndDelay(S.GAME_END_DELAY)
  GameRules:SetCustomVictoryMessageDuration(S.VICTORY_MESSAGE_DURATION)
  GameRules:SetStartingGold(S.STARTING_GOLD)

  if S.SKIP_TEAM_SETUP then
    GameRules:SetCustomGameSetupAutoLaunchDelay(0)
    GameRules:LockCustomGameSetupTeamAssignment(true)
    GameRules:EnableCustomGameSetupAutoLaunch(true)
  else
    GameRules:SetCustomGameSetupAutoLaunchDelay(S.AUTO_LAUNCH_DELAY)
    GameRules:LockCustomGameSetupTeamAssignment(S.LOCK_TEAM_SETUP)
    GameRules:EnableCustomGameSetupAutoLaunch(S.ENABLE_AUTO_LAUNCH)
  end

  for team, number in pairs(S.CUSTOM_TEAM_PLAYER_COUNT) do
    GameRules:SetCustomGameTeamMaxPlayers(team, number)
  end

  if S.USE_CUSTOM_TEAM_COLORS then
    for team, color in pairs(S.TEAM_COLORS) do
      SetTeamCustomHealthbarColor(team, color[1], color[2], color[3])
    end
  end

  self:d("  setup GameRules")
end
