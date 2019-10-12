local pp = require("pl.pretty")
local stringx = require("pl.stringx")
local ABILITIES = require("invokation.const.abilities")

local M = {}

local function joinpath(...)
  local path = {...}

  if #path == 0 then
    return ""
  end

  if type(path[1]) == "table" then
    path = path[1]
  end

  return stringx.join(".", path)
end

local function iterSpecials(keys)
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
    print(string.format("(WARN) %s not a table [%s]", joinpath(keys.ability), type(ability)))

    keys.ability = next(abilities, keys.ability)

    if keys.ability == nil then
      return nil
    end

    return iterSpecials(keys)
  end

  local specials = ability.AbilitySpecial

  if type(specials) ~= "table" then
    if specials ~= nil then
      print(
        string.format(
          "(WARN) %s not a table [%s]",
          joinpath(keys.ability, "AbilitySpecial"),
          type(specials)
        )
      )
    end

    keys.ability = next(abilities, keys.ability)

    if keys.ability == nil then
      return nil
    end

    return iterSpecials(keys)
  end

  keys.special, special = next(specials, keys.special)

  if keys.special == nil then
    keys.ability = next(abilities, keys.ability)

    if keys.ability == nil then
      return nil
    end

    return iterSpecials(keys)
  end

  local path = {keys.ability, "AbilitySpecial", keys.special}

  if type(special) ~= "table" then
    if special ~= nil then
      print(string.format("(WARN) %s not a table [%s]", joinpath(path), type(special)))
    end

    return iterSpecials(keys)
  end

  return keys.special, special, path
end

local function walkSpecials()
  return iterSpecials, {}
end

function M.dump(query)
  local value = ABILITIES.KEY_VALUES
  local currentPath = {}
  local path = stringx.split(query, ".")
  table.insert(path, 2, "AbilitySpecial")

  for _, seg in ipairs(path) do
    table.insert(currentPath, seg)
    value = value[seg]

    if value == nil then
      break
    end
  end

  local currentProp = joinpath(currentPath)

  if value == nil then
    print(string.format("%s not found", currentProp))
  else
    print(string.format("%s [%s]", currentProp, type(value)))
    pp.dump(value)
  end
end

function M.findKeys(query)
  local keys = {}

  for _, special, path in walkSpecials() do
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
    pp.dump(paths)
    print("---")
  end
end

function M.findValues(query)
  local keys = {}

  for _, special, _ in walkSpecials() do
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
    pp.dump(values)
    print("---")
  end
end

return M
