local UNITS = require("invk.const.units")

--- Game settings.
--- @class invk.const.settings
local M = {}

--- Enabled auto launch for custom game setup.
---
--- The game will launch after [AUTO_LAUNCH_DELAY] seconds.
---
--- `GameRules:EnableCustomGameSetupAutoLaunch(bool)`
--- @type boolean
M.ENABLE_AUTO_LAUNCH = true

--- Set the amount of time to wait for auto launch (default: 30, disable: 0).
---
--- `GameRules:SetCustomGameSetupAutoLaunchDelay(float)`
--- @type number
M.AUTO_LAUNCH_DELAY = 10

--- Lock team assignemnt.
---
--- If team assignment is locked players cannot change teams.
---
--- The host can still unlock the teams.
---
--- `GameRules:LockCustomGameSetupTeamAssignment(bool)`
--- @type boolean
M.LOCK_TEAM_SETUP = true

--- Set the amount of remaining time, in seconds, for custom game setup (disable: 0, infinite: -1).
---
--- `GameRules:SetCustomGameSetupRemainingTime(float)`
--- @type number
M.GAME_SETUP_TIME = 0

--- Setup (pre-gameplay) phase timeout (instant: 0, infinite: -1).
---
--- If set to 0, players will not be assigned a "valid" team (their team value
--- will be set to `DOTA_TEAM_NOTEAM`).
---
--- If set to -1, `GameRules:FinishCustomGameSetup` must be called manually.
---
--- `GameRules:SetCustomGameSetupTimeout(float)`
--- @type number
M.GAME_SETUP_TIMEOUT = 1

--- Sets the amount of time players have to pick their hero.
---
--- `GameRules:SetHeroSelectionTime(float)`
--- @type number
M.HERO_SELECTION_TIME = 0

--- Sets amount of penalty time before randoming a hero
---
--- `GameRules:SetHeroSelectPenaltyTime(float)`
--- @type number
M.HERO_SELECTION_PENALTY_TIME = 1

--- When true, players can repeatedly pick the same hero.
---
--- `GameRules:SetSameHeroSelectionEnabled(bool)`
--- @type boolean
M.ALLOW_SAME_HERO_SELECTION = true

--- Force all players to use the specified hero and disable the normal hero
--- selection process (e.g. `"npc_dota_hero_axe"`).
---
--- Must be used before hero selection. Set to `nil` to allow players to pick their own hero.
---
--- `GameMode:SetCustomGameForceHero(pHeroName)`
--- @type string?
M.FORCE_PICKED_HERO = UNITS.INVOKER

--- Sets the amount of time players have between the hero selection and entering the showcase phase.
---
--- `GameRules:SetStrategyTime(float)`
--- @type number
M.STRATEGY_TIME = 0

--- Sets the amount of time players have between the strategy phase and entering the pre-game phase.
---
--- `GameRules:SetShowcaseTime(float)`
--- @type number
M.SHOWCASE_TIME = 0

--- Sets the amount of time players have between picking their hero and game start.
---
--- `GameRules:SetPreGameTime(float)`
--- @type number
M.PRE_GAME_TIME = 0

--- Sets the amount of time players have between the game ending and the server disconnecting them.
---
--- `GameRules:SetPostGameTime(float)`
--- @type number
M.POST_GAME_TIME = 0

--- Sets the game end delay (default: -1).
---
--- `GameRules:SetCustomGameEndDelay(float)`
--- @type number
M.GAME_END_DELAY = -1

--- Control if the normal DOTA hero respawn rules apply.
---
--- If disabled, heroes need to be manually respawned.
---
--- `GameRules:SetHeroRespawnEnabled(bool)`
--- @type boolean
M.ENABLE_HERO_RESPAWN = true

--- When true, all items are available at as long as any shop is in range.
---
--- `GameRules:SetUseUniversalShopMode(bool)`
--- @type boolean
M.UNIVERSAL_SHOP_MODE = true

