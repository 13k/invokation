--- Game settings.
-- @module invokation.const.settings

local UNITS = require("invokation.const.units")

local M = {}

--- Control if the normal DOTA hero respawn rules apply.
--
-- If disabled, heroes need to be manually respawned.
--
-- `GameRules:SetHeroRespawnEnabled(bool)`
M.ENABLE_HERO_RESPAWN = true

--- When true, all items are available at as long as any shop is in range.
--
-- `GameRules:SetUseUniversalShopMode(bool)`
M.UNIVERSAL_SHOP_MODE = true

--- When true, players can repeatedly pick the same hero.
--
-- `GameRules:SetSameHeroSelectionEnabled(bool)`
M.ALLOW_SAME_HERO_SELECTION = true

--- Sets the amount of time players have to pick their hero.
--
-- `GameRules:SetHeroSelectionTime(float)`
M.HERO_SELECTION_TIME = 0

--- Sets amount of penalty time before randoming a hero
--
-- `GameRules:SetHeroSelectPenaltyTime(float)`
M.HERO_SELECTION_PENALTY_TIME = 3

--- Sets the amount of time players have between the hero selection and entering the showcase phase.
--
-- `GameRules:SetStrategyTime(float)`
M.STRATEGY_TIME = 0

--- Sets the amount of time players have between the strategy phase and entering the pre-game phase.
--
-- `GameRules:SetShowcaseTime(float)`
M.SHOWCASE_TIME = 0

--- Sets the amount of time players have between picking their hero and game start.
--
-- `GameRules:SetPreGameTime(float)`
M.PRE_GAME_TIME = 0

--- Sets the amount of time players have between the game ending and the server disconnecting them.
--
-- `GameRules:SetPostGameTime(float)`
M.POST_GAME_TIME = 60

--- Sets the tree regrow time in seconds.
--
-- `GameRules:SetTreeRegrowTime(float)`
M.TREE_REGROW_TIME = 300

--- Set the starting gold amount.
--
-- `GameRules:SetStartingGold(int)`
M.STARTING_GOLD = 0

--- Set the auto gold increase per timed interval.
--
-- `GameRules:SetGoldPerTick(int)`
M.GOLD_PER_TICK = 0

--- Set the time interval between auto gold increases.
--
-- `GameRules:SetGoldTickTime(float)`
M.GOLD_TICK_TIME = 60

--- Scale the hero minimap icons on the minimap.
--
-- `GameRules:SetHeroMinimapIconScale(flMinimapHeroIconScale)`
M.MINIMAP_HERO_ICON_SCALE = 1

--- Scale the creep icons on the minimap.
--
-- `GameRules:SetCreepMinimapIconScale(flMinimapCreepIconScale)`
M.MINIMAP_CREEP_ICON_SCALE = 1

--- Scale the rune icons on the minimap.
--
-- `GameRules:SetRuneMinimapIconScale(flMinimapRuneIconScale)`
M.MINIMAP_RUNE_ICON_SCALE = 1

--- Sets whether the regular Dota creeps spawn.
--
-- `GameRules:SetCreepSpawningEnabled(bool)`
M.ENABLE_CREEP_SPAWN = false

--- Sets a flag to enable/disable the default music handling code for custom games
--
-- `GameRules:SetCustomGameAllowBattleMusic(bool)`
M.ENABLE_BATTLE_MUSIC = true

--- Sets a flag to enable/disable the default music handling code for custom games
--
-- `GameRules:SetCustomGameAllowHeroPickMusic(bool)`
M.ENABLE_HERO_PICK_MUSIC = true

--- Sets a flag to enable/disable the default music handling code for custom games
--
-- `GameRules:SetCustomGameAllowMusicAtGameStart(bool)`
M.ENABLE_GAME_START_MUSIC = true

--- Sets the amount of time between rune spawns.
--
-- `GameRules:SetRuneSpawnTime(float)`
M.RUNE_SPAWN_TIME = 120

