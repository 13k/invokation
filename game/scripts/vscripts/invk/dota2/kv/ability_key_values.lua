local class = require("middleclass")

local KeyValues = require("invk.dota2.kv.key_values")

--- AbilityKeyValues class.
--- @class invk.dota2.kv.AbilityKeyValues : invk.dota2.kv.KeyValues
--- @field name string
--- @field kv invk.dota2.KeyValues
local M = class("invk.dota2.kv.AbilityKeyValues", KeyValues)

--- Constructor.
--- @param name string # Ability name
--- @param data invk.dota2.KeyValues # KeyValues data
function M:initialize(name, data)
  KeyValues.initialize(self, data)

  self.name = name
end

return M
