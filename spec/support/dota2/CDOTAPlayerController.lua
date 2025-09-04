local class = require("pl.class")
local m = require("moses")

local CBaseEntity = require("support.dota2.CBaseEntity")

--- @class support.dota2.CDOTAPlayerController : support.dota2.CBaseEntity, CDOTAPlayerController
--- @field player_id PlayerID
--- @field hero support.dota2.CDOTA_BaseNPC_Hero
local CDOTAPlayerController = class(CBaseEntity)

--- @class support.dota2.CDOTAPlayerController_attributes : support.dota2.CBaseEntity_attributes
--- @field name? string
--- @field player_id? PlayerID
--- @field hero support.dota2.CDOTA_BaseNPC_Hero

--- @type support.dota2.CDOTAPlayerController_attributes
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

function CDOTAPlayerController:SetMusicStatus(_status, _intensity) end

return CDOTAPlayerController