--- Enabled auto launch for custom game setup.
--
-- The game will launch after `AUTO_LAUNCH_DELAY` seconds.
--
-- `GameRules:EnableCustomGameSetupAutoLaunch(bool)`
M.ENABLE_AUTO_LAUNCH = true

--- Set the amount of time to wait for auto launch (default: 30, disable: 0).
--
-- `GameRules:SetCustomGameSetupAutoLaunchDelay(float)`
M.AUTO_LAUNCH_DELAY = 10

--- Set the amount of remaining time, in seconds, for custom game setup (disable: 0, infinite: -1).
--
-- `GameRules:SetCustomGameSetupRemainingTime(float)`
M.GAME_SETUP_TIME = 0

--- Setup (pre-gameplay) phase timeout (instant: 0, infinite: -1).
--
-- If set to 0, players will not be assigned a "valid" team (their team value will be set to `DOTA_TEAM_NOTEAM`).
--
-- If set to -1, `GameRules:FinishCustomGameSetup()` must be called manually.
--
-- `GameRules:SetCustomGameSetupTimeout(float)`
M.GAME_SETUP_TIMEOUT = 1

--- Lock team assignemnt.
--
-- If team assignment is locked players cannot change teams.
--
-- The host can still unlock the teams.
--
-- `GameRules:LockCustomGameSetupTeamAssignment(bool)`
M.LOCK_TEAM_SETUP = true

--- Should we use custom team colors?
M.USE_CUSTOM_TEAM_COLORS = true

--- Should we use custom team colors to color the players/minimap?
M.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS = true

--- Allows heroes in the map to give a specific amount of XP (this value must be set).
--
-- `GameRules:SetUseCustomHeroXPValues(bool)`
M.USE_CUSTOM_XP_VALUES = false

--- Heroes will use the basic NPC functionality for determining their bounty, rather than DOTA specific formulas.
--
-- `GameRules:SetUseBaseGoldBountyOnHeroes(bool)`
M.USE_BASE_HERO_GOLD_BOUNTY = true

--- Should we display kills only on the top bar? (No denies, suicides, kills by neutrals)
--
-- Requires `USE_CUSTOM_TOP_BAR_VALUES` set to `true`
M.SHOW_KILLS_ON_TOPBAR = false

--- Should the game end after a certain number of kills?
M.END_GAME_ON_KILLS = false

--- How many kills for a team should signify an end of game?
M.KILLS_TO_END_GAME_FOR_TEAM = 0

--- Sets whether First Blood can be triggered.
--
-- `GameRules:SetFirstBloodActive(bool)`
M.ENABLE_FIRST_BLOOD = false

--- Sets whether the multikill, streak, and first-blood banners appear at the top of the screen.
--
-- `GameRules:SetHideKillMessageHeaders(bool)`
M.HIDE_KILL_BANNERS = true

--- Sets the game end delay (default: -1).
--
-- `GameRules:SetCustomGameEndDelay(float)`
M.GAME_END_DELAY = -1

--- Sets the victory message.
--
-- `GameRules:SetCustomVictoryMessage(string)`
M.VICTORY_MESSAGE = "Well played!"

--- Sets the victory message duration.
--
-- `GameRules:SetCustomVictoryMessageDuration(float)`
M.VICTORY_MESSAGE_DURATION = 3

--- Turn the panel for showing recommended items at the shop off/on.
--
-- `GameMode:SetRecommendedItemsDisabled(bDisabled)`
M.RECOMMENDED_BUILDS_DISABLED = false

--- Set a different camera distance (default: 1134, disable: -1).
--
-- `GameMode:SetCameraDistanceOverride(flCameraDistanceOverride)`
M.CAMERA_DISTANCE_OVERRIDE = -1

--- Set a different camera smooth count (default: 8).
--
-- `GameMode:SetCameraSmoothCountOverride(nSmoothCount)`
M.CAMERA_SMOOTH_COUNT = 8

