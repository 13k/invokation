local class = require("pl.class")
local m = require("moses")

local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class T.dota2.CDOTAPlayerController : T.dota2.CBaseEntity, CDOTAPlayerController
--- @field player_id PlayerID
--- @field hero T.dota2.CDOTA_BaseNPC_Hero
local CDOTAPlayerController = class(CBaseEntity)

--- @class T.dota2.CDOTAPlayerController.Attributes : T.dota2.CBaseEntity.Attributes
--- @field name? string
--- @field player_id? PlayerID
--- @field hero T.dota2.CDOTA_BaseNPC_Hero

--- @type T.dota2.CDOTAPlayerController.Attributes
local ATTRIBUTES = {
  name = "dota_player",
  player_id = 13,
}

function CDOTAPlayerController:_init(attributes)
  self:super(m.extend(ATTRIBUTES, attributes))
end

function CDOTAPlayerController:GetPlayerID()
  return self.player_id
end

function CDOTAPlayerController:GetAssignedHero()
  return self.hero
end

--- @diagnostic disable-next-line: unused
function CDOTAPlayerController:SetMusicStatus(_status, _intensity) end

return CDOTAPlayerController