--- Sets the tree regrow time in seconds.
---
--- `GameRules:SetTreeRegrowTime(float)`
--- @type number
M.TREE_REGROW_TIME = 300

--- Set the starting gold amount.
---
--- `GameRules:SetStartingGold(int)`
--- @type integer
M.STARTING_GOLD = 0

--- Set the auto gold increase per timed interval.
---
--- `GameRules:SetGoldPerTick(int)`
--- @type integer
M.GOLD_PER_TICK = 0

--- Set the time interval between auto gold increases.
---
--- `GameRules:SetGoldTickTime(float)`
--- @type number
M.GOLD_TICK_TIME = 60

--- Scale the hero minimap icons on the minimap.
---
--- `GameRules:SetHeroMinimapIconScale(flMinimapHeroIconScale)`
--- @type number
M.MINIMAP_HERO_ICON_SCALE = 1

--- Scale the creep icons on the minimap.
---
--- `GameRules:SetCreepMinimapIconScale(flMinimapCreepIconScale)`
--- @type number
M.MINIMAP_CREEP_ICON_SCALE = 1

--- Scale the rune icons on the minimap.
---
--- `GameRules:SetRuneMinimapIconScale(flMinimapRuneIconScale)`
--- @type number
M.MINIMAP_RUNE_ICON_SCALE = 1

--- Sets whether the regular Dota creeps spawn.
---
--- `GameRules:SetCreepSpawningEnabled(bool)`
--- @type boolean
M.ENABLE_CREEP_SPAWN = false

--- Sets a flag to enable/disable the default music handling code for custom games
---
--- `GameRules:SetCustomGameAllowBattleMusic(bool)`
--- @type boolean
M.ENABLE_BATTLE_MUSIC = true

--- Sets a flag to enable/disable the default music handling code for custom games
---
--- `GameRules:SetCustomGameAllowHeroPickMusic(bool)`
--- @type boolean
M.ENABLE_HERO_PICK_MUSIC = true

--- Sets a flag to enable/disable the default music handling code for custom games
---
--- `GameRules:SetCustomGameAllowMusicAtGameStart(bool)`
--- @type boolean
M.ENABLE_GAME_START_MUSIC = true

--- Sets the amount of time between rune spawns.
---
--- `GameRules:SetRuneSpawnTime(float)`
--- @type number
M.RUNE_SPAWN_TIME = 120

--- Should we use custom team colors?
--- @type boolean
M.USE_CUSTOM_TEAM_COLORS = true

--- Should we use custom team colors to color the players/minimap?
--- @type boolean
M.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS = true

--- Allows heroes in the map to give a specific amount of XP (this value must be set).
---
--- `GameRules:SetUseCustomHeroXPValues(bool)`
--- @type boolean
M.USE_CUSTOM_XP_VALUES = false

--- Heroes will use the basic NPC functionality for determining their bounty,
--- rather than DOTA specific formulas.
---
--- `GameRules:SetUseBaseGoldBountyOnHeroes(bool)`
--- @type boolean
M.USE_BASE_HERO_GOLD_BOUNTY = true

--- Should we display kills only on the top bar? (No denies, suicides, kills by neutrals)
---
--- Requires [USE_CUSTOM_TOP_BAR_VALUES] set to `true`
--- @type boolean
M.SHOW_KILLS_ON_TOPBAR = false

--- Should the game end after a certain number of kills?
--- @type boolean
M.END_GAME_ON_KILLS = false

--- How many kills for a team should signify an end of game?
--- @type integer
M.KILLS_TO_END_GAME_FOR_TEAM = 0

--- Sets whether First Blood can be triggered.
---
--- `GameRules:SetFirstBloodActive(bool)`
--- @type boolean
M.ENABLE_FIRST_BLOOD = false

--- Sets whether the multikill, streak, and first-blood banners appear at the top of the screen.
---
--- `GameRules:SetHideKillMessageHeaders(bool)`
--- @type boolean
M.HIDE_KILL_BANNERS = true