--- Set the rate cooldown ticks down for items in the backpack.
--
-- `GameMode:SetCustomBackpackCooldownPercent(flPercent)`
M.CUSTOM_BACKPACK_COOLDOWN_PERCENT = 0.5

--- Set a custom cooldown for swapping items into the backpack.
--
-- `GameMode:SetCustomBackpackSwapCooldown(flCooldown)`
M.CUSTOM_BACKPACK_SWAP_COOLDOWN = 6

--- Set a custom cooldown for team Glyph ability.
--
-- `GameMode:SetCustomGlyphCooldown(flCooldown)`
M.CUSTOM_GLYPH_COOLDOWN = 300

--- Set a custom cooldown for team Scan ability.
--
-- `GameMode:SetCustomScanCooldown(flCooldown)`
M.CUSTOM_SCAN_COOLDOWN = 300

--- Set the effect used as a custom weather effect, when units are on non-default terrain, in this mode.
--
-- `GameMode:SetCustomTerrainWeatherEffect(pszEffectName)`
M.CUSTOM_TERRAIN_WEATHER_EFFECT = nil

--- If set to true, use current rune spawn rules.
--
-- Either setting respects custom spawn intervals.
--
-- `GameMode:SetUseDefaultDOTARuneSpawnLogic(bEnabled)`
M.USE_DEFAULT_DOTA_RUNE_SPAWN_LOGIC = true

--- Turns on capability to define custom buyback costs.
--
-- `GameMode:SetCustomBuybackCostEnabled(bEnabled)`
M.CUSTOM_BUYBACK_COST_ENABLED = true

--- Turns on capability to define custom buyback cooldowns.
--
-- `GameMode:SetCustomBuybackCooldownEnabled(bEnabled)`
M.CUSTOM_BUYBACK_COOLDOWN_ENABLED = true

--- Enables or disables buyback completely.
--
-- `GameMode:SetBuybackEnabled(bEnabled)`
M.BUYBACK_ENABLED = false

--- Turn the fog of war on or off.
--
-- `GameMode:SetFogOfWarDisabled(bDisabled)`
M.DISABLE_FOG_OF_WAR = false

--- Enable or disable unseen fog of war.
--
-- When enabled parts of the map the player has never seen will be completely hidden by fog of war.
--
-- `DISABLE_FOG_OF_WAR` must be `false` for `USE_UNSEEN_FOG_OF_WAR` to work.
--
-- `GameMode:SetUnseenFogOfWarEnabled(bEnabled)`
M.USE_UNSEEN_FOG_OF_WAR = false

--- Enables/Disables bots in custom games. Note: this will only work with default heroes in the dota map.
--
-- `GameMode:SetBotThinkingEnabled(bEnabled)`
M.USE_STANDARD_DOTA_BOT_THINKING = false

--- Set if the bots should try their best to push with a human player.
--
-- `GameMode:SetBotsAlwaysPushWithHuman(bAlwaysPush)`
M.BOTS_ALWAYS_PUSH_WITH_HUMAN = false

--- Set if bots should enable their late game behavior.
--
-- `GameMode:SetBotsInLateGame(bLateGame)`
M.BOTS_LATE_GAME_BEHAVIOR = false

--- Set the max tier of tower that bots want to push. (-1 to disable).
--
-- `GameMode:SetBotsMaxPushTier(nMaxTier)`
M.BOTS_MAX_PUSH_TIER = -1

--- Set bounty rune spawn rate.
--
-- `GameMode:SetBountyRuneSpawnInterval(flInterval)`
M.BOUNTY_RUNE_SPAWN_INTERVAL = 600

--- Override the values of the team values on the top game bar.
--
-- `GameMode:SetTopBarTeamValuesOverride(bOverride)`
M.USE_CUSTOM_TOP_BAR_VALUES = true

--- Turning on/off the team values on the top game bar.
--
-- `GameMode:SetTopBarTeamValuesVisible(bVisible)`
M.TOP_BAR_VISIBLE = false

