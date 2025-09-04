local inspect = require("inspect")

local ABILITIES = require("invk.const.abilities")
local str = require("invk.lang.string")

--- @class invk.commands.debug_specials
local M = {}

--- @param ... string|string[]
--- @return string
local function joinpath(...)
  local path = { ... }

  if #path == 0 then
    return ""
  end

  if type(path[1]) == "table" then
    path = path[1]
  end

  return table.concat(path, ".")
end

local function iter_specials(keys)
  local ability, special
  local abilities = ABILITIES.KEY_VALUES

  if keys.ability == nil then
    keys.ability, ability = next(abilities, nil)

    if keys.ability == nil then
      return nil
    end
  else
    ability = abilities[keys.ability]
  end

  if type(ability) ~= "table" then
    print(F("(WARN) %s not a table [%s]", joinpath(keys.ability), type(ability)))

    keys.ability = next(abilities, keys.ability)

    if keys.ability == nil then
      return nil
    end

    return iter_specials(keys)
  end

  local specials = ability.AbilitySpecial

  if type(specials) ~= "table" then
    if specials ~= nil then
      print(
        F("(WARN) %s not a table [%s]", joinpath(keys.ability, "AbilitySpecial"), type(specials))
      )
    end

    keys.ability = next(abilities, keys.ability)

    if keys.ability == nil then
      return nil
    end

    return iter_specials(keys)
  end

  keys.special, special = next(specials, keys.special)

  if keys.special == nil then
    keys.ability = next(abilities, keys.ability)

    if keys.ability == nil then
      return nil
    end

    return iter_specials(keys)
  end

  local path = { keys.ability, "AbilitySpecial", keys.special }

  if type(special) ~= "table" then
    if special ~= nil then
      print(F("(WARN) %s not a table [%s]", joinpath(path), type(special)))
    end

    return iter_specials(keys)
  end

  return keys.special, special, path
end

local function walk_specials()
  return iter_specials, {}
end

--- @param query string
function M.dump(query)
  local value = ABILITIES.KEY_VALUES
  local currentPath = {}
  local path = str.split(query, ".")

  table.insert(path, 2, "AbilitySpecial")

  for _, seg in ipairs(path) do
    table.insert(currentPath, seg)

    local subvalue = value[seg] --[[@as invk.dota2.KeyValues]]

    if subvalue == nil then
      break
    end

    value = subvalue
  end

  local currentProp = joinpath(currentPath)

  if value == nil then
    print(F("%s not found", currentProp))
  else
    print(F("%s [%s]", currentProp, type(value)))
    print(inspect(value))
  end
end

--- @param query string
function M.find_keys(query)
  local keys = {}

  for _, special, path in walk_specials() do
    for key, _ in pairs(special) do
      if key:match(query) then
        keys[key] = keys[key] or {}
        table.insert(keys[key], joinpath(path))
      end
    end
  end

  print("---")
  for key, paths in pairs(keys) do
    print(key)
    print(inspect(paths))
    print("---")
  end
end

--- @param query string
function M.find_values(query)
  local keys = {}

  for _, special, _ in walk_specials() do
    for key, value in pairs(special) do
      if type(value) == "string" and value:match(query) then
        keys[key] = keys[key] or {}
        table.insert(keys[key], value)
      end
    end
  end

  print("---")
  for key, values in pairs(keys) do
    print(key)
    print(inspect(values))
    print("---")
  end
end

return M
