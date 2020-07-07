--- DummyTarget class.
-- @classmod invokation.dota2.DummyTarget
local m = require("moses")
local class = require("pl.class")
local Units = require("invokation.dota2.units")
local delegation = require("invokation.lang.delegation")

local M = class()

local DELEGATES = {"Hold"}

delegation.delegate(M, "entity", DELEGATES)

local function createDummy(location)
  local unit = Units.Create(Units.DUMMY_TARGET, {location = location, team = DOTA_TEAM_BADGUYS})

  unit:SetIdleAcquire(false)

  return unit
end

--- Constructor.
-- @tparam table options Options table
-- @tparam[opt=true] bool options.spawn Spawn dummy unit immediately
function M:_init(options)
  self.spawn = Entities:FindByName(nil, Units.DUMMY_TARGET_SPAWN)

  options = m.extend({spawn = true}, options or {})

  if options.spawn then
    self:Spawn()
  end
end

--- Checks if dummy unit is alive.
-- @treturn bool
function M:IsAlive()
  return m.toBoolean(self.entity and not self.entity:IsNull() and self.entity:IsAlive())
end

--- Checks if the dummy unit is dead.
-- @treturn bool
function M:IsDead()
  return not self:IsAlive()
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
  if self:IsAlive() then
    Units.Destroy(self.entity)
  end

  self.entity = nil
end

--- Resets the dummy unit.
function M:Reset()
  self:Kill()
  self:Spawn()
end

return M
