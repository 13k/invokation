local Settings = require("const.settings")

function GameMode:setupGameRules()
  GameRules:SetHeroRespawnEnabled(Settings.ENABLE_HERO_RESPAWN)
  GameRules:SetUseUniversalShopMode(Settings.UNIVERSAL_SHOP_MODE)
  GameRules:SetSameHeroSelectionEnabled(Settings.ALLOW_SAME_HERO_SELECTION)
  GameRules:SetHeroSelectionTime(Settings.HERO_SELECTION_TIME)
  GameRules:SetPreGameTime(Settings.PRE_GAME_TIME)
  GameRules:SetPostGameTime(Settings.POST_GAME_TIME)
  GameRules:SetTreeRegrowTime(Settings.TREE_REGROW_TIME)
  GameRules:SetUseCustomHeroXPValues(Settings.USE_CUSTOM_XP_VALUES)
  GameRules:SetGoldPerTick(Settings.GOLD_PER_TICK)
  GameRules:SetGoldTickTime(Settings.GOLD_TICK_TIME)
  GameRules:SetRuneSpawnTime(Settings.RUNE_SPAWN_TIME)
  GameRules:SetUseBaseGoldBountyOnHeroes(Settings.USE_STANDARD_HERO_GOLD_BOUNTY)
  GameRules:SetHeroMinimapIconScale(Settings.MINIMAP_ICON_SIZE)
  GameRules:SetCreepMinimapIconScale(Settings.MINIMAP_CREEP_ICON_SIZE)
  GameRules:SetRuneMinimapIconScale(Settings.MINIMAP_RUNE_ICON_SIZE)
  GameRules:SetFirstBloodActive(Settings.ENABLE_FIRST_BLOOD)
  GameRules:SetHideKillMessageHeaders(Settings.HIDE_KILL_BANNERS)
  GameRules:SetCustomGameEndDelay(Settings.GAME_END_DELAY)
  GameRules:SetCustomVictoryMessageDuration(Settings.VICTORY_MESSAGE_DURATION)
  GameRules:SetStartingGold(Settings.STARTING_GOLD)

  if Settings.SKIP_TEAM_SETUP then
    GameRules:SetCustomGameSetupAutoLaunchDelay(0)
    GameRules:LockCustomGameSetupTeamAssignment(true)
    GameRules:EnableCustomGameSetupAutoLaunch(true)
  else
    GameRules:SetCustomGameSetupAutoLaunchDelay(Settings.AUTO_LAUNCH_DELAY)
    GameRules:LockCustomGameSetupTeamAssignment(Settings.LOCK_TEAM_SETUP)
    GameRules:EnableCustomGameSetupAutoLaunch(Settings.ENABLE_AUTO_LAUNCH)
  end

  for team, number in pairs(Settings.CUSTOM_TEAM_PLAYER_COUNT) do
    GameRules:SetCustomGameTeamMaxPlayers(team, number)
  end

  if Settings.USE_CUSTOM_TEAM_COLORS then
    for team, color in pairs(Settings.TEAM_COLORS) do
      SetTeamCustomHealthbarColor(team, color[1], color[2], color[3])
    end
  end

  self:d("  setup GameRules")
end
