local m = require("moses")
local Factory = require("support.factory")
local HeroKeyValues = require("invokation.dota2.kv.HeroKeyValues")

local UNITS = require("invokation.const.units")
local HEROES = require("invokation.const.heroes")

Factory.define("dota_hero", function(attributes, options)
  attributes = attributes or {}

  local kvData = HEROES.KEY_VALUES[attributes.name] or {}

  attributes = m.extend({}, kvData, attributes)
  options = options or {}

  local kv = HeroKeyValues(attributes.name, attributes)
  local hero = CDOTA_BaseNPC_Hero(attributes, { kv = kv })

  if m.isTable(options.gold) then
    if m.isNumber(options.gold.reliable) then
      hero:ModifyGold(options.gold.reliable, true, 0)
    end

    if m.isNumber(options.gold.unreliable) then
      hero:ModifyGold(options.gold.unreliable, false, 0)
    end
  elseif m.isNumber(options.gold) then
    hero:ModifyGold(options.gold, true, 0)
  end

  if m.isArray(options.items) then
    for _, name in ipairs(options.items) do
      hero:AddItemByName(name)
    end
  end

  for _, name in ipairs(kv:Abilities()) do
    hero:AddAbility(name)
  end

  if m.isArray(options.abilities) then
    for _, name in ipairs(options.abilities) do
      hero:AddAbility(name)
    end
  elseif m.isTable(options.abilities) then
    for name, level in pairs(options.abilities) do
      local ability = hero:AddAbility(name)
      ability:SetLevel(level)
    end
  end

  return hero
end)

Factory.define("dota_hero_invoker", function(attributes, options)
  attributes = m.extend({}, { name = UNITS.INVOKER }, attributes or {})
  return Factory.create("dota_hero", attributes, options)
end)
