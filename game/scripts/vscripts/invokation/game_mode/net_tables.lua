--- NetTables
-- @submodule invokation.GameMode

local m = require("moses")

local INVOKER = require("invokation.const.invoker")
local NET_TABLE = require("invokation.const.net_table")

--- NetTables
-- @section net_tables

function GameMode:setupNetTables()
  self:setupNetTableMain()
  self:setupNetTableHeroKV()
  self:setupNetTableAbilitiesKV()
end

function GameMode:setupNetTableMain()
  self:setupNetTableHeroData()
end

function GameMode:setupNetTableHeroData()
  self.netTables.MAIN:Set(NET_TABLE.MAIN.KEYS.HERO_DATA, INVOKER:Serialize())

  self:d("  setup net tables: hero data")
end

function GameMode:setupNetTableHeroKV()
  self.netTables.HERO:Set(NET_TABLE.HERO.KEYS.KEY_VALUES, INVOKER.HERO_KEY_VALUES:Serialize())

  self:d("  setup net tables: hero keyvalues")
end

function GameMode:setupNetTableAbilitiesKV()
  self.netTables.ABILITIES:Set(
    NET_TABLE.ABILITIES.KEYS.KEY_VALUES,
    m.map(INVOKER.ABILITIES_KEY_VALUES, function(kv)
      return kv:Serialize()
    end)
  )

  self:d("  setup net tables: abilities keyvalues")
end
