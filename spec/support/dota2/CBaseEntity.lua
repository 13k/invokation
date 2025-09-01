local class = require("pl.class")
local m = require("moses")

local F = require("support.factory")

--- @class support.dota2.CBaseEntity : CBaseEntity
--- @field name string
--- @field classname string
--- @field entindex EntityIndex
--- @field team DOTATeam_t
--- @field origin Vector
--- @field removed boolean
--- @field alive boolean
local CBaseEntity = class()

--- @class support.dota2.CBaseEntity_attributes
--- @field name string
--- @field classname? string
--- @field entindex? EntityIndex
--- @field team? DOTATeam_t
--- @field origin? Vector
--- @field removed? boolean
--- @field alive? boolean

--- @param attributes support.dota2.CBaseEntity_attributes
function CBaseEntity:_init(attributes)
  attributes.classname = attributes.classname or attributes.name
  attributes.entindex = attributes.entindex or test_NextEntIndex()
  attributes.team = attributes.team or DOTA_TEAM_NOTEAM
  attributes.origin = attributes.origin or F.vector({ 0, 0, 0 })
  attributes.removed = attributes.removed == nil and false or attributes.removed
  attributes.alive = attributes.alive == nil and true or attributes.alive

  m.extend(self, attributes)

  test_SetEntity(self.entindex, self)
end

function CBaseEntity:GetEntityIndex()
  return self.entindex
end

function CBaseEntity:GetName()
  return self.name
end

function CBaseEntity:GetClassname()
  return self.classname
end

function CBaseEntity:RemoveSelf()
  self.removed = true
end

function CBaseEntity:IsNull()
  return self.removed
end

function CBaseEntity:IsAlive()
  return self.alive
end

function CBaseEntity:GetAbsOrigin()
  return self:GetOrigin()
end

function CBaseEntity:SetAbsOrigin(v)
  self:SetOrigin(v)
end

function CBaseEntity:GetOrigin()
  return self.origin
end

function CBaseEntity:SetOrigin(v)
  self.origin = v
end

function CBaseEntity:GetTeam()
  return self.team
end

function CBaseEntity:GetTeamNumber()
  return self.team
end

function CBaseEntity:StopSound(_event) end
function CBaseEntity:SetThink() end

return CBaseEntity
