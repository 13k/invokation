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
    local kv_path = string.format("scripts/npc/heroes/%s.txt", opts.hero)
    local kv = LoadKeyValues(kv_path)

    attributes = m.extend(attributes, kv[attributes.name] or {})
  end

  return CDOTABaseAbility(attributes)
end
