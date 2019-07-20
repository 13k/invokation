--- Main class for the game.
-- @classmod invokation.GameMode

if _G.GameMode == nil then
  _G.GameMode = require("pl.class")()
end

if IsInToolsMode() then
  require("invokation.dota2.modmaker")
end

require("invokation.game_mode.game_rules")
require("invokation.game_mode.game_mode")
require("invokation.game_mode.events")
require("invokation.game_mode.commands")
require("invokation.game_mode.convars")

local Combos = require("invokation.combos.Combos")
local Logger = require("invokation.Logger")
local Timers = require("invokation.dota2.timers")
local lrandom = require("invokation.lang.random")
local NetTable = require("invokation.dota2.NetTable")
local Precache = require("invokation.const.precache")

local NET_TABLE_NAME = "invokation"

--- Constructor.
function GameMode:_init()
  self.logger = Logger(IsInToolsMode() and Logger.DEBUG or Logger.INFO, "invokation")
  self.netTable = NetTable(NET_TABLE_NAME)
  self.combos = Combos({logger = self.logger, netTable = self.netTable})
end

function GameMode:d(...)
  return self.logger:Debug(...)
end

function GameMode:err(...)
  return self.logger:Error(...)
end

--- Precaches resources/units/items/abilities that will be needed for sure in
-- your game and that will not be precached by hero selection.
--
-- When a hero is selected from the hero selection screen, the game will
-- precache that hero's assets, any equipped cosmetics, and perform the
-- data-driven precaching defined in that hero's `precache{}` block, as well as
-- the `precache{}` block for any equipped abilities.
function GameMode:Precache(context)
  self:d("Performing pre-load precache")

  for _, name in ipairs(Precache.UNITS) do
    PrecacheUnitByNameSync(name, context)
  end

  for path, resType in pairs(Precache.RESOURCES) do
    PrecacheResource(resType, path, context)
  end

  self.combos:Load()
end

--- Entry-point for the game initialization.
function GameMode:Activate()
  if GameMode._reentrantCheck then
    return
  end

  self:d("Loading GameMode...")

  Timers:Start()
  lrandom.randomseed()

  self.seenWaitForPlayers = false
  self.users = {}

  self:setupGameRules()
  self:setupGameMode()
  self:registerListeners()
  self:registerCustomListeners()
  self:registerCommands()
  self:registerConVars()

  self:d("Done loading GameMode!")
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
