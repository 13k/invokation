local m = require("moses")
local Invoker = require("invokation.dota2.Invoker")

local M = {}

local FIELD_TYPES = {
  FIELD_INTEGER = "number",
  FIELD_FLOAT = "number",
}

local function isSpecialKey(key, value, luaType)
  if key == "var_type" then
    return nil
  end

  if not key:match("^[a-z_]+$") then
    return nil
  end

  if type(value) == luaType then
    return true
  end

  if m.isTable(value) then
    local isLuaType = m.chain(m.isEqual):partial(luaType):overArgs(type):value()

    if m.all(value, isLuaType) then
      return true
    end
  end

  return nil
end

local function isScalingSpecialKey(key, value)
  return m.isTable(value) and key or nil
end

local function extractSpecialKey(special)
  if not m.isString(special.var_type) then
    return nil
  end

  local luaType = FIELD_TYPES[special.var_type]
  local selectSpecialKey = m.chain(isSpecialKey):partialRight(luaType):rearg({ 2, 1 }):value()

  return m.chain(special):map(selectSpecialKey):keys():value()[1]
end

local function extractScalingSpecialKey(special)
  local selectScalingSpecialKey = m.rearg(isScalingSpecialKey, { 2, 1 })
  return m.chain(special):map(selectScalingSpecialKey):keys():value()[1]
end

local function extractSpecials(kv)
  return m.chain(kv.AbilitySpecial or {}):map(extractSpecialKey):compact():value()
end

local function extractScalingSpecials(kv)
  return m.chain(kv.AbilitySpecial or {}):map(extractScalingSpecialKey):compact():value()
end

local SPECIALS = m.map(Invoker.ABILITIES_KEY_VALUES, extractSpecials)
local SCALING = m.map(Invoker.ABILITIES_KEY_VALUES, extractScalingSpecials)

local function maxLen(strings)
  return m.chain(strings):map(m.unary(string.len)):max():value()
end

function M.dump(player, options)
  options = options or {}

  local hero = player:GetAssignedHero()
  local specials = options.onlyScaling and SCALING or SPECIALS
  local maxAbilityLen = maxLen(m.keys(specials))
  local maxSpecialLen = m.chain(specials):map(maxLen):max():value()
  local fmt = string.format("%%-%ds %%-%ds %%s", maxAbilityLen, maxSpecialLen)

  for aName, sNames in pairs(specials) do
    local ability = hero:FindAbilityByName(aName)

    for _, sName in ipairs(sNames) do
      local sValue = ability:GetSpecialValueFor(sName)
      print(fmt:format(aName, sName, sValue))
    end
  end
end

return M