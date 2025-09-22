local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class F.dota_entity.Attributes : T.dota2.CBaseEntity.Attributes

--- @param attributes F.dota_entity.Attributes
--- @return T.dota2.CBaseEntity
return function(attributes)
  return CBaseEntity(attributes)
end
