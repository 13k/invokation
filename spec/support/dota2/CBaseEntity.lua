local m = require("moses")
local class = require("pl.class")
local Factory = require("support.factory")

-- selene: allow(incorrect_standard_library_use)
CBaseEntity = class()

CBaseEntity.entIdx = 0

function CBaseEntity:_init(attributes)
  m.extend(self, attributes or {})

  if self.entindex == nil then
    CBaseEntity.entIdx = CBaseEntity.entIdx + 1
    self.entindex = CBaseEntity.entIdx
  end

  self.team = self.team or DOTA_TEAM_NOTEAM
  self.origin = self.origin or Factory.create("vector", { 0, 0, 0 })

  if self.removed == nil then
    self.removed = false
  end

  if self.alive == nil then
    self.alive = true
  end
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

function CBaseEntity:StopSound(_soundEvent) end
function CBaseEntity:SetThink() end
