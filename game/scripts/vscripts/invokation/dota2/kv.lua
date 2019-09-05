--- KeyValue utils.
-- @module invokation.dota2.kv

local M = {}

local tablex = require("pl.tablex")
local stringx = require("pl.stringx")

function M.Table(kv)
  local t = {}

  if not kv then
    return t
  end

  for key, value in pairs(kv) do
    t[tonumber(key)] = value
  end

  return t
end

function M.MultiValue(value, sep)
  value = value and stringx.split(value, sep) or {}
  return tablex.imap(stringx.strip, value)
end

function M.Bool(value)
  return value == 1
end

return M
