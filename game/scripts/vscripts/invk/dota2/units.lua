local val = require("invk.lang.value")

--- Units helpers.
--- @class invk.dota2.units
local M = {}

--- @class invk.dota2.units.CreateOptions
--- @field location Vector # Target location
--- @field team DOTATeam_t # Team number
--- @field find_clear_space? boolean # Find clear space for the unit (default: `true`)
--- @field npc_owner? CDOTA_BaseNPC # NPC owner
--- @field unit_owner? CDOTA_BaseNPC # Unit Owner

--- Creates an unit by name.
--- @param name string # Unit name
--- @param options? invk.dota2.units.CreateOptions # Options table
--- @return CDOTA_BaseNPC # Created unit
function M.create(name, options)
  local opts = options or {}
  local find_clear_space = val.non_nil(opts.find_clear_space, true)

  return CreateUnitByName(
    name,
    opts.location,
    find_clear_space,
    opts.npc_owner,
    opts.unit_owner,
    opts.team
  )
end

--- @class invk.dota2.units.CreateAsyncOptions : invk.dota2.units.CreateOptions
--- @field cb fun(unit: CDOTA_BaseNPC) # Callback function

--- Creates an unit by name (async).
--- @param name string # Unit name
--- @param options invk.dota2.units.CreateAsyncOptions # Options table
--- @return SpawnGroupHandle
function M.create_async(name, options)
  local opts = options or {}
  local find_clear_space = val.non_nil(opts.find_clear_space, true)

  return CreateUnitByNameAsync(
    name,
    opts.location,
    find_clear_space,
    opts.npc_owner,
    opts.unit_owner,
    opts.team,
    opts.cb
  )
end

--- Creates a new data-driven unit with the given table.
--- @param definition table # Unit definition table
--- @param location Vector # Target location
--- @return CDOTA_BaseNPC # Created unit
function M.create_from_table(definition, location)
  return CreateUnitFromTable(definition, location)
end

--- Kills and removes the given unit.
--- @param unit CDOTA_BaseNPC # Unit entity
function M.destroy(unit)
  unit:ForceKill(false)
  unit:RemoveSelf()
end

return M
