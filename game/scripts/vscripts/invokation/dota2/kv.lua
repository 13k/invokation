--- KeyValue utils.
-- @module invokation.dota2.kv

local M = {}

local tablex = require("pl.tablex")
local stringx = require("pl.stringx")

function M.List(kv)
  if kv == nil then
    return nil
  end

  return tablex.pairmap(
    function(key, value)
      return value, tonumber(key)
    end,
    kv
  )
end

function M.MultiValue(value, sep, kind)
  if type(value) ~= "string" then
    return value
  end

  value = stringx.split(tostring(value), sep)

  if #value == 1 then
    return value[1]
  end

  value = tablex.imap(stringx.strip, value)

  if kind == "number" then
    value = tablex.imap(tonumber, value)
  end

  return value
end

function M.Bool(value)
  return value == 1
end

return M
