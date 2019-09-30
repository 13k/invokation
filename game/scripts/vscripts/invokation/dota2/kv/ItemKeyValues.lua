--- ItemKeyValues class.
-- @classmod invokation.dota2.kv.ItemKeyValues

local M = require("pl.class")()

local KV = require("invokation.dota2.kv")
local func = require("pl.func")
local tablex = require("pl.tablex")

local function normalize(kv)
  kv.AbilitySpecial = KV.List(kv.AbilitySpecial)
  kv.AbilityBehavior = KV.MultiValue(kv.AbilityBehavior, "|")
  kv.ItemDeclarations = KV.MultiValue(kv.ItemDeclarations, "|")
  kv.ItemShopTags = KV.MultiValue(kv.ItemShopTags, ";")
  kv.ItemAliases = KV.MultiValue(kv.ItemAliases, ";")
  kv.ShouldBeSuggested = KV.Bool(kv.ShouldBeSuggested)
  kv.SideShop = KV.Bool(kv.SideShop)

  return kv
end

--- Constructor.
--
-- It will normalize the following KeyValues entries:
--
-- - **AbilitySpecial**: (_list_) convert to numeric indices list
-- - **AbilityBehavior**: (_list_) split the original string by `"|"`
-- - **ItemDeclarations**: (_list_) split the original string by `"|"`
-- - **ItemShopTags**: (_list_) split the original string by `";"`
-- - **ItemAliases**: (_list_) split the original string by `";"`
-- - **ShouldBeSuggested**: (_bool_) `true` if original value is `1`, `false` otherwise
-- - **SideShop**: (_bool_) `true` if original value is `1`, `false` otherwise
--
-- @tparam string id Item id
-- @tparam table kv KeyValues table for the item
function M:_init(id, kv)
  self.id = id
  self.kv = normalize(kv)
end

--- Serialize the KeyValues
-- @treturn table
function M:Serialize()
  return self.kv
end

--- Returns an entry value.
-- @tparam string key Entry key
function M:Get(key)
  return self.kv[key]
end

--- Returns an iterator function over the KeyValues entries.
-- @treturn function
function M:Entries()
  return pairs(self.kv)
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
  local matcher = func.bind(string.match, func._1, query)

  if tablex.find_if(self.kv.ItemShopTags, matcher) then
    return true
  end

  if tablex.find_if(self.kv.ItemAliases, matcher) then
    return true
  end

  return false
end

return M
