--- ItemKeyValues class.
-- @classmod invokation.dota2.kv.ItemKeyValues

local M = require("pl.class")()

local KV = require("invokation.dota2.kv")
local func = require("pl.func")
local tablex = require("pl.tablex")

local function normalize(kv)
  kv.AbilitySpecial = KV.Table(kv.AbilitySpecial)
  kv.AbilityBehavior = KV.MultiValue(kv.AbilityBehavior, "|")
  kv.ItemDeclarations = KV.MultiValue(kv.ItemDeclarations, "|")
  kv.ItemShopTags = KV.MultiValue(kv.ItemShopTags, ";")
  kv.ItemAliases = KV.MultiValue(kv.ItemAliases, ";")
  kv.ShouldBeSuggested = KV.Bool(kv.ShouldBeSuggested)
  kv.SideShop = KV.Bool(kv.SideShop)

  return kv
end

--- Constructor.
function M:_init(id, kv)
  self.id = id
  self.kv = normalize(kv)
end

function M:Entries()
  return pairs(self.kv)
end

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
