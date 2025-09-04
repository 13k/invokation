local class = require("middleclass")

local UNITS = require("invk.const.units")
local Units = require("invk.dota2.units")
local tbl = require("invk.lang.table")

--- DummyTarget class.
--- @class invk.dota2.DummyTarget : middleclass.Class
--- @field spawn_ent CBaseEntity?
--- @field entity CDOTA_BaseNPC?
local M = class("invk.dota2.DummyTarget")

--- @class invk.dota2.DummyTargetOptions
--- @field spawn? boolean # Spawn dummy unit immediately (default: `true`)

--- Constructor.
--- @param options? invk.dota2.DummyTargetOptions # Options table
function M:initialize(options)
  self.spawn_ent = Entities:FindByName(nil, UNITS.DUMMY_TARGET_SPAWN)

  if not self.spawn_ent then
    print("\n\nERROR: COULD NOT FIND DUMMY TARGET SPAWN LOCATION\n\n")
    return
  end

  --- @type invk.dota2.DummyTargetOptions
  local opts = tbl.extend({ spawn = true }, options or {})

  if opts.spawn then
    self:spawn()
  end
end

--- Checks if dummy unit is alive.
--- @return boolean
function M:is_alive()
  return self.entity ~= nil and not self.entity:IsNull() and self.entity:IsAlive()
end

--- Checks if the dummy unit is dead.
--- @return boolean
function M:is_dead()
  return not self:is_alive()
end

--- Spawns the dummy unit.
function M:spawn()
  if not self.spawn_ent then
    print("\n\nERROR: COULD NOT FIND DUMMY TARGET SPAWN LOCATION\n\n")
    return
  end

  if self:is_alive() then
    return
  end

  local location = self.spawn_ent:GetAbsOrigin()
  local unit = Units.create(UNITS.DUMMY_TARGET, {
    location = location,
    team = DOTA_TEAM_BADGUYS,
  })

  unit:SetIdleAcquire(false)

  self.entity = unit

  self:hold()
end

--- Kills the dummy unit.
function M:kill()
  if self.entity and self:is_alive() then
    Units.destroy(self.entity)
  end

  self.entity = nil
end

--- Resets the dummy unit.
function M:reset()
  self:kill()
  self:spawn()
end

function M:hold()
  if self.entity then
    self.entity:Hold()
  end
end

return M