--- Sets the victory message.
---
--- `GameRules:SetCustomVictoryMessage(string)`
--- @type string?
M.VICTORY_MESSAGE = "Well played!"

--- Sets the victory message duration.
---
--- `GameRules:SetCustomVictoryMessageDuration(float)`
--- @type number
M.VICTORY_MESSAGE_DURATION = 3

--- Turn the panel for showing recommended items at the shop off/on.
---
--- `GameMode:SetRecommendedItemsDisabled(bDisabled)`
--- @type boolean
M.RECOMMENDED_BUILDS_DISABLED = false

--- Set a different camera distance (default: 1134, disable: -1).
---
--- `GameMode:SetCameraDistanceOverride(flCameraDistanceOverride)`
--- @type integer
M.CAMERA_DISTANCE_OVERRIDE = -1

--- Set a different camera smooth count (default: 8).
---
--- `GameMode:SetCameraSmoothCountOverride(nSmoothCount)`
--- @type integer
M.CAMERA_SMOOTH_COUNT = 8

--- Set the rate cooldown ticks down for items in the backpack.
---
--- `GameMode:SetCustomBackpackCooldownPercent(flPercent)`
--- @type number
M.CUSTOM_BACKPACK_COOLDOWN_PERCENT = 0.5

--- Set a custom cooldown for swapping items into the backpack.
---
--- `GameMode:SetCustomBackpackSwapCooldown(flCooldown)`
--- @type number
M.CUSTOM_BACKPACK_SWAP_COOLDOWN = 6

--- Set a custom cooldown for team Glyph ability.
---
--- `GameMode:SetCustomGlyphCooldown(flCooldown)`
--- @type number
M.CUSTOM_GLYPH_COOLDOWN = 300

--- Set a custom cooldown for team Scan ability.
---
--- `GameMode:SetCustomScanCooldown(flCooldown)`
--- @type number
M.CUSTOM_SCAN_COOLDOWN = 300

--- Set the effect used as a custom weather effect, when units are on
--- non-default terrain, in this mode.
---
--- `GameMode:SetCustomTerrainWeatherEffect(pszEffectName)`
--- @type string?
M.CUSTOM_TERRAIN_WEATHER_EFFECT = nil

--- If set to true, use current rune spawn rules.
---
--- Either setting respects custom spawn intervals.
---
--- `GameMode:SetUseDefaultDOTARuneSpawnLogic(bEnabled)`
--- @type boolean
M.USE_DEFAULT_DOTA_RUNE_SPAWN_LOGIC = true

--- Turns on capability to define custom buyback costs.
---
--- `GameMode:SetCustomBuybackCostEnabled(bEnabled)`
--- @type boolean
M.CUSTOM_BUYBACK_COST_ENABLED = true

--- Turns on capability to define custom buyback cooldowns.
---
--- `GameMode:SetCustomBuybackCooldownEnabled(bEnabled)`
--- @type boolean
M.CUSTOM_BUYBACK_COOLDOWN_ENABLED = true

--- Enables or disables buyback completely.
---
--- `GameMode:SetBuybackEnabled(bEnabled)`
--- @type boolean
M.BUYBACK_ENABLED = false

--- Turn the fog of war on or off.
---
--- `GameMode:SetFogOfWarDisabled(bDisabled)`
--- @type boolean
M.DISABLE_FOG_OF_WAR = false

--- Enable or disable unseen fog of war.
---
--- When enabled parts of the map the player has never seen will be completely hidden by fog of war.
---
--- [DISABLE_FOG_OF_WAR] must be `false` for [USE_UNSEEN_FOG_OF_WAR] to work.
---
--- `GameMode:SetUnseenFogOfWarEnabled(bEnabled)`
--- @type boolean
M.USE_UNSEEN_FOG_OF_WAR = false

