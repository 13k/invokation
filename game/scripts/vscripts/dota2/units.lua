local M = {}

local Names = require("const.units")
local tablex = require("pl.tablex")

tablex.update(M, Names)

function M.Create(name, options)
  assert(type(options) == "table", "Argument `options` must be a table")

  return CreateUnitByName(
    name,
    options.location,
    options.findClearSpace,
    options.npcOwner,
    options.unitOwner,
    options.team
  )
end

function M.CreateAsync(name, options)
  assert(type(options) == "table", "Argument `options` must be a table")

  return CreateUnitByNameAsync(
    name,
    options.location,
    options.findClearSpace,
    options.npcOwner,
    options.unitOwner,
    options.team,
    options.callback
  )
end

function M.CreateFromTable(t, location)
  assert(type(t) == "table", "Argument `t` must be a table")

  return CreateUnitFromTable(t, location)
end

return M
