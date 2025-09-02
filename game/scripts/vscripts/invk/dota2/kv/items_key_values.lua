local class = require("middleclass")

local ItemKeyValues = require("invk.dota2.kv.item_key_values")
local KeyValues = require("invk.dota2.kv.key_values")
local tbl = require("invk.lang.table")

local KV_PATH = "scripts/npc/items.txt"
local ITEM_KEY_PREFIX = "item_"

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
  self.data = tbl.map(data, M.parse_item_entry)
end

--- @private
--- @param value invk.dota2.kv.Value
--- @param key string
--- @return invk.dota2.kv.ItemKeyValues?
function M.parse_item_entry(value, key)
  if key:sub(1, #ITEM_KEY_PREFIX) == ITEM_KEY_PREFIX and type(value) == "table" then
    return ItemKeyValues:new(key, value)
  end

  return nil
end

--- Searches for item KeyValues matching the given query.
--- @param query string # Query string
--- @return invk.dota2.KeyValues # Table of found items
function M:search(query)
  return tbl.map(
    self.data,
    --- @param item invk.dota2.kv.ItemKeyValues
    --- @return invk.dota2.KeyValues?
    function(item)
      return item:matches_query(query) and item.data or nil
    end
  )
end

return M
