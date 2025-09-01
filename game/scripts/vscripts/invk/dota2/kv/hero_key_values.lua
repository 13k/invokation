local class = require("middleclass")

local AbilityKeyValues = require("invk.dota2.kv.ability_key_values")
local KeyValues = require("invk.dota2.kv.key_values")
local talents = require("invk.dota2.talents")
local tbl = require("invk.lang.table")

local KV_HEROES_PATH = "scripts/npc/npc_heroes.txt"
local KV_ABILITIES_PATH_PATT = "scripts/npc/heroes/%s.txt"
local ABILITY_KEY_PATT = "^Ability(%d+)$"

--- @param value invk.dota2.kv.Value
--- @param key string
--- @return integer?, string?
local function parse_ability_entry(value, key)
  if type(value) ~= "string" or value == "" then
    return nil
  end

  local m_ability_id = key:match(ABILITY_KEY_PATT)

  if m_ability_id == nil then
    return nil
  end

  local ability_id = tonumber(m_ability_id)

  if ability_id == nil then
    return nil
  end

  --- @cast ability_id integer
  return ability_id, value
end

--- HeroKeyValues class.
--- @class invk.dota2.kv.HeroKeyValues : middleclass.Class, invk.dota2.kv.KeyValues
--- @field name string
--- @field abilities { [invk.dota2.invoker.AbilityName]: invk.dota2.kv.AbilityKeyValues }
--- @field talents invk.dota2.talents.Map
--- @field load fun(class: invk.dota2.kv.HeroKeyValues, name: string): invk.dota2.kv.HeroKeyValues
local M = class("invk.dota2.kv.HeroKeyValues", KeyValues)

--- @param name string # Hero unit name
--- @return invk.dota2.kv.HeroKeyValues
function M.static:load(name)
  local heroes = KeyValues:load(KV_HEROES_PATH)
  local hero = heroes:require_kv(name)

  local abilities_path = F(KV_ABILITIES_PATH_PATT, name)
  local abilities = KeyValues:load(abilities_path)

  return self:new(name, hero.data, abilities)
end

--- Constructor.
--- @param name string # Hero unit name
--- @param hero invk.dota2.KeyValues # Hero KeyValues data
--- @param abilities invk.dota2.kv.KeyValues # Abilities KeyValues data
function M:initialize(name, hero, abilities)
  KeyValues.initialize(self, hero)

  self.name = name
  self.abilities = {}

  --- @type invk.dota2.invoker.AbilityName[]
  local abilities_names = tbl.map(self.data, parse_ability_entry)
  local talents_start = self:require_integer("AbilityTalentStart")
  local regular_abilities = tbl.slice(abilities_names, 1, talents_start - 1)
  local talent_abilities = tbl.slice(abilities_names, talents_start)

  for _, ability_name in ipairs(regular_abilities) do
    local ability = abilities:require_kv(ability_name)

    self.abilities[ability_name] = AbilityKeyValues:new(ability_name, ability.data)
  end

  self.talents = talents.names_array_to_enums_table(talent_abilities)
end

--- @return invk.dota2.KeyValues
function M:abilities_data()
  return tbl.map(self.abilities, function(kv)
    return kv.data
  end)
end

return M
