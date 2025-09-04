local class = require("middleclass")

local COMMANDS = require("invk.const.commands")
local Combos = require("invk.combo.combos")
local CustomEvents = require("invk.game_mode.custom_events")
local Env = require("invk.game_mode.env")
local GameEvents = require("invk.game_mode.game_events")
local INVOKER = require("invk.const.invoker")
local Invoker = require("invk.dota2.invoker")
local ItemsKeyValues = require("invk.dota2.kv.items_key_values")
local Logger = require("invk.logger")
local META = require("invk.const.metadata")
local NET_TABLES = require("invk.const.net_table")
local NetTable = require("invk.dota2.net_table")
local PRECACHE = require("invk.const.precache")
local S = require("invk.const.settings")
local Timers = require("invk.dota2.timers")
local func = require("invk.lang.function")
local game_mode = require("invk.game_mode.game_mode")
local game_rules = require("invk.game_mode.game_rules")
local rand = require("invk.lang.random")
local tbl = require("invk.lang.table")

local LOGNAME = "invk"
local DEFAULT_ENV = Env.is_dev_mode() and Env.DEVELOPMENT or Env.PRODUCTION

--- Main class for the game.
--- @class invk.GameMode : middleclass.Class, invk.log.Mixin
--- @field env invk.Env
--- @field users { [integer]: CDOTAPlayerController? }
--- @field players { [PlayerID]: CDOTAPlayerController? }
--- @field items_kv invk.dota2.kv.ItemsKeyValues
--- @field net_tables { [invk.net_table.Name]: invk.dota2.NetTable }
--- @field game_mode CDOTABaseGameMode
--- @field game_events invk.game_mode.GameEvents
--- @field custom_events invk.game_mode.CustomEvents
--- @field combos invk.combo.Combos
--- @field logger invk.Logger
--- @field private _reentrant boolean
local M = class("invk.GameMode")

M:include(Logger.Mixin)

M.META = META
M._VERSION = META.version

--- Precaches resources/units/items/abilities that will be needed for sure in
--- your game and that will not be precached by hero selection.
---
--- When a hero is selected from the hero selection screen, the game will
--- precache that hero's assets, any equipped cosmetics, and perform the
--- data-driven precaching defined in that hero's `precache{}` block, as well as
--- the `precache{}` block for any equipped abilities.
function M.precache(ctx)
  for _, name in ipairs(PRECACHE.UNITS) do
    PrecacheUnitByNameSync(name, ctx)
  end

  for path, ty in pairs(PRECACHE.RESOURCES) do
    PrecacheResource(ty, path, ctx)
  end
end

--- @class invk.GameModeOptions
--- @field env? invk.Env # Environment

--- Constructor.
--- @param options? invk.GameModeOptions # Options table
function M:initialize(options)
  local opts = options or {}

  self._reentrant = false

  self.env = opts.env or DEFAULT_ENV
  self.users = {}
  self.players = {}

  self.logger =
    Logger:new(LOGNAME, self.env == Env.DEVELOPMENT and Logger.Level.DEBUG or Logger.Level.INFO)

  self.items_kv = ItemsKeyValues:load()

  self.net_tables = tbl.map(NET_TABLES.Tables, function(config)
    return NetTable:new(config, { logger = self.logger })
  end)

  self.game_events = GameEvents:new(self, { logger = self.logger })
  self.custom_events = CustomEvents:new(self, { logger = self.logger })

  self.combos = Combos:new(self.net_tables[NET_TABLES.Name.MAIN], { logger = self.logger })
end

--- @param fn_name string
--- @return fun(...: any): any...
function M:fn_handler(fn_name)
  assertf(type(self[fn_name]) == "function", "%s.%s is not a function", self.class.name, fn_name)

  if self.env == Env.DEVELOPMENT then
    return func.lookupbyname(self, fn_name)
  end

  return self[fn_name]
end

--- @param method_name string
--- @return fun(...: any): any...
function M:method_handler(method_name)
  return func.bind(self:fn_handler(method_name), self)
end