--- Enables/Disables bots in custom games.
---
--- Note: this will only work with default heroes in the dota map.
---
--- `GameMode:SetBotThinkingEnabled(bEnabled)`
--- @type boolean
M.USE_STANDARD_DOTA_BOT_THINKING = false

--- Set if the bots should try their best to push with a human player.
---
--- `GameMode:SetBotsAlwaysPushWithHuman(bAlwaysPush)`
--- @type boolean
M.BOTS_ALWAYS_PUSH_WITH_HUMAN = false

--- Set if bots should enable their late game behavior.
---
--- `GameMode:SetBotsInLateGame(bLateGame)`
--- @type boolean
M.BOTS_LATE_GAME_BEHAVIOR = false

--- Set the max tier of tower that bots want to push. (-1 to disable).
---
--- `GameMode:SetBotsMaxPushTier(nMaxTier)`
--- @type integer
M.BOTS_MAX_PUSH_TIER = -1

--- Set bounty rune spawn rate.
---
--- `GameMode:SetBountyRuneSpawnInterval(flInterval)`
--- @type number
M.BOUNTY_RUNE_SPAWN_INTERVAL = 600

--- Override the values of the team values on the top game bar.
---
--- `GameMode:SetTopBarTeamValuesOverride(bOverride)`
--- @type boolean
M.USE_CUSTOM_TOP_BAR_VALUES = true

--- Turning on/off the team values on the top game bar.
---
--- `GameMode:SetTopBarTeamValuesVisible(bVisible)`
--- @type boolean
M.TOP_BAR_VISIBLE = false

--- Enables/Disables tower backdoor protection.
---
--- `GameMode:SetTowerBackdoorProtectionEnabled(bEnabled)`
--- @type boolean
M.ENABLE_TOWER_BACKDOOR_PROTECTION = true

--- Make it so illusions are immediately removed upon death, rather than
--- sticking around for a few seconds.
---
--- `GameMode:SetRemoveIllusionsOnDeath(bRemove)`
--- @type boolean
M.REMOVE_ILLUSIONS_ON_DEATH = true

--- Sets the scale applied to non-fixed respawn times (default: 1).
---
--- `GameMode:SetRespawnTimeScale(flValue)`
--- @type number
M.RESPAWN_TIME_SCALE = 1

--- Turn the sound when gold is acquired off/on.
---
--- `GameMode:SetGoldSoundDisabled(bDisabled)`
--- @type boolean
M.DISABLE_GOLD_SOUNDS = false

--- Specify whether the default combat events will show in the HUD.
---
--- `GameMode:SetHudCombatEventsDisabled(bDisabled)`
--- @type boolean
M.DISABLE_COMBAT_EVENTS_HUD = false

--- Set whether tombstones can be channeled to be removed by enemy heroes.
---
--- `GameMode:SetKillableTombstones(bEnabled)`
--- @type boolean
M.KILLABLE_TOMBSTONES = false

--- Use to disable gold loss on death.
---
--- `GameMode:SetLoseGoldOnDeath(bEnabled)`
--- @type boolean
M.LOSE_GOLD_ON_DEATH = false

--- Show the player hero's inventory in the HUD, regardless of what unit is selected.
---
--- `GameMode:SetAlwaysShowPlayerInventory(bAlwaysShow)`
--- @type boolean
M.ALWAYS_SHOW_PLAYER_INVENTORY = false

--- Set whether player names are always shown, regardless of client setting.
---
--- `GameMode:SetAlwaysShowPlayerNames(bEnabled)`
--- @type boolean
M.ALWAYS_SHOW_PLAYER_NAMES = false

--- Turn purchasing items to the stash off/on.
---
--- If purchasing to the stash is off the player must be at a shop to purchase items.
---
--- `GameMode:SetStashPurchasingDisabled(bDisabled)`
--- @type boolean
M.DISABLE_STASH_PURCHASING = true

--- Mutes the in-game announcer.
---
--- `GameMode:SetAnnouncerDisabled(bDisabled)`
--- @type boolean
M.DISABLE_ANNOUNCER = true

