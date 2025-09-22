local CDOTA_BaseNPC = require("support.dota2.CDOTA_BaseNPC")

--- @class F.dota_unit.Attributes : T.dota2.CDOTA_BaseNPC.Attributes

--- @param attributes F.dota_unit.Attributes
--- @return T.dota2.CDOTA_BaseNPC
return function(attributes)
  return CDOTA_BaseNPC(attributes)
end