--- Entry-point for the game initialization.
function M:activate()
  if M._reentrant then
    return
  end

  self:d("(addon) Activating...")

  self:setup_modules()
  self:setup_net_tables()
  self:setup_game_rules()
  self:setup_game_mode()

  self.game_events:register()
  self.custom_events:register()

  self:register_commands()
  self:register_convars()

  self:d("(addon) Done")
end

function M:setup_modules()
  self:d("  (timers) setup")
  Timers:start()

  self:d("  (random) seed")
  rand.seed()
end

function M:post_load_precache()
  self:d("  (precache) post-load")
end

--- @param user_id integer
--- @param player CDOTAPlayerController
function M:add_player_user(user_id, player)
  self.users[user_id] = player
  self.players[player:GetPlayerID()] = player
end

local WARNF_MISSING_TEAM_COLOR =
  "Attempted to set custom player color for player %d and team %d, but the team color is not configured."

function M:set_team_colors()
  if not S.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS then
    return
  end

  for i = 0, DOTA_DEFAULT_MAX_TEAM_PLAYERS do
    if PlayerResource:IsValidPlayer(i) then
      local team = PlayerResource:GetTeam(i)
      local color = S.TEAM_COLORS[team]

      if color ~= nil then
        PlayerResource:SetCustomPlayerColor(i, color[1], color[2], color[3])
      else
        self:warnf(WARNF_MISSING_TEAM_COLOR, i, team)
      end
    end
  end
end