--- Enables/Disables tower backdoor protection.
--
-- `GameMode:SetTowerBackdoorProtectionEnabled(bEnabled)`
M.ENABLE_TOWER_BACKDOOR_PROTECTION = true

--- Make it so illusions are immediately removed upon death, rather than sticking around for a few seconds.
--
-- `GameMode:SetRemoveIllusionsOnDeath(bRemove)`
M.REMOVE_ILLUSIONS_ON_DEATH = true

--- Sets the scale applied to non-fixed respawn times (default: 1).
--
-- `GameMode:SetRespawnTimeScale(flValue)`
M.RESPAWN_TIME_SCALE = 1

--- Turn the sound when gold is acquired off/on.
--
-- `GameMode:SetGoldSoundDisabled(bDisabled)`
M.DISABLE_GOLD_SOUNDS = false

--- Specify whether the default combat events will show in the HUD.
--
-- `GameMode:SetHudCombatEventsDisabled(bDisabled)`
M.DISABLE_COMBAT_EVENTS_HUD = false

--- Set whether tombstones can be channeled to be removed by enemy heroes.
--
-- `GameMode:SetKillableTombstones(bEnabled)`
M.KILLABLE_TOMBSTONES = false

--- Use to disable gold loss on death.
--
-- `GameMode:SetLoseGoldOnDeath(bEnabled)`
M.LOSE_GOLD_ON_DEATH = false

--- Show the player hero's inventory in the HUD, regardless of what unit is selected.
--
-- `GameMode:SetAlwaysShowPlayerInventory(bAlwaysShow)`
M.ALWAYS_SHOW_PLAYER_INVENTORY = false

--- Set whether player names are always shown, regardless of client setting.
--
-- `GameMode:SetAlwaysShowPlayerNames(bEnabled)`
M.ALWAYS_SHOW_PLAYER_NAMES = false

--- Turn purchasing items to the stash off/on.
--
-- If purchasing to the stash is off the player must be at a shop to purchase items.
--
-- `GameMode:SetStashPurchasingDisabled(bDisabled)`
M.DISABLE_STASH_PURCHASING = true

--- Mutes the in-game announcer.
--
-- `GameMode:SetAnnouncerDisabled(bDisabled)`
M.DISABLE_ANNOUNCER = true

--- Force all players to use the specified hero and disable the normal hero
-- selection process (e.g. `"npc_dota_hero_axe"`).
--
-- Must be used before hero selection. Set to `nil` to allow players to pick their own hero.
--
-- `GameMode:SetCustomGameForceHero(pHeroName)`
M.FORCE_PICKED_HERO = UNITS.INVOKER

--- Set a fixed delay for all players to respawn after (-1 for default).
--
-- `GameMode:SetFixedRespawnTime(flFixedRespawnTime)`
M.FIXED_RESPAWN_TIME = 1

--- Set the constant rate that the fountain will regen mana (-1 for default).
--
-- `GameMode:SetFountainConstantManaRegen(flConstantManaRegen)`
M.FOUNTAIN_CONSTANT_MANA_REGEN = -1

--- Set the percentage rate that the fountain will regen mana. (-1 for default).
--
-- `GameMode:SetFountainPercentageManaRegen(flPercentageManaRegen)`
M.FOUNTAIN_PERCENTAGE_MANA_REGEN = -1

--- Set the percentage rate that the fountain will regen health. (-1 for default).
--
-- `GameMode:SetFountainPercentageHealthRegen(flPercentageHealthRegen)`
M.FOUNTAIN_PERCENTAGE_HEALTH_REGEN = -1

--- Allows clicks on friendly buildings to be handled normally.
--
-- `GameMode:SetFriendlyBuildingMoveToEnabled(bEnabled)`
M.ENABLE_FRIENDLY_BUILDING_MOVE_TO_CLICK = true

