local Factory = require("support.factory")
local m = require("moses")

local PATT_ABILITY_ATTRIBUTE = "^Ability%d+$"
local KEY_VALUES = LoadKeyValues("scripts/npc/npc_heroes.txt")

Factory.define("dota_hero", function(attributes, options)
  attributes = m.extend({}, KEY_VALUES[attributes.name] or {}, attributes)
  options = options or {}

  local hero = CDOTA_BaseNPC_Hero(attributes)

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

  if m.isTable(options.items) then
    for _, name in ipairs(options.items) do
      hero:AddItemByName(name)
    end
  end

  for key, value in pairs(attributes) do
    if key:match(PATT_ABILITY_ATTRIBUTE) then
      hero:AddAbility(value)
    end
  end

  if m.isTable(options.abilities) then
    if m.isArray(options.abilities) then
      for _, name in ipairs(options.abilities) do
        if hero:FindAbilityByName(name) == nil then
          hero:AddAbility(name)
        end
      end
    else
      for name, level in pairs(options.abilities) do
        local ability = hero:FindAbilityByName(name) or hero:AddAbility(name)
        ability:SetLevel(level)
      end
    end
  end

  return hero
end)
