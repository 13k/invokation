--- NetTables
-- @submodule invokation.GameMode

--- NetTables
-- @section net_tables

local m = require("moses")

local INVOKER = require("invokation.const.invoker")
local NET_TABLE = require("invokation.const.net_table")
local SHOP_ITEMS = require("invokation.const.shop_items")

function GameMode:setupNetTables()
  self:setupNetTableShopItems()
  self:setupNetTableAbilities()
end

function GameMode:setupNetTableShopItems()
  self.netTable:Set(NET_TABLE.MAIN_KEYS.SHOP_ITEMS, SHOP_ITEMS.KEY_VALUES)
  self:d("  setup shop items NetTable data")
end

function GameMode:setupNetTableAbilities()
  local serialize = m.chain(m.result):partialRight("Serialize"):unary():value()
  local abilities = m.map(INVOKER.ABILITIES_KEY_VALUES, serialize)

  self.netTable:Set(NET_TABLE.MAIN_KEYS.ABILITIES_KEY_VALUES, abilities)

  self:d("  setup abilities NetTable data")
end
