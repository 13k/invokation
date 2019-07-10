local M = require("pl.class")()

local Units = require("dota2.units")

local function createDummy(location)
  local unit = Units.Create(Units.DUMMY_TARGET, {
    location = location,
    findClearSpace = true,
    npcOwner = nil,
    unitOwner = nil,
    team = DOTA_TEAM_BADGUYS,
  })

  -- unit:Hold()
  unit:SetIdleAcquire(false)
  -- unit:StartGesture(ACT_DOTA_FLAIL)

  return unit
end

-- FIXME: dummy permanently walking back to origin
function M:_init()
  self.spawn = Entities:FindByName(nil, Units.DUMMY_TARGET_SPAWN)
  self:Spawn()
end

function M:Spawn()
  self.entity = createDummy(self.spawn:GetAbsOrigin())
end

function M:Purge()
  self.entity:Purge(true, true, false, true, true)
end

function M:MoveToSpawn()
  self.entity:MoveToPosition(self.spawn:GetAbsOrigin())
end

function M:Reset()
  if self:IsAlive() then
    self:Purge()
    self:MoveToSpawn()
  else
    self:Spawn()
  end
end

function M:IsAlive()
  return (not self.entity:IsNull()) and self.entity:IsAlive()
end

function M:IsDead()
  return not self:IsAlive()
end

function M:Kill()
  if self:IsAlive() then
    return self.entity:ForceKill(false)
  end
end

return M
