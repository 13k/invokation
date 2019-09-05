--- DummyTarget class.
-- @classmod invokation.dota2.DummyTarget

local M = require("pl.class")()

local Units = require("invokation.dota2.units")
local delegation = require("invokation.lang.delegation")

local DELEGATES = {
  "Hold"
}

delegation.delegate(M, "entity", DELEGATES)

local function createDummy(location)
  local unit =
    Units.Create(
    Units.DUMMY_TARGET,
    {
      location = location,
      team = DOTA_TEAM_BADGUYS
    }
  )

  unit:SetIdleAcquire(false)

  return unit
end

--- Constructor.
-- @fixme Dummy unit permanently walking back to origin
-- @todo Parameterize spawn location (origin)
function M:_init()
  self.spawn = Entities:FindByName(nil, Units.DUMMY_TARGET_SPAWN)
  self:Spawn()
end

--- Spawns the dummy unit.
function M:Spawn()
  if self:IsAlive() then
    return
  end

  self.entity = createDummy(self.spawn:GetAbsOrigin())
  self:Hold()
end

--- Kills the dummy unit.
function M:Kill()
  if not self:IsAlive() then
    return
  end

  self.entity:ForceKill(false)
  self.entity:RemoveSelf()
  self.entity = nil
end

--- Reset the dummy unit.
function M:Reset()
  self:Kill()
  self:Spawn()
end

--- Checks if dummy unit is alive.
-- @treturn bool
function M:IsAlive()
  return self.entity and (not self.entity:IsNull()) and self.entity:IsAlive()
end

--- Checks if the dummy unit is dead.
-- @treturn bool
function M:IsDead()
  return not self:IsAlive()
end

return M
