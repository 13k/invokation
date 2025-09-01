local class = require("middleclass")

local ItemKeyValues = require("invk.dota2.kv.item_key_values")
local KeyValues = require("invk.dota2.kv.key_values")
local tbl = require("invk.lang.table")

local KV_PATH = "scripts/npc/items.txt"
local ITEM_KEY_PATT = "^item_"

--- @param value invk.dota2.kv.Value
--- @param key string
--- @return invk.dota2.kv.ItemKeyValues?
local function parse_item_entry(value, key)
  if key:match(ITEM_KEY_PATT) and type(value) == "table" then
    return ItemKeyValues:new(key, value)
  else
    return nil
  end
end

--- Collection of [invk.dota2.kv.ItemKeyValues].
--- @class invk.dota2.kv.ItemsKeyValues : middleclass.Class
--- @field data { [string]: invk.dota2.kv.ItemKeyValues }
--- @field load fun(): invk.dota2.kv.ItemsKeyValues
local M = class("invk.dota2.kv.ItemsKeyValues")

--- @return invk.dota2.kv.ItemsKeyValues
function M.static:load()
  local items = KeyValues:load(KV_PATH)

  return self:new(items.data)
end

--- Constructor.
--- @param data invk.dota2.KeyValues # KeyValues data
function M:initialize(data)
  self.data = tbl.map(data, parse_item_entry)
end

--- Searches for item KeyValues matching the given query.
--- @param query string # Query string
--- @return invk.dota2.KeyValues # A table of found entries
function M:search(query)
  return tbl.map(self.data, function(item)
    if item:MatchesQuery(query) then
      return item.data
    else
      return nil
    end
  end)
end

return M
