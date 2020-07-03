--- NetTable class.
-- @classmod invokation.dota2.NetTable
local class = require("pl.class")
local tablex = require("pl.tablex")

local NET_TABLE = require("invokation.const.net_table")

local M = class()

tablex.update(M, NET_TABLE)

--- Constructor.
-- @tparam string name Net table name
function M:_init(name)
  self.name = name
end

--- Sets a net table value.
-- @tparam string key Key
-- @param value Value
-- @treturn bool Setting success
function M:Set(key, value)
  return CustomNetTables:SetTableValue(self.name, key, value)
end

--- Gets a net table value.
-- @tparam string key Key
-- @param[opt=nil] defaultValue Default value in case the net table value is `nil`
-- @return Value of `key` if it exists, `defaultValue` otherwise
function M:Get(key, defaultValue)
  local value = CustomNetTables:GetTableValue(self.name, key)

  if value == nil then
    return defaultValue
  end

  return value
end

return M
