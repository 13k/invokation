--- NetTables
-- @submodule invokation.GameMode

local m = require("moses")

local INVOKER = require("invokation.const.invoker")
local NET_TABLE = require("invokation.const.net_table")
local SHOP_ITEMS = require("invokation.const.shop_items")

--- NetTables
-- @section net_tables

function GameMode:setupNetTables()
  self:setupNetTableMain()
  self:setupNetTableHeroKV()
  self:setupNetTableAbilitiesKV()
end

function GameMode:setupNetTableMain()
  self:setupNetTableShopItems()
  self:setupNetTableHeroData()
end

function GameMode:setupNetTableShopItems()
  self.netTables.MAIN:Set(NET_TABLE.MAIN.KEYS.SHOP_ITEMS, SHOP_ITEMS.KEY_VALUES)
  self:d("  setup net tables: shop items")
end

function GameMode:setupNetTableHeroData()
  local value = INVOKER:Serialize()

  self.netTables.MAIN:Set(NET_TABLE.MAIN.KEYS.HERO_DATA, value)

  self:d("  setup net tables: hero data")
end

function GameMode:setupNetTableHeroKV()
  local value = INVOKER.HERO_KEY_VALUES:Serialize()

  self.netTables.HERO:Set(NET_TABLE.HERO.KEYS.KEY_VALUES, value)

  self:d("  setup net tables: hero keyvalues")
end

function GameMode:setupNetTableAbilitiesKV()
  local value = m.map(INVOKER.ABILITIES_KEY_VALUES, function(kv)
    return kv:Serialize()
  end)

  self.netTables.ABILITIES:Set(NET_TABLE.ABILITIES.KEYS.KEY_VALUES, value)

  self:d("  setup net tables: abilities keyvalues")
end
