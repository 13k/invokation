--- Game settings.
-- @module invokation.const.settings

local UNITS = require("invokation.const.units")

local M = {}

--- Should the heroes automatically respawn on a timer or stay dead until manually respawned?
M.ENABLE_HERO_RESPAWN = true

--- Should the main shop contain Secret Shop items as well as regular items?
M.UNIVERSAL_SHOP_MODE = true

--- Should we let people select the same hero as each other?
M.ALLOW_SAME_HERO_SELECTION = true

--- How long should we let people select their hero?
M.HERO_SELECTION_TIME = 0.0

--- How long after people select their heroes should the horn blow and the game start?
M.PRE_GAME_TIME = 0.0

--- How long should we let people look at the scoreboard before closing the server automatically?
M.POST_GAME_TIME = 60.0

--- How long should it take individual trees to respawn after being cut down/destroyed?
M.TREE_REGROW_TIME = 300.0

--- How much starting gold should we give to each player?
M.STARTING_GOLD = 0

--- How much gold should players get per tick?
M.GOLD_PER_TICK = 0

--- How long should we wait in seconds between gold ticks?
M.GOLD_TICK_TIME = 60

--- Should we disable the recommened builds for heroes?
M.RECOMMENDED_BUILDS_DISABLED = false

--- How far out should we allow the camera to go?
--
-- Use `-1` for the default (`1134`) while still allowing for panorama camera distance changes
M.CAMERA_DISTANCE_OVERRIDE = -1

--- What icon size should we use for our heroes?
M.MINIMAP_ICON_SIZE = 1

--- What icon size should we use for creeps?
M.MINIMAP_CREEP_ICON_SIZE = 1

--- What icon size should we use for runes?
M.MINIMAP_RUNE_ICON_SIZE = 1

--- How long in seconds should we wait between rune spawns?
M.RUNE_SPAWN_TIME = 120

--- Should we use a custom buyback cost setting?
M.CUSTOM_BUYBACK_COST_ENABLED = true

--- Should we use a custom buyback time?
M.CUSTOM_BUYBACK_COOLDOWN_ENABLED = true

--- Should we allow people to buyback when they die?
M.BUYBACK_ENABLED = false

--- Should we disable fog of war entirely for both teams?
M.DISABLE_FOG_OF_WAR_ENTIRELY = false

--- Should we make unseen and fogged areas of the map completely black until uncovered by each team?
--
-- NOTE: `DISABLE_FOG_OF_WAR_ENTIRELY` must be `false` for `USE_UNSEEN_FOG_OF_WAR` to work
M.USE_UNSEEN_FOG_OF_WAR = false

--- Should we have bots act like they would in Dota?
--
-- (This requires 3 lanes, normal items, etc)
M.USE_STANDARD_DOTA_BOT_THINKING = false

--- Should we give gold for hero kills the same as in Dota, or allow those values to be changed?
M.USE_STANDARD_HERO_GOLD_BOUNTY = true

--- Should we do customized top bar values or use the default kill count per team?
M.USE_CUSTOM_TOP_BAR_VALUES = true

--- Should we display the top bar score/count at all?
M.TOP_BAR_VISIBLE = false

--- Should we display kills only on the top bar? (No denies, suicides, kills by neutrals)
--
-- Requires `USE_CUSTOM_TOP_BAR_VALUES` set to `true`
M.SHOW_KILLS_ON_TOPBAR = false

--- Should we enable backdoor protection for our towers?
M.ENABLE_TOWER_BACKDOOR_PROTECTION = true

--- Should we remove all illusions if the main hero dies?
M.REMOVE_ILLUSIONS_ON_DEATH = true

--- Should we disable the gold sound when players get gold?
M.DISABLE_GOLD_SOUNDS = false

--- Should the game end after a certain number of kills?
M.END_GAME_ON_KILLS = false

--- How many kills for a team should signify an end of game?
M.KILLS_TO_END_GAME_FOR_TEAM = 0

--- Should we allow heroes to have custom levels?
M.USE_CUSTOM_HERO_LEVELS = false

--- Should we use custom XP values to level up heroes, or the default Dota numbers?
M.USE_CUSTOM_XP_VALUES = false

--- Should we enable first blood for the first kill in this game?
M.ENABLE_FIRST_BLOOD = false

--- Should we hide the kill banners that show when a player is killed?
M.HIDE_KILL_BANNERS = true

--- Should we have players lose the normal amount of dota gold on death?
M.LOSE_GOLD_ON_DEATH = false

--- Should we only allow players to see their own inventory even when selecting other units?
M.SHOW_ONLY_PLAYER_INVENTORY = false