--- Set a fixed delay for all players to respawn after (-1 for default).
---
--- `GameMode:SetFixedRespawnTime(flFixedRespawnTime)`
--- @type number
M.FIXED_RESPAWN_TIME = 1

--- Set the constant rate that the fountain will regen mana (-1 for default).
---
--- `GameMode:SetFountainConstantManaRegen(flConstantManaRegen)`
--- @type number
M.FOUNTAIN_CONSTANT_MANA_REGEN = -1

--- Set the percentage rate that the fountain will regen mana. (-1 for default).
---
--- `GameMode:SetFountainPercentageManaRegen(flPercentageManaRegen)`
--- @type number
M.FOUNTAIN_PERCENTAGE_MANA_REGEN = -1

--- Set the percentage rate that the fountain will regen health. (-1 for default).
---
--- `GameMode:SetFountainPercentageHealthRegen(flPercentageHealthRegen)`
--- @type number
M.FOUNTAIN_PERCENTAGE_HEALTH_REGEN = -1

--- Allows clicks on friendly buildings to be handled normally.
---
--- `GameMode:SetFriendlyBuildingMoveToEnabled(bEnabled)`
--- @type boolean
M.ENABLE_FRIENDLY_BUILDING_MOVE_TO_CLICK = true

--- Set the maximum attack speed for units.
---
--- `GameMode:SetMaximumAttackSpeed(nMaxSpeed)`
--- @type integer
M.MAXIMUM_ATTACK_SPEED = 600

--- Set the minimum attack speed for units.
---
--- `GameMode:SetMinimumAttackSpeed(nMinSpeed)`
--- @type integer
M.MINIMUM_ATTACK_SPEED = 20

--- Set pausing enabled/disabled.
---
--- `GameMode:SetPauseEnabled(bEnabled)`
--- @type boolean
M.ENABLE_PAUSE = true

--- Set power rune spawn rate.
---
--- `GameMode:SetPowerRuneSpawnInterval(flInterval)`
--- @type number
M.POWER_RUNE_SPAWN_INTERVAL = 120

--- Should we disable the day night cycle from naturally occurring?
---
--- (Manual adjustment still possible)
---
--- `GameMode:SetDaynightCycleDisabled(bDisable)`
--- @type boolean
M.DISABLE_DAY_NIGHT_CYCLE = false

--- Specify whether the full screen death overlay effect plays when the selected hero dies.
---
--- `GameMode:SetDeathOverlayDisabled(bDisabled)`
--- @type boolean
M.DISABLE_DEATH_OVERLAY = true

--- Set drafting hero banning time.
---
--- `GameMode:SetDraftingBanningTimeOverride(flValue)`
--- @type number
M.DRAFTING_BANNING_TIME = 0

--- Set drafting hero pick time.
--- `GameMode:SetDraftingHeroPickSelectTimeOverride(flValue)`
--- @type number
M.DRAFTING_HERO_PICK_SELECTION_TIME = 0

--- Mutes the in-game killing spree announcer.
---
--- `GameMode:SetKillingSpreeAnnouncerDisabled(bDisabled)`
--- @type boolean
M.DISABLE_KILLING_SPREE_ANNOUNCER = true

--- Hide the sticky item in the quickbuy.
---
--- `GameMode:SetStickyItemDisabled(bDisabled)`
--- @type boolean
M.DISABLE_STICKY_ITEM = true

--- Set if weather effects are disabled.
---
--- `GameMode:SetWeatherEffectsDisabled(bDisable)`
--- @type boolean
M.DISABLE_WEATHER_EFFECTS = false

--- Enable/disable gold penalty for late picking.
---
--- `GameMode:SetSelectionGoldPenaltyEnabled(bEnabled)`
--- @type boolean
M.ENABLE_SELECTION_GOLD_PENALTY = true

