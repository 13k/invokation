--- Units helpers.
-- @module invokation.dota2.units
local types = require("pl.types")
local tablex = require("pl.tablex")

local NAMES = require("invokation.const.units")

local M = {}

tablex.update(M, NAMES)

--- Creates an unit by name.
-- @tparam string name Unit name
-- @tparam table options Options table
-- @tparam Vector options.location Target location
-- @tparam int options.team Team number
-- @tparam[opt=true] bool options.findClearSpace Find clear space for the unit
-- @tparam[opt] CDOTA_BaseNPC options.npcOwner NPC owner
-- @tparam[opt] CDOTA_BaseNPC options.unitOwner Unit Owner
-- @treturn CDOTA_BaseNPC Created unit
function M.Create(name, options)
  options.findClearSpace = options.findClearSpace ~= nil and options.findClearSpace or true

  return CreateUnitByName(name, options.location, types.to_bool(options.findClearSpace), options.npcOwner,
                          options.unitOwner, options.team)
end

--- Creates an unit by name (async).
-- @tparam string name Unit name
-- @tparam table options Options table
-- @tparam Vector options.location Target location
-- @tparam int options.team Team number
-- @tparam function options.callback Callback function
-- @tparam[opt=true] bool options.findClearSpace Find clear space for the unit
-- @tparam[opt] CDOTA_BaseNPC options.npcOwner NPC owner
-- @tparam[opt] CDOTA_BaseNPC options.unitOwner Unit Owner
-- @treturn int Some kind of async registration id?
function M.CreateAsync(name, options)
  options.findClearSpace = options.findClearSpace ~= nil and options.findClearSpace or true

  return CreateUnitByNameAsync(name, options.location, types.to_bool(options.findClearSpace), options.npcOwner,
                               options.unitOwner, options.team, options.callback)
end

--- Creates a new data-driven unit with the given table.
-- @tparam table definition Unit definition table
-- @tparam Vector location Target location
-- @treturn CDOTA_BaseNPC Created unit
function M.CreateFromTable(definition, location)
  return CreateUnitFromTable(definition, location)
end

return M
