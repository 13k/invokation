local class = require("pl.class")

--- @class T.dota2.CDOTA_Buff : CDOTA_Buff
--- @field name string
local CDOTA_Buff = class()

--- @class T.dota2.CDOTA_Buff.Attributes
--- @field name string

--- @param attributes T.dota2.CDOTA_Buff.Attributes
function CDOTA_Buff:_init(attributes)
  self.name = attributes.name
end

return CDOTA_Buff
