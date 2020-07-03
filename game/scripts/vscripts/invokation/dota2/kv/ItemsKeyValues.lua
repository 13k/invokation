--- Collection of `ItemKeyValues`.
-- @classmod invokation.dota2.kv.ItemsKeyValues
local m = require("moses")
local class = require("pl.class")
local ItemKeyValues = require("invokation.dota2.kv.ItemKeyValues")

local ITEMS = require("invokation.const.items")

local M = class()

local ITEM_KEY_PATT = "^item_"

local function selectItemEntry(name, kv)
  if name:match(ITEM_KEY_PATT) and type(kv) == "table" then
    return name, ItemKeyValues(name, kv)
  end

  return nil, nil
end

--- Constructor.
function M:_init()
  self.__data = m.map(ITEMS.KEY_VALUES, m.rearg(selectItemEntry, {2, 1}))
end

--- Returns an iterator function that iterates over the @{ItemKeyValues} entries.
-- @treturn iter(string,ItemKeyValues)
function M:Entries()
  return pairs(self.__data)
end

--- Searches for item KeyValues matching the given query.
-- @tparam string query Query string
-- @treturn {[string]=ItemKeyValues,...} A table of found entries
function M:Search(query)
  local items = {}

  for _, kv in self:Entries() do
    if kv:MatchesQuery(query) then
      items[kv.Name] = kv:Serialize()
    end
  end

  return items
end

return M
