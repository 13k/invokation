local CBaseEntity = require("support.dota2.CBaseEntity")

--- @param attributes support.dota2.CBaseEntity_attributes
--- @return support.dota2.CBaseEntity
return function(attributes)
  return CBaseEntity(attributes)
end
