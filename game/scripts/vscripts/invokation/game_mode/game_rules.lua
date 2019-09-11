--- GameRules Setup
-- @submodule invokation.GameMode

local S = require("invokation.const.settings")

--- GameRules Setup
-- @section game_rules

function GameMode:setupGameRules()
  GameRules:SetCreepMinimapIconScale(S.MINIMAP_CREEP_ICON_SIZE)
  GameRules:SetCustomGameEndDelay(S.GAME_END_DELAY)
  GameRules:SetCustomVictoryMessageDuration(S.VICTORY_MESSAGE_DURATION)
  GameRules:SetFirstBloodActive(S.ENABLE_FIRST_BLOOD)
  GameRules:SetGoldPerTick(S.GOLD_PER_TICK)
  GameRules:SetGoldTickTime(S.GOLD_TICK_TIME)
  GameRules:SetHeroMinimapIconScale(S.MINIMAP_ICON_SIZE)
  GameRules:SetHeroRespawnEnabled(S.ENABLE_HERO_RESPAWN)
  GameRules:SetHeroSelectionTime(S.HERO_SELECTION_TIME)
  GameRules:SetHideKillMessageHeaders(S.HIDE_KILL_BANNERS)
  GameRules:SetPostGameTime(S.POST_GAME_TIME)
  GameRules:SetPreGameTime(S.PRE_GAME_TIME)
  GameRules:SetRuneMinimapIconScale(S.MINIMAP_RUNE_ICON_SIZE)
  GameRules:SetRuneSpawnTime(S.RUNE_SPAWN_TIME)
  GameRules:SetSameHeroSelectionEnabled(S.ALLOW_SAME_HERO_SELECTION)
  GameRules:SetStartingGold(S.STARTING_GOLD)
  GameRules:SetTreeRegrowTime(S.TREE_REGROW_TIME)
  GameRules:SetUseBaseGoldBountyOnHeroes(S.USE_STANDARD_HERO_GOLD_BOUNTY)
  GameRules:SetUseCustomHeroXPValues(S.USE_CUSTOM_XP_VALUES)
  GameRules:SetUseUniversalShopMode(S.UNIVERSAL_SHOP_MODE)

  if S.SKIP_TEAM_SETUP then
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

  self:d("  setup GameRules")
end
