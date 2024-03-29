--- ItemKeyValues class.
-- @classmod invokation.dota2.kv.ItemKeyValues
local m = require("moses")
local KV = require("invokation.dota2.kv")
local class = require("pl.class")

local M = class()

--- Constructor.
-- @tparam string name Item name
-- @tparam {[string]=any,...} kv KeyValues data
function M:_init(name, kv)
  local fields = m.extend({}, { Name = name }, kv)

  m.extend(self, fields)

  self.__data = fields
  self.AbilitySpecial = KV.AbilitySpecials(kv.AbilitySpecial)
  self.AbilityBehavior = KV.Flags(kv.AbilityBehavior)
  self.ItemDeclarations = KV.Strings(kv.ItemDeclarations, "|")
  self.ItemShopTags = KV.Strings(kv.ItemShopTags, ";")
  self.ItemAliases = KV.Strings(kv.ItemAliases, ";")
  self.ShouldBeSuggested = KV.Bool(kv.ShouldBeSuggested)
  self.SideShop = KV.Bool(kv.SideShop)
end

--- Serializes the KeyValues data
-- @treturn {[string]=any,...} Serialized data
function M:Serialize()
  return self.__data
end

--- Returns an iterator function that iterates over the KeyValues entries.
-- @treturn iter(string,any)
function M:Entries()
  return pairs(self:Serialize())
end

--- Checks if the item matches the given search query.
--
-- It searches for matches in these entries:
--
-- * `ItemShopTags`
-- * `ItemAliases`
--
-- @tparam string query Query string
-- @treturn bool
function M:MatchesQuery(query)
  local matcher = m.chain(string.match):partialRight(query):unary():value()

  return (m.isTable(self.ItemShopTags) and m.findIndex(self.ItemShopTags, matcher))
    or (m.isTable(self.ItemAliases) and m.findIndex(self.ItemAliases, matcher))
end

return M