--- Set the maximum attack speed for units.
--
-- `GameMode:SetMaximumAttackSpeed(nMaxSpeed)`
M.MAXIMUM_ATTACK_SPEED = 600

--- Set the minimum attack speed for units.
--
-- `GameMode:SetMinimumAttackSpeed(nMinSpeed)`
M.MINIMUM_ATTACK_SPEED = 20

--- Set pausing enabled/disabled.
--
-- `GameMode:SetPauseEnabled(bEnabled)`
M.ENABLE_PAUSE = true

--- Set power rune spawn rate.
--
-- `GameMode:SetPowerRuneSpawnInterval(flInterval)`
M.POWER_RUNE_SPAWN_INTERVAL = 120

--- Should we disable the day night cycle from naturally occurring?
--
-- (Manual adjustment still possible)
--
-- `GameMode:SetDaynightCycleDisabled(bDisable)`
M.DISABLE_DAY_NIGHT_CYCLE = false

--- Specify whether the full screen death overlay effect plays when the selected hero dies.
--
-- `GameMode:SetDeathOverlayDisabled(bDisabled)`
M.DISABLE_DEATH_OVERLAY = true

--- Set drafting hero banning time.
--
-- `GameMode:SetDraftingBanningTimeOverride(flValue)`
M.DRAFTING_BANNING_TIME = 0

--- Set drafting hero pick time.
-- `GameMode:SetDraftingHeroPickSelectTimeOverride(flValue)`
M.DRAFTING_HERO_PICK_SELECTION_TIME = 0

--- Mutes the in-game killing spree announcer.
--
-- `GameMode:SetKillingSpreeAnnouncerDisabled(bDisabled)`
M.DISABLE_KILLING_SPREE_ANNOUNCER = true

--- Hide the sticky item in the quickbuy.
--
-- `GameMode:SetStickyItemDisabled(bDisabled)`
M.DISABLE_STICKY_ITEM = true

--- Set if weather effects are disabled.
--
-- `GameMode:SetWeatherEffectsDisabled(bDisable)`
M.DISABLE_WEATHER_EFFECTS = false

--- Enable/disable gold penalty for late picking.
--
-- `GameMode:SetSelectionGoldPenaltyEnabled(bEnabled)`
M.ENABLE_SELECTION_GOLD_PENALTY = true

--- Turn on custom-defined XP values for hero level ups.
--
-- The table should be defined before switching this on.
--
-- `GameMode:SetUseCustomHeroLevels(bEnabled)`
M.USE_CUSTOM_HERO_LEVELS = false

--- Allows definition of a table of hero XP values.
--
-- If `USE_CUSTOM_XP_VALUES` is set, use these values as required XP per level.
--
-- `GameMode:SetCustomXPRequiredToReachNextLevel(hTable)`
M.XP_PER_LEVEL_TABLE = {}

--- Which runes should be enabled to spawn in our game mode?
--
-- You always need at least 2 non-bounty type runes to be able to spawn or your game will crash.
--
-- @table ENABLED_RUNES
-- @field[type=bool] DOTA_RUNE_DOUBLEDAMAGE Double Damage
-- @field[type=bool] DOTA_RUNE_HASTE Haste
-- @field[type=bool] DOTA_RUNE_ILLUSION Illusion
-- @field[type=bool] DOTA_RUNE_INVISIBILITY Invisibility
-- @field[type=bool] DOTA_RUNE_REGENERATION Regeneration
-- @field[type=bool] DOTA_RUNE_BOUNTY Bounty
-- @field[type=bool] DOTA_RUNE_ARCANE Arcane
--
-- `GameMode:SetRuneEnabled(nRune, bEnabled)`
M.ENABLED_RUNES = {
  [DOTA_RUNE_DOUBLEDAMAGE] = true,
  [DOTA_RUNE_HASTE] = true,
  [DOTA_RUNE_ILLUSION] = true,
  [DOTA_RUNE_INVISIBILITY] = true,
  [DOTA_RUNE_REGENERATION] = true,
  [DOTA_RUNE_BOUNTY] = true,
  [DOTA_RUNE_ARCANE] = true
}

