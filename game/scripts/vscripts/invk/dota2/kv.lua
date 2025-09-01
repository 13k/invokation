local inspect = require("inspect")

--- @alias invk.dota2.KeyValues { [string]: invk.dota2.kv.Value }

--- @alias invk.dota2.kv.Value
--- | number
--- | string
--- | invk.dota2.KeyValues

--- KeyValue utils.
--- @class invk.dota2.kv
local M = {}

--- KeyValue value type.
--- @enum invk.dota2.kv.Type
M.Type = {
  Number = "number",
  String = "string",
  KeyValues = "kv",
}

--- @param ty invk.dota2.kv.Type
--- @param value invk.dota2.kv.Value
--- @return invk.dota2.kv.Value
function M.require_type(ty, value)
  local lua_ty = type(value)
  local message = F("expected KeyValues type %q for value %s", ty, inspect(value))

  if ty == M.Type.Number then
    assert(lua_ty == "number", message)
  elseif ty == M.Type.String then
    assert(lua_ty == "string", message)
  elseif ty == M.Type.KeyValues then
    assert(lua_ty == "table", message)
  else
    errorf("invalid KeyValues type %q", ty)
  end

  return value
end

return M
