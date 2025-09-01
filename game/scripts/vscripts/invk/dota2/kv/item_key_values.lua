local class = require("middleclass")

local KeyValues = require("invk.dota2.kv.key_values")
local tbl = require("invk.lang.table")

--- ItemKeyValues class.
--- @class invk.dota2.kv.ItemKeyValues : middleclass.Class, invk.dota2.kv.KeyValues
--- @field name string
--- @field shop_tags string[]
local M = class("invk.dota2.kv.ItemKeyValues", KeyValues)

--- Constructor.
--- @param name string # Item name
--- @param data invk.dota2.KeyValues # KeyValues data
function M:initialize(name, data)
  KeyValues.initialize(self, data)

  self.name = name
  self.shop_tags = self:get_strings("ItemShopTags", ";")
end

--- Checks if the item matches the given search query.
---
--- It searches for matches in these entries:
---
--- * `ItemShopTags`
---
--- @param query string # Query string
--- @return boolean
function M:matches_query(query)
  --- @param s string
  --- @return boolean
  local function matcher(s)
    return s:match(query) ~= nil
  end

  return matcher(self.name) or (tbl.index(self.shop_tags, matcher) ~= nil)
end

return M
