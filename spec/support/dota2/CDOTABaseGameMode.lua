local class = require("pl.class")

local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class support.dota2.CDOTABaseGameMode : support.dota2.CBaseEntity, CDOTABaseGameMode
local CDOTABaseGameMode = class(CBaseEntity)

function CDOTABaseGameMode:_init()
  self:super({ name = "CDOTABaseGameMode" })
end

return CDOTABaseGameMode
