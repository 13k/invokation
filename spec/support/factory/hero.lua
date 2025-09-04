local Unit = require("invk.dota2.unit")

--- @param attributes support.dota2.CDOTA_BaseNPC_Hero_attributes
--- @param options? support.factory.dota_hero.Options
--- @return invk.dota2.Unit
return function(attributes, options)
  local F = require("support.factory")

  return Unit:new(F.dota_hero(attributes, options))
end