--- Should we prevent players from being able to buy items into their stash when not at a shop?
M.DISABLE_STASH_PURCHASING = true

--- Should we disable the announcer from working in the game?
M.DISABLE_ANNOUNCER = true

--- What hero should we force all players to spawn as? (e.g. `"npc_dota_hero_axe"`).
--
-- Use `nil` to allow players to pick their own hero.
M.FORCE_PICKED_HERO = UNITS.INVOKER

--- What time should we use for a fixed respawn timer?
--
-- Use `-1` to keep the default dota behavior.
M.FIXED_RESPAWN_TIME = 1

--- What should we use for the constant fountain mana regen?
--
-- Use `-1` to keep the default dota behavior.
M.FOUNTAIN_CONSTANT_MANA_REGEN = -1

--- What should we use for the percentage fountain mana regen?
--
-- Use `-1` to keep the default dota behavior.
M.FOUNTAIN_PERCENTAGE_MANA_REGEN = -1

--- What should we use for the percentage fountain health regen?
--
-- Use `-1` to keep the default dota behavior.
M.FOUNTAIN_PERCENTAGE_HEALTH_REGEN = -1

--- What should we use for the maximum attack speed?
M.MAXIMUM_ATTACK_SPEED = 600

--- What should we use for the minimum attack speed?
M.MINIMUM_ATTACK_SPEED = 20

--- How long should we wait after the game winner is set to display the victory banner and End Screen?
--
--- Use `-1` to keep the default (about 10 seconds)
M.GAME_END_DELAY = -1

--- How long should we wait after the victory message displays to show the End Screen?
M.VICTORY_MESSAGE_DURATION = 3

--- Should we disable the day night cycle from naturally occurring?
--
-- (Manual adjustment still possible)
M.DISABLE_DAY_NIGHT_CYCLE = false

--- Should we disable the killing spree announcer?
M.DISABLE_KILLING_SPREE_ANNOUNCER = true

--- Should we disable the sticky item button in the quick buy area?
M.DISABLE_STICKY_ITEM = true

--- Should we skip the team setup entirely?
M.SKIP_TEAM_SETUP = false

--- Should we automatically have the game complete team setup after `AUTO_LAUNCH_DELAY` seconds?
M.ENABLE_AUTO_LAUNCH = true

--- How long should the default team selection launch timer be?
--
-- The default for custom games is `30`. Setting to `0` will skip team selection.
M.AUTO_LAUNCH_DELAY = IsInToolsMode() and 0 or 10

--- Should we lock the teams initially?
--
-- NOTE: The host can still unlock the teams
M.LOCK_TEAM_SETUP = true

--- Should we use custom team colors?
M.USE_CUSTOM_TEAM_COLORS = true

--- Should we use custom team colors to color the players/minimap?
M.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS = true

--- How many potential teams can be in this game mode?
M.MAX_NUMBER_OF_TEAMS = 1

--- Should we set the number of players to `10 / MAX_NUMBER_OF_TEAMS`?
M.USE_AUTOMATIC_PLAYERS_PER_TEAM = false

--- If `USE_CUSTOM_XP_VALUES` is set, use these values as required XP per level
M.XP_PER_LEVEL_TABLE = {}

--- Which runes should be enabled to spawn in our game mode?
--
-- NOTE: You always need at least 2 non-bounty type runes to be able to spawn or your game will crash!
-- @table ENABLED_RUNES
-- @field[type=bool] DOTA_RUNE_DOUBLEDAMAGE Double Damage
-- @field[type=bool] DOTA_RUNE_HASTE Haste
-- @field[type=bool] DOTA_RUNE_ILLUSION Illusion
-- @field[type=bool] DOTA_RUNE_INVISIBILITY Invisibility
-- @field[type=bool] DOTA_RUNE_REGENERATION Regeneration
-- @field[type=bool] DOTA_RUNE_BOUNTY Bounty
-- @field[type=bool] DOTA_RUNE_ARCANE Arcane
M.ENABLED_RUNES = {
  [DOTA_RUNE_DOUBLEDAMAGE] = true,
  [DOTA_RUNE_HASTE] = true,
  [DOTA_RUNE_ILLUSION] = true,
  [DOTA_RUNE_INVISIBILITY] = true,
  [DOTA_RUNE_REGENERATION] = true,
  [DOTA_RUNE_BOUNTY] = true,
  [DOTA_RUNE_ARCANE] = true
}

--- If `USE_CUSTOM_TEAM_COLORS` is set, use these colors.
--
-- Color definition is a tuple of 3 integers: `{red, green, blue}`.
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

--- If we're not automatically setting the number of players per team, use this table
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
