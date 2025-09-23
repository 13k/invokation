local class = require("middleclass")

local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class T.dota2.CDOTABaseGameMode : T.dota2.CBaseEntity, CDOTABaseGameMode
local CDOTABaseGameMode = class("CDOTABaseGameMode", CBaseEntity)

function CDOTABaseGameMode:initialize()
  CBaseEntity.initialize(self, { name = "CDOTABaseGameMode" })
end

return CDOTABaseGameMode
