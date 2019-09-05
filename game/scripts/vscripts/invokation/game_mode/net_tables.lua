--- NetTables
-- @submodule invokation.GameMode

--- NetTables
-- @section net_tables

local NET_TABLE_SHOP_ITEMS_KEY = "shop_items"
local SHOP_ITEMS_FILE = "scripts/custom_game/shops.txt"

function GameMode:setupNetTables()
  self:setupNetTableShopItems()
end

local function loadShopItems()
  return LoadKeyValues(SHOP_ITEMS_FILE)
end

function GameMode:setupNetTableShopItems()
  self.netTable:Set(NET_TABLE_SHOP_ITEMS_KEY, loadShopItems())
  self:d("  setup shop items NetTable data")
end