--- Turn on custom-defined XP values for hero level ups.
---
--- The table should be defined before switching this on.
---
--- `GameMode:SetUseCustomHeroLevels(bEnabled)`
--- @type boolean
M.USE_CUSTOM_HERO_LEVELS = false

--- Allows definition of a table of hero XP values.
---
--- If [USE_CUSTOM_XP_VALUES] is set, use these values as required XP per level.
---
--- `GameMode:SetCustomXPRequiredToReachNextLevel(hTable)`
--- @type { [integer]: integer }
M.XP_PER_LEVEL_TABLE = {}

--- Which runes should be enabled to spawn in our game mode?
---
--- You always need at least 2 non-bounty type runes to be able to spawn or your game will crash.
---
--- `GameMode:SetRuneEnabled(nRune, bEnabled)`
--- @type { [DOTA_RUNES]: boolean }
M.ENABLED_RUNES = {
  [DOTA_RUNE_DOUBLEDAMAGE] = true,
  [DOTA_RUNE_HASTE] = true,
  [DOTA_RUNE_ILLUSION] = true,
  [DOTA_RUNE_INVISIBILITY] = true,
  [DOTA_RUNE_REGENERATION] = true,
  [DOTA_RUNE_BOUNTY] = true,
  [DOTA_RUNE_ARCANE] = true,
}

--- Custom team colors.
---
--- If [USE_CUSTOM_TEAM_COLORS] is set, team colors will be set to these colors.
---
--- If [USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS] is set, player colors will be set
--- according to their respective teams.
---
--- Color definition is a tuple of 3 integers: `{red, green, blue}`.
---
--- ```lua
--- SetTeamCustomHealthbarColor(teamNumber, r, g, b)
--- PlayerResource:SetCustomPlayerColor(playerId, r, g, b)
--- ```
--- @type { [DOTATeam_t]: { [1]: integer, [2]: integer, [3]: integer } }
M.TEAM_COLORS = {
  [DOTA_TEAM_GOODGUYS] = { 61, 210, 150 }, -- Teal
  [DOTA_TEAM_BADGUYS] = { 243, 201, 9 }, -- Yellow
  [DOTA_TEAM_CUSTOM_1] = { 197, 77, 168 }, -- Pink
  [DOTA_TEAM_CUSTOM_2] = { 255, 108, 0 }, -- Orange
  [DOTA_TEAM_CUSTOM_3] = { 52, 85, 255 }, -- Blue
  [DOTA_TEAM_CUSTOM_4] = { 101, 212, 19 }, -- Green
  [DOTA_TEAM_CUSTOM_5] = { 129, 83, 54 }, -- Brown
  [DOTA_TEAM_CUSTOM_6] = { 27, 192, 216 }, -- Cyan
  [DOTA_TEAM_CUSTOM_7] = { 199, 228, 13 }, -- Olive
  [DOTA_TEAM_CUSTOM_8] = { 140, 42, 244 }, -- Purple
}

--- If we're not automatically setting the number of players per team, use this table.
---
--- ```lua
--- GameRules:SetCustomGameTeamMaxPlayers(team, count)
--- ```
--- @type { [DOTATeam_t]: integer }
M.CUSTOM_TEAM_PLAYER_COUNT = {
  [DOTA_TEAM_GOODGUYS] = 1,
  [DOTA_TEAM_BADGUYS] = 0,
  [DOTA_TEAM_NEUTRALS] = 0,
  [DOTA_TEAM_NOTEAM] = 0,
  [DOTA_TEAM_CUSTOM_1] = 0,
  [DOTA_TEAM_CUSTOM_2] = 0,
  [DOTA_TEAM_CUSTOM_3] = 0,
  [DOTA_TEAM_CUSTOM_4] = 0,
  [DOTA_TEAM_CUSTOM_5] = 0,
  [DOTA_TEAM_CUSTOM_6] = 0,
  [DOTA_TEAM_CUSTOM_7] = 0,
  [DOTA_TEAM_CUSTOM_8] = 0,
}

return M