--- Custom team colors.
--
-- If `USE_CUSTOM_TEAM_COLORS` is set, team colors will be set to these colors.
--
-- If `USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS` is set, player colors will be set
-- according to their respective teams.
--
-- Color definition is a tuple of 3 integers: `{red, green, blue}`.
--
-- @table TEAM_COLORS
-- @field[type=array(int)] DOTA_TEAM_GOODGUYS Radiant
-- @field[type=array(int)] DOTA_TEAM_BADGUYS  Dire
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_1 Custom Team 1
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_2 Custom Team 2
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_3 Custom Team 3
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_4 Custom Team 4
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_5 Custom Team 5
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_6 Custom Team 6
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_7 Custom Team 7
-- @field[type=array(int)] DOTA_TEAM_CUSTOM_8 Custom Team 8
--
-- `SetTeamCustomHealthbarColor(teamNumber, r, g, b)`
--
-- `PlayerResource:SetCustomPlayerColor(playerId, r, g, b)`
M.TEAM_COLORS = {
  [DOTA_TEAM_GOODGUYS] = {61, 210, 150}, -- Teal
  [DOTA_TEAM_BADGUYS] = {243, 201, 9}, -- Yellow
  [DOTA_TEAM_CUSTOM_1] = {197, 77, 168}, -- Pink
  [DOTA_TEAM_CUSTOM_2] = {255, 108, 0}, -- Orange
  [DOTA_TEAM_CUSTOM_3] = {52, 85, 255}, -- Blue
  [DOTA_TEAM_CUSTOM_4] = {101, 212, 19}, -- Green
  [DOTA_TEAM_CUSTOM_5] = {129, 83, 54}, -- Brown
  [DOTA_TEAM_CUSTOM_6] = {27, 192, 216}, -- Cyan
  [DOTA_TEAM_CUSTOM_7] = {199, 228, 13}, -- Olive
  [DOTA_TEAM_CUSTOM_8] = {140, 42, 244} -- Purple
}

--- If we're not automatically setting the number of players per team, use this table.
--
-- @table CUSTOM_TEAM_PLAYER_COUNT
-- @field[type=int] DOTA_TEAM_GOODGUYS Radiant
-- @field[type=int] DOTA_TEAM_BADGUYS  Dire
-- @field[type=int] DOTA_TEAM_CUSTOM_1 Custom Team 1
-- @field[type=int] DOTA_TEAM_CUSTOM_2 Custom Team 2
-- @field[type=int] DOTA_TEAM_CUSTOM_3 Custom Team 3
-- @field[type=int] DOTA_TEAM_CUSTOM_4 Custom Team 4
-- @field[type=int] DOTA_TEAM_CUSTOM_5 Custom Team 5
-- @field[type=int] DOTA_TEAM_CUSTOM_6 Custom Team 6
-- @field[type=int] DOTA_TEAM_CUSTOM_7 Custom Team 7
-- @field[type=int] DOTA_TEAM_CUSTOM_8 Custom Team 8
--
-- `GameRules:SetCustomGameTeamMaxPlayers(int, int)`
M.CUSTOM_TEAM_PLAYER_COUNT = {
  [DOTA_TEAM_GOODGUYS] = 1,
  [DOTA_TEAM_BADGUYS] = 0,
  [DOTA_TEAM_CUSTOM_1] = 0,
  [DOTA_TEAM_CUSTOM_2] = 0,
  [DOTA_TEAM_CUSTOM_3] = 0,
  [DOTA_TEAM_CUSTOM_4] = 0,
  [DOTA_TEAM_CUSTOM_5] = 0,
  [DOTA_TEAM_CUSTOM_6] = 0,
  [DOTA_TEAM_CUSTOM_7] = 0,
  [DOTA_TEAM_CUSTOM_8] = 0
}

return M
