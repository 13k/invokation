--- DummyTarget class.
-- @classmod invokation.dota2.DummyTarget

local M = require("pl.class")()

local Units = require("invokation.dota2.units")

local function createDummy(location)
  local unit = Units.Create(Units.DUMMY_TARGET, {
    location = location,
    team = DOTA_TEAM_BADGUYS,
  })

  -- unit:Hold()
  unit:SetIdleAcquire(false)
  -- unit:StartGesture(ACT_DOTA_FLAIL)

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
  self.entity = createDummy(self.spawn:GetAbsOrigin())
end

--- Purges the dummy unit.
function M:Purge()
  self.entity:Purge(true, true, false, true, true)
end

--- Orders a `move-to-position` action to the dummy unit, with target position
-- being the spawn location.
function M:MoveToSpawn()
  self.entity:MoveToPosition(self.spawn:GetAbsOrigin())
end

--- Reset the dummy unit.
--
-- If it's alive, purges and move it to spawn. If it's dead, spawns it.
function M:Reset()
  if self:IsAlive() then
    self:Purge()
    self:MoveToSpawn()
  else
    self:Spawn()
  end
end

--- Checks if dummy unit is alive.
-- @treturn bool
function M:IsAlive()
  return (not self.entity:IsNull()) and self.entity:IsAlive()
end

--- Checks if the dummy unit is dead.
-- @treturn bool
function M:IsDead()
  return not self:IsAlive()
end

--- Kills the dummy unit.
function M:Kill()
  if self:IsAlive() then
    return self.entity:ForceKill(false)
  end
end

return M