--- net_tables {{{

function M:setup_net_tables()
  self:d("  (net_tables) setup")

  -- main/hero_data
  do
    local nt = self.net_tables[NET_TABLES.Name.MAIN]

    nt:set(nt.keys.HERO_DATA, INVOKER:serialize())
  end

  -- hero/key_values
  do
    local nt = self.net_tables[NET_TABLES.Name.HERO]

    nt:set(nt.keys.KEY_VALUES, INVOKER.KEY_VALUES.data)
  end

  -- abilities/key_values
  do
    local nt = self.net_tables[NET_TABLES.Name.ABILITIES]

    nt:set(nt.keys.KEY_VALUES, INVOKER.KEY_VALUES:abilities_data())
  end
end

--- }}}
--- game_rules {{{

function M:setup_game_rules()
  self:d("  (GameRules) setup")

  game_rules.setup(self.env)
end

--- }}}
--- game_mode {{{

function M:setup_game_mode()
  self:d("  (GameMode) setup")

  self.game_mode = game_mode.setup()
end

--- }}}
--- commands {{{

--- @param method_name string
function M:command_handler(method_name)
  return function(command, ...)
    self:d(command, method_name, ...)

    local callback = self:method_handler(method_name)
    local pawn = Convars:GetDOTACommandClient() --[[@as CBasePlayerPawn]]
    local player = pawn:GetController()

    return callback(player, ...)
  end
end

--- @param cmd invk.game_mode.ConsoleCommmand
function M:register_command(cmd)
  Convars:RegisterCommand(cmd.name, self:command_handler(cmd.method), cmd.help, cmd.flags or 0)
end

function M:register_commands()
  self:d("  (commands) register commands")

  for _, cmd in ipairs(COMMANDS) do
    if not cmd.dev or (cmd.dev and self.env == Env.DEVELOPMENT) then
      self:register_command(cmd)
    end
  end
end

--- Sets debugging on/off.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param arg? string # `"1"`: enables debugging, `"0"`: disables debugging, `nil`: prints debugging value.
function M:CommandSetDebug(_player, arg)
  if arg == "1" then
    self.logger.level = Logger.Level.DEBUG
  elseif arg == "0" then
    self.logger.level = Logger.Level.INFO
  else
    print(F("inv_debug = %d", self.logger.level <= Logger.Level.DEBUG and 1 or 0))
  end
end

--- Placeholder command to run miscellaneous debug code.
---
--- Use `script_reload` to reload after changes.
---
--- @param player CDOTAPlayerController # Player who issued this console command.
--- @param ... any
function M:CommandDebugMisc(player, ...)
  local cmd = require("invk.game_mode.commands.debug_misc")

  cmd.run(self, player, ...)
end

--- Dumps Lua version.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @diagnostic disable-next-line: unused
function M:CommandDumpLuaVersion(_player)
  print(_VERSION)
end

--- Dumps global value.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param name string # Dot-separated value name
--- @diagnostic disable-next-line: unused
function M:CommandDumpGlobal(_player, name)
  if not name then
    error("Argument <name> is required")
  end

  local cmd = require("invk.game_mode.commands.globals")

  cmd.dump(name)
end

--- Searches a global value.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param pattern string # Name pattern (uses `string.match` for matching)
--- @diagnostic disable-next-line: unused
function M:CommandFindGlobal(_player, pattern)
  if not pattern then
    error("Argument <pattern> is required")
  end

  local cmd = require("invk.game_mode.commands.globals")

  cmd.find(pattern)
end

--- Queries items.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param query string # Query string
function M:CommandItemQuery(_player, query)
  if not query then
    error("Argument <query> is required")
  end

  local cmd = require("invk.game_mode.commands.item")

  cmd.query(self, query)
end

--- Dumps current hero abilities.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param simple? string # Simple version or verbose
--- @diagnostic disable-next-line: unused
function M:CommandDumpAbilities(player, simple)
  local cmd = require("invk.game_mode.commands.dump_abilities")

  cmd.run(player, simple ~= nil)
end

--- Invokes ability by name.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param ability string # Ability name
--- @diagnostic disable-next-line: unused
function M:CommandInvokeAbility(player, ability)
  if not ability then
    error("Argument <ability> is required")
  end

  local hero = player:GetAssignedHero()
  local invoker = Invoker:new(hero)

  invoker:invoke(ability)
end

--- Dumps combo graph in DOT format.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param id string # Combo id
function M:CommandDumpComboGraph(_player, id)
  if not id then
    error("Argument <combo_id> is required")
  end

  local cmd = require("invk.game_mode.commands.combo")

  cmd.todot(self, id)
end

--- Changes music status.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param status string # Music status
--- @param intensity string # Music intensity
--- @diagnostic disable-next-line: unused
function M:CommandChangeMusicStatus(player, status, intensity)
  if not status or not intensity then
    error("Arguments <status> and <intensity> are required")
  end

  local cmd = require("invk.game_mode.commands.music")

  cmd.set_status(player, status, intensity)
end

--- Dumps Invoker ability specials values.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param only_scaling? string # Dump only values that scale, ignoring fixed values
--- @diagnostic disable-next-line: unused
function M:CommandDumpSpecials(player, only_scaling)
  local cmd = require("invk.game_mode.commands.dump_specials")

  cmd.dump(player, { only_scaling = (only_scaling ~= nil) })
end

--- Debug operations on ability specials KeyValues.
--- @param _player CDOTAPlayerController # Player who issued this console command
--- @param op string # Operation name (`dump`, `find_keys`, `find_values`)
--- @param query string # Operation query (dump: path, findKeys: pattern, findValues: pattern)
--- @diagnostic disable-next-line: unused
function M:CommandDebugSpecials(_player, op, query)
  local cmd = require("invk.game_mode.commands.debug_specials")

  if op == "dump" then
    cmd.dump(query)
  elseif op == "find_keys" then
    cmd.find_keys(query)
  elseif op == "find_values" then
    cmd.find_values(query)
  else
    errorf("Invalid op %q", op)
  end
end

--- Reinserts an ability into the current hero.
--- @param player CDOTAPlayerController # Player who issued this console command
--- @param name string # Ability name
--- @diagnostic disable-next-line: unused
function M:CommandReinsertAbility(player, name)
  if not name then
    error("Argument <name> is required")
  end

  local cmd = require("invk.game_mode.commands.ability")

  cmd.reinsert(player, name)
end

--- }}}
--- convars {{{

function M:register_convars()
  self:d("  (convars) register convars")
end

--- }}}

return M
