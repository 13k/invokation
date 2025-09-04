local class = require("middleclass")

local Logger = require("invk.logger")

--- @class invk.net_table.Config
--- @field name invk.net_table.Name
--- @field keys { [string]: string }

--- NetTable class.
--- @class invk.dota2.NetTable : middleclass.Class, invk.log.Mixin
--- @field name invk.net_table.Name
--- @field keys { [string]: string }
--- @field logger invk.Logger?
local M = class("invk.dota2.NetTable")

M:include(Logger.Mixin)

--- @class invk.dota2.NetTableOptions
--- @field logger? invk.Logger

--- Constructor.
--- @param config invk.net_table.Config # Net table config
--- @param options? invk.dota2.NetTableOptions
function M:initialize(config, options)
  local opts = options or {}

  self.name = config.name
  self.keys = config.keys

  if opts.logger then
    self.logger = opts.logger:child(F("net_table.%s", self.name))
  end
end

--- Sets a net table value.
--- @param key string # Key
--- @param value any # Value
--- @return boolean # Setting success
function M:set(key, value)
  local ok = CustomNetTables:SetTableValue(self.name, key, value)

  self:debugf("set %q (%s): %s", key, type(value), ok)

  return ok
end

--- Gets a net table value.
--- @param key string # Key
--- @param default? any # Default value in case the net table value is `nil` (default: `nil`)
--- @return any # Value of `key` if it exists, `defaultValue` otherwise
function M:get(key, default)
  local value = CustomNetTables:GetTableValue(self.name, key)

  self:debugf("get %q (%s)", key, type(value))

  if value == nil then
    return default
  end

  return value
end

return M
