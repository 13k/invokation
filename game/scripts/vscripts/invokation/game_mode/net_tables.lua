--- NetTables
-- @submodule invokation.GameMode

--- NetTables
-- @section net_tables

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
