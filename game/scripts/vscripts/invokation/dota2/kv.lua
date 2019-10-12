--- KeyValue utils.
-- @module invokation.dota2.kv

local m = require("moses")
local stringx = require("pl.stringx")

local ENUMS = require("invokation.const.enums")

local M = {}

local function warn(fmt, ...)
  if not IsInToolsMode() then return end

  print("(WARNING) [kv] " .. fmt:format(...))
end

function M.List(value)
  if not m.isTable(value) then
    return value
  end

  return m.map(value, function(v, k)
    return tonumber(k), v
  end)
end

function M.Bool(value)
  return value == 1
end

function M.Strings(value, sep)
  if not m.isString(value) then
    return value
  end

  value = stringx.split(value, sep)

  return m.map(value, m.unary(stringx.strip))
end

function M.Numbers(value, sep)
  sep = sep or " "
  value = M.Strings(value, sep)

  if not m.isTable(value) then
    return value
  end

  return m.map(value, m.unary(tonumber))
end

function M.EnumValue(key)
  if key == nil then return end

  if not m.isString(key) then
    warn("EnumValue(): invalid key %s [%s]", key, type(key))
    return 0
  end

  local value = _G[key] or ENUMS[key]

  if value == nil then
    warn("EnumValue(): key %q not found", key)
    return 0
  end

  return _G[key]
end

function M.EnumValues(value)
  value = M.Strings(value, "|")

  if not m.isTable(value) then
    return value
  end

  return m.map(value, M.EnumValue)
end

function M.Flags(value)
  value = M.EnumValues(value)

  if not m.isTable(value) then
    return value
  end

  return m.reduce(value, bit.bor)
end

local ABILITY_SPECIAL_CAST = {
  FIELD_FLOAT = M.Numbers,
  FIELD_INTEGER = M.Numbers,
}

local ABILITY_SPECIAL_EXTRA = {
  CalculateSpellDamageTooltip = M.Bool,
  RequiresScepter = M.Bool,
}

local function castAbilitySpecialField(key, value, varType)
  if key == "var_type" then
    return value
  end

  local castFn = ABILITY_SPECIAL_EXTRA[key]

  if castFn then
    return castFn(value)
  end

  if m.isString(value) and value:match("%s") then
    castFn = ABILITY_SPECIAL_CAST[varType]

    if castFn then
      return castFn(value)
    end

    warn("AbilitySpecial(): unknown 'var_type' value: %q", varType)
  end

  return value
end

function M.AbilitySpecial(value)
  if not m.isTable(value) then
    return value
  end

  if not m.isString(value.var_type) then
    return value
  end

  local castField =
    m.chain(castAbilitySpecialField):partialRight(value.var_type):rearg({ 2, 1 }):value()

  return m.map(value, castField)
end

function M.AbilitySpecials(value)
  value = M.List(value)

  if not m.isTable(value) then
    return value
  end

  return m.map(value, M.AbilitySpecial)
end

return M