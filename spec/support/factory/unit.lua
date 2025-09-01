local Unit = require("invk.dota2.unit")

--- @param attributes support.dota2.CDOTA_BaseNPC_attributes
--- @return invk.dota2.Unit
return function(attributes)
  local F = require("support.factory")

  return Unit:new(F.dota_unit(attributes))
end
