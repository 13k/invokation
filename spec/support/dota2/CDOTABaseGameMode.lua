local class = require("pl.class")

local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class T.dota2.CDOTABaseGameMode : T.dota2.CBaseEntity, CDOTABaseGameMode
local CDOTABaseGameMode = class(CBaseEntity)

function CDOTABaseGameMode:_init()
  self:super({ name = "CDOTABaseGameMode" })
end

return CDOTABaseGameMode
