--- Collection of `ItemKeyValues`.
-- @classmod invokation.dota2.kv.ItemsKeyValues

local M = require("pl.class")()

local ITEMS = require("invokation.const.items")
local ItemKeyValues = require("invokation.dota2.kv.ItemKeyValues")

local ITEM_KEY_PATT = "^item_"

--- Constructor.
--
-- Reads all entries in `scripts/npc/items.txt` and convert each valid item
-- entry into `ItemKeyValues` instances.
--
function M:_init()
  self:loadItems()
end

function M:loadItems()
  self.itemsKV = {}

  for name, kv in pairs(ITEMS.KEY_VALUES) do
    if name:match(ITEM_KEY_PATT) and type(kv) == "table" then
      self.itemsKV[name] = ItemKeyValues(name, kv)
    end
  end
end

--- Returns an iterator function that iterates over the `ItemKeyValues` entries.
-- @treturn function
function M:Entries()
  return pairs(self.itemsKV)
end

--- Searches for item KeyValues matching the given query.
-- @tparam string query Query string
-- @treturn {[string]=ItemKeyValues,...} A map of found `ItemKeyValues` with item nameids as keys
function M:Search(query)
  local items = {}

  for name, itemKV in self:Entries() do
    if itemKV:MatchesQuery(query) then
      items[name] = itemKV.kv
    end
  end

  return items
end

return M
