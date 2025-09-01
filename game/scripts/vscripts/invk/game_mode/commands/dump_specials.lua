local INVOKER = require("invk.const.invoker")
local str = require("invk.lang.string")
local tbl = require("invk.lang.table")

--- @class invk.commands.dump_specials
local M = {}

--- @type { [string]: std.type }
local FIELD_TYPES = {
  FIELD_INTEGER = "number",
  FIELD_FLOAT = "number",
}

--- @param key string
--- @param value any
--- @param lua_type std.type
--- @return boolean
local function is_special_key(key, value, lua_type)
  if key == "var_type" then
    return false
  end

  if not key:match("^[a-z_]+$") then
    return false
  end

  local function is_lua_type(_, v)
    return type(v) == lua_type
  end

  if is_lua_type(nil, value) then
    return true
  end

  if type(value) == "table" then
    if tbl.all(value, is_lua_type) then
      return true
    end
  end

  return false
end

--- @param value invk.dota2.kv.Value
--- @return boolean
local function is_scaling_special_key(value)
  return type(value) == "table"
end

--- @param kv invk.dota2.KeyValues
--- @return invk.dota2.KeyValues
local function extract_specials(kv)
  return tbl.map(kv, function(special)
    if type(special) ~= "table" then
      return nil
    end

    --- @cast special invk.dota2.KeyValues

    if type(special.var_type) ~= "string" then
      return nil
    end

    local specials = tbl.filter(special, function(value, key)
      return is_special_key(key, value, FIELD_TYPES[value.var_type])
    end)

    return tbl.keys(specials)[1]
  end)
end

--- @param kv invk.dota2.KeyValues
--- @return invk.dota2.KeyValues
local function extract_scaling_specials(kv)
  return tbl.map(kv, function(special)
    if type(special) ~= "table" then
      return nil
    end

    --- @cast special invk.dota2.KeyValues

    local specials = tbl.filter(special, is_scaling_special_key)

    return tbl.keys(specials)[1]
  end)
end

--- @param player CDOTAPlayerController
--- @param options? { only_scaling?: boolean }
function M.dump(player, options)
  local opts = options or {}

  local hero = player:GetAssignedHero()
  --- @type fun(kv: invk.dota2.KeyValues): invk.dota2.KeyValues
  local extractor

  if opts.only_scaling then
    extractor = extract_scaling_specials
  else
    extractor = extract_specials
  end

  --- @type invk.dota2.KeyValues
  local specials = tbl.map(INVOKER.KEY_VALUES:abilities_data(), function(kv)
    return extractor(kv.AbilityValues or {})
  end)

  local max_ability_len = str.max_len(tbl.keys(specials))
  local max_special_len = tbl.max(tbl.map(specials, str.max_len))
  local fmt = F("%%-%ds %%-%ds %%s", max_ability_len, max_special_len)

  for a_name, s_names in pairs(specials) do
    local ability = assertf(hero:FindAbilityByName(a_name), "could not find ability %q", a_name)

    for _, s_name in ipairs(s_names) do
      local s_value = ability:GetSpecialValueFor(s_name)

      print(F(fmt, a_name, s_name, s_value))
    end
  end
end

return M
