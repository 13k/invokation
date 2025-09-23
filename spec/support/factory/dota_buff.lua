local CDOTA_Buff = require("support.dota2.CDOTA_Buff")

--- @class F.dota_buff.Attributes : T.dota2.CDOTA_Buff.Attributes

--- @param attributes F.dota_entity.Attributes
--- @return T.dota2.CDOTA_Buff
return function(attributes)
  return CDOTA_Buff:new(attributes)
end
