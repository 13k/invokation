local class = require("middleclass")

local Combos = require("invk.combo.combos")
local CustomEvents = require("invk.game_mode.custom_events")
local Env = require("invk.game_mode.env")
local GameEvents = require("invk.game_mode.game_events")
local INVOKER = require("invk.const.invoker")
local ItemsKeyValues = require("invk.dota2.kv.items_key_values")
local Logger = require("invk.logger")
local META = require("invk.const.metadata")
local NET_TABLES = require("invk.const.net_table")
local NetTable = require("invk.dota2.net_table")
local PRECACHE = require("invk.const.precache")
local S = require("invk.const.settings")
local Timers = require("invk.dota2.timers")
local commands = require("invk.game_mode.commands.index")
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

--- @param id invk.game_mode.command.Id
--- @return fun(cmd_name: string, ...: string)
function M:command_handler(id)
  --- @param name string
  --- @param ... string
  return function(name, ...)
    local args = { ... }

    self:d("console command", {
      id = id,
      name = name,
      args = args,
    })

    local pawn = Convars:GetDOTACommandClient() --[[@as CBasePlayerPawn]]
    local player = pawn:GetController()
    local cmd = commands[id]:new(self, player, args, { logger = self.logger })

    cmd:run()
  end
end

--- @param spec invk.game_mode.command.Spec
function M:register_command(spec)
  Convars:RegisterCommand(spec.name, self:command_handler(spec.id), spec.help, spec.flags or 0)
end

function M:register_commands()
  self:d("  (commands) register commands")

  for _, id in pairs(commands.Id) do
    local cmd = commands[id]

    if not cmd.SPEC.dev or (cmd.SPEC.dev and self.env == Env.DEVELOPMENT) then
      self:register_command(cmd.SPEC)
    end
  end
end

--- }}}
--- convars {{{

function M:register_convars()
  self:d("  (convars) register convars")
end

--- }}}

return M
