local m = require("moses")

local CDOTA_BaseNPC_Hero = require("support.dota2.CDOTA_BaseNPC_Hero")

--- @class support.factory.dota_hero.Options
--- @field gold? integer
--- @field items? string[]
--- @field abilities? string[] | { [string]: integer }

--- @param attributes support.dota2.CDOTA_BaseNPC_Hero_attributes
--- @param options? support.factory.dota_hero.Options
--- @return support.dota2.CDOTA_BaseNPC_Hero
return function(attributes, options)
  local opts = options or {}
  local kv = LoadKeyValues("scripts/npc/npc_heroes.txt")
  local attrs = m.extend({}, kv[attributes.name] or {}, attributes)
  local hero = CDOTA_BaseNPC_Hero(attrs)

  if m.isNumber(opts.gold) then
    hero:ModifyGold(opts.gold, true, 0)
  end

  if opts.items then
    for _, name in ipairs(opts.items) do
      hero:AddItemByName(name)
    end
  end

  if opts.abilities then
    if m.isArray(opts.abilities) then
      for _, name in ipairs(opts.abilities) do
        hero:AddAbility(name)
      end
    elseif m.isTable(opts.abilities) then
      for name, level in pairs(opts.abilities) do
        local ability = hero:AddAbility(name)

        ability:SetLevel(level)
      end
    end
  end

  return hero
end
