--- Main class for the game.
-- @classmod invokation.GameMode
if _G.GameMode == nil then
  local class = require("pl.class")
  _G.GameMode = class()
end

require("invokation.game_mode.net_tables")
require("invokation.game_mode.game_rules")
require("invokation.game_mode.game_mode")
require("invokation.game_mode.events")
require("invokation.game_mode.commands")
require("invokation.game_mode.convars")

local m = require("moses")
local Env = require("invokation.game_mode.Env")
local func = require("invokation.lang.function")
local rand = require("invokation.lang.random")
local Combos = require("invokation.combos.Combos")
local Logger = require("invokation.Logger")
local Timers = require("invokation.dota2.timers")
local NetTable = require("invokation.dota2.NetTable")
local ItemsKeyValues = require("invokation.dota2.kv.ItemsKeyValues")

local PRECACHE = require("invokation.const.precache")

local LOGGER_PROGNAME = "invokation"

--- Initialization
-- @section init

GameMode.META = require("invokation.const.metadata")
GameMode._VERSION = GameMode.META.version

Logger.Extend(GameMode)

--- Precaches resources/units/items/abilities that will be needed for sure in
-- your game and that will not be precached by hero selection.
--
-- When a hero is selected from the hero selection screen, the game will
-- precache that hero's assets, any equipped cosmetics, and perform the
-- data-driven precaching defined in that hero's `precache{}` block, as well as
-- the `precache{}` block for any equipped abilities.
function GameMode.Precache(context)
  for _, name in ipairs(PRECACHE.UNITS) do
    PrecacheUnitByNameSync(name, context)
  end

  for path, resType in pairs(PRECACHE.RESOURCES) do
    PrecacheResource(resType, path, context)
  end
end

--- Constructor.
-- @tparam[opt] table options Options table
-- @tparam[opt] string options.env Environment
function GameMode:_init(options)
  options = options or {}
  options.env = options.env or (IsInToolsMode() and Env.DEVELOPMENT or Env.PRODUCTION)

  self.users = {}
  self.players = {}
  self.env = Env(options.env)
  self.logger = Logger(LOGGER_PROGNAME, self.env.development and Logger.DEBUG or Logger.INFO)
  self.netTable = NetTable(NetTable.MAIN)
  self.itemsKV = ItemsKeyValues()
  self.combos = Combos({logger = self.logger, netTable = self.netTable})
end

function GameMode:fnHandler(methodName)
  return self.env.development and func.lookupbyname(GameMode, methodName) or GameMode[methodName]
end

function GameMode:methodHandler(methodName)
  return m.bind(self:fnHandler(methodName), self)
end

--- Entry-point for the game initialization.
function GameMode:Activate()
  if GameMode._reentrantCheck then
    return
  end

  self:d("Loading GameMode...")

  self:setupModules()
  self:setupNetTables()
  self:setupGameRules()
  self:setupGameMode()
  self:registerGameEvents()
  self:registerCustomEvents()
  self:registerCommands()
  self:registerConVars()

  self:d("Done loading GameMode!")
end

function GameMode:setupModules()
  Timers:Start()
  self:d("  setup Timers")
  rand.seed()
  self:d("  setup random")

  if self.env.development then
    local ModMaker = require("invokation.dota2.modmaker")
    ModMaker.Start()
    self:d("  setup ModMaker")
  end
end

--- Used to set up async precache calls at the beginning of the gameplay.
--
-- In this function, place all of your `PrecacheItemByNameAsync` and
-- `PrecacheUnitByNameAsync`. These calls will be made after all players have
-- loaded in, but before they have selected their heroes.
-- `PrecacheItemByNameAsync` can also be used to precache dynamically-added
-- datadriven abilities instead of items. `PrecacheUnitByNameAsync` will
-- precache the `precache{}` block statement of the unit and all `precache{}`
-- block statements for every `Ability#` defined on the unit.
--
-- This function should only be called once. If you want to/need to precache
-- more items/abilities/units at a later time, you can call the functions
-- individually (for example if you want to precache units in a new wave of
-- holdout).
--
-- This function should generally only be used if @{Precache} is not working.
function GameMode:PostLoadPrecache()
  self:d("Performing Post-Load precache")
end

return GameMode
