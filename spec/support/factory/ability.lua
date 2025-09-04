local Ability = require("invk.dota2.ability")

--- @param attributes support.dota2.CDOTABaseAbility_attributes
--- @param options? support.factory.dota_ability.Options
--- @return invk.dota2.Ability
return function(attributes, options)
  local F = require("support.factory")

  return Ability:new(F.dota_ability(attributes, options))
end
