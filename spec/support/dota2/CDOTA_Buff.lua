local class = require("middleclass")

--- @class T.dota2.CDOTA_Buff : middleclass.Class, CDOTA_Buff
--- @field name string
local CDOTA_Buff = class("CDOTA_Buff")

--- @class T.dota2.CDOTA_Buff.Attributes
--- @field name string

--- @param attributes T.dota2.CDOTA_Buff.Attributes
function CDOTA_Buff:initialize(attributes)
  self.name = attributes.name
end

return CDOTA_Buff
