local class = require("middleclass")

local kv = require("invk.dota2.kv")
local str = require("invk.lang.string")
local tbl = require("invk.lang.table")

--- @class invk.dota2.kv.KeyValues : middleclass.Class
--- @field data invk.dota2.KeyValues
--- @field load fun(class: invk.dota2.kv.KeyValues, path: string): invk.dota2.kv.KeyValues
local M = class("invk.dota2.kv.KeyValuesBase")

--- @param path string # KeyValues file path
--- @return invk.dota2.kv.KeyValues
function M.static:load(path)
  return self:new(LoadKeyValues(path))
end

--- @param data invk.dota2.KeyValues
function M:initialize(data)
  self.data = data
end

--- @generic T
--- @param key string
--- @param ty invk.dota2.kv.Type
--- @param default? T
--- @return T?
function M:get(key, ty, default)
  local value = self.data[key]

  if value == nil then
    return default
  end

  return kv.require_type(ty, value)
end

--- @generic T
--- @param key string
--- @param ty invk.dota2.kv.Type
--- @return T
function M:require(key, ty)
  local value = self:get(key, ty)

  return assertf(value, "KeyValues key %q not found", key)
end

--- @param key string
--- @param default? string
--- @return string?
function M:get_string(key, default)
  return self:get(key, kv.Type.String, default)
end

--- @param key string
--- @param default? number
--- @return number?
function M:get_number(key, default)
  return self:get(key, kv.Type.Number, default)
end

--- @param key string
--- @param default? integer
--- @return integer?
function M:get_integer(key, default)
  return self:get_number(key, default) --[[@as integer?]]
end

--- @param key string
--- @param default? invk.dota2.KeyValues
--- @return invk.dota2.kv.KeyValues?
function M:get_kv(key, default)
  local data = self:get(key, kv.Type.KeyValues, default)

  if data == nil then
    return nil
  end

  return M:new(data)
end

--- @param key string
--- @return string
function M:require_string(key)
  return self:require(key, kv.Type.String)
end

--- @param key string
--- @return number
function M:require_number(key)
  return self:require(key, kv.Type.Number)
end

--- @param key string
--- @return integer
function M:require_integer(key)
  return self:require_number(key) --[[@as integer]]
end

--- @param key string
--- @return invk.dota2.kv.KeyValues
function M:require_kv(key)
  local data = self:require(key, kv.Type.KeyValues)

  return M:new(data)
end

--- Splits a value into an array of strings.
--- @param key string
--- @param sep string
--- @return string[]
function M:get_strings(key, sep)
  local s = self:get_string(key)

  if not s then
    return {}
  end

  local strings = str.split(s, sep)

  strings = tbl.map(strings, str.trim)

  return strings
end

return M
