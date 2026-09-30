local m = require("moses")

local CDOTABaseAbility = require("support.dota2.CDOTABaseAbility")

--- @class F.dota_ability.Attributes : T.dota2.CDOTABaseAbility.Attributes

--- @class F.dota_ability.Options
--- @field hero? string

--- @param attributes F.dota_ability.Attributes
--- @param options? F.dota_ability.Options
--- @return T.dota2.CDOTABaseAbility
return function(attributes, options)
  local opts = options or {}

  if opts.hero then
    local hero_kv = LoadKeyValues(sprintf("scripts/npc/heroes/%s.txt", opts.hero))
    local kv = m.path(hero_kv, opts.hero, "AbilityDefinitions", attributes.name) or {}

    attributes = m.extend({}, attributes, kv)
  end

  return CDOTABaseAbility:new(attributes)
end
