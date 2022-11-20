--- KeyValue utils.
-- @module invokation.dota2.kv

local m = require("moses")
local stringx = require("pl.stringx")

local ENUMS = require("invokation.const.enums")

local M = {}

local function warn(fmt, ...)
  if not IsInToolsMode() then
    return
  end

  print("(WARNING) [kv] " .. fmt:format(...))
end

--- Transforms a KeyValue table value with numeric strings as keys into an array.
-- @tparam {[string]=any,...} value String-keyed table
-- @return Unmodified value if it's not a table
-- @treturn {any,...} Array of values
function M.Array(value)
  if not m.isTable(value) then
    return value
  end

  return m.map(value, function(v, k)
    return tonumber(k), v
  end)
end

--- Transforms a KeyValue value into a boolean.
-- @tparam any value Value
-- @treturn bool `true` if the value equals to the number `1`
-- @treturn bool `false` otherwise
function M.Bool(value)
  return value == 1
end

--- Splits a KeyValue string value into an array of strings.
-- @tparam string value String value
-- @tparam string sep Separator
-- @return Unmodified value if it's not a string
-- @treturn {string,...} String array
function M.Strings(value, sep)
  if not m.isString(value) then
    return value
  end

  value = stringx.split(value, sep)

  return m.map(value, m.unary(stringx.strip))
end

--- Splits a KeyValue string value into an array of numbers.
-- @tparam string value String value
-- @tparam[opt=" "] string sep Separator
-- @return Unmodified value if it's not a string
-- @treturn {number,...} Number array
function M.Numbers(value, sep)
  sep = sep or " "
  value = M.Strings(value, sep)

  if not m.isTable(value) then
    return value
  end

  return m.map(value, m.unary(tonumber))
end

--- Converts an enum name into an enum value (a global value defined by the engine).
-- @tparam string name Enum name
-- @treturn nil If name is `nil`
-- @treturn int `0` if the enum name is invalid (not a string) or is not defined
-- @treturn int The enum value if it exists
function M.EnumValue(name)
  if name == nil then
    return
  end

  if not m.isString(name) then
    warn("EnumValue(): invalid name %s [%s]", name, type(name))
    return 0
  end

  -- selene: allow(global_usage)
  local value = _G[name] or ENUMS[name]

  if value == nil then
    warn("EnumValue(): name %q not found", name)
    return 0
  end

  return value
end

--- Splits a KeyValue string value into an array of enum values.
--
-- It uses the separator `"|"` to split the string, then converts the values
-- using @{EnumValue}.
--
-- @tparam string value String value
-- @return Unmodified value if it's not a string
-- @treturn {int,...} Array of enum values (integers)
function M.EnumValues(value)
  value = M.Strings(value, "|")

  if not m.isTable(value) then
    return value
  end

  return m.map(value, M.EnumValue)
end

--- Converts a KeyValue string value into a numeric bitmap flag.
--
-- It uses the separator `"|"` to split the string, then converts the values
-- using @{EnumValue} and reduces the values with bitwise OR.
--
-- @tparam string value String value
-- @return Unmodified value if it's not a string
-- @treturn int OR'ed enum values
function M.Flags(value)
  value = M.EnumValues(value)

  if not m.isTable(value) then
    return value
  end

  return m.reduce(value, bit.bor)
end

local ABILITY_SPECIAL_CAST = { FIELD_FLOAT = M.Numbers, FIELD_INTEGER = M.Numbers }

--- Table of known extra fields to be converted in @{AbilitySpecial}.
-- @table ABILITY_SPECIAL_EXTRA
local ABILITY_SPECIAL_EXTRA = {
  CalculateSpellDamageTooltip = M.Bool, -- bool
  RequiresScepter = M.Bool, -- bool
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

--- AbilitySpecialEntry spec
-- @table AbilitySpecialEntry
-- @tfield string var_type
-- @field[opt] ... variable number of special fields

--- Parses a single ability special value (a single entry in an `AbilitySpecial` value).
--
-- It converts the "main" special key value using the type provided in the
-- `var_type` field and converts known extra fields to known types.
--
-- For example, if `var_type` is `"FIELD_FLOAT"` and the main special key
-- `cooldown` has the value `"10.5 7.3 5.1"`, it will set `cooldown` in the
-- result with the value `{10.5, 7.3, 5.1}` (an array of actual floats).
--
-- See @{ABILITY_SPECIAL_EXTRA} for the table of known extra fields.
--
-- @tparam AbilitySpecialEntry value An `AbilitySpecial` entry
-- @return Unmodified value if it's not a string
-- @return Unmodified value if it does not contain a `var_type` field
-- @treturn AbilitySpecialEntry Clone of original value with the "main" field
--   converted to the appropriate type
function M.AbilitySpecial(value)
  if not m.isTable(value) then
    return value
  end

  if not m.isString(value.var_type) then
    return value
  end

  local castField = m.chain(castAbilitySpecialField):partialRight(value.var_type):rearg({ 2, 1 }):value()

  return m.map(value, castField)
end

--- Parses a whole `AbilitySpecial` field.
--
-- Converts the field into an array with @{Array}, then uses @{AbilitySpecial}
-- to parse each entry in the field.
--
-- @tparam {[string]=AbilitySpecialEntry,...} value `AbilitySpecial` field value
-- @return Unmodified value if it's not a table
-- @treturn {AbilitySpecialEntry,...} Array of parsed entries
function M.AbilitySpecials(value)
  value = M.Array(value)

  if not m.isTable(value) then
    return value
  end

  return m.map(value, M.AbilitySpecial)
end

return M
