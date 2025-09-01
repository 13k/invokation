local CDOTA_BaseNPC = require("support.dota2.CDOTA_BaseNPC")

--- @param attributes support.dota2.CDOTA_BaseNPC_attributes
--- @return support.dota2.CDOTA_BaseNPC
return function(attributes)
  return CDOTA_BaseNPC(attributes)
end
