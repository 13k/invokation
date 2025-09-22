local Ability = require("invk.dota2.ability")

--- @class F.ability.Attributes : F.dota_ability.Attributes
--- @class F.ability.Options : F.dota_ability.Options

--- @param attributes F.ability.Attributes
--- @param options? F.ability.Options
--- @return invk.dota2.Ability
return function(attributes, options)
  local F = require("support.factory")

  return Ability:new(F.dota_ability(attributes, options))
end
