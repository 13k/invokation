local tbl = require("invk.lang.table")

--- Talents helpers.
--- @class invk.dota2.talents
local M = {}

--- @alias invk.dota2.talents.Level
--- | 10
--- | 15
--- | 20
--- | 25

--- @enum invk.dota2.talents.Side
M.Side = {
  LEFT = "left",
  RIGHT = "right",
}

--- @alias invk.dota2.talents.LevelSide {
---   [1]: invk.dota2.talents.Level,
---   [2]: invk.dota2.talents.Side,
--- }

--- @enum invk.dota2.Talents
M.Talents = {
  --- No talents selected
  NONE = 0x00,
  --- Level 10 right talent
  L10_RIGHT = 0x01,
  --- Level 10 left talent
  L10_LEFT = 0x02,
  --- Level 15 right talent
  L15_RIGHT = 0x04,
  --- Level 15 left talent
  L15_LEFT = 0x08,
  --- Level 20 right talent
  L20_RIGHT = 0x10,
  --- Level 20 left talent
  L20_LEFT = 0x20,
  --- Level 25 right talent
  L25_RIGHT = 0x40,
  --- Level 25 left talent
  L25_LEFT = 0x80,
}

--- @type invk.dota2.Talents[]
local LIST = {
  M.Talents.L10_RIGHT,
  M.Talents.L10_LEFT,
  M.Talents.L15_RIGHT,
  M.Talents.L15_LEFT,
  M.Talents.L20_RIGHT,
  M.Talents.L20_LEFT,
  M.Talents.L25_RIGHT,
  M.Talents.L25_LEFT,
}

--- @type { [invk.dota2.Talents]: invk.dota2.talents.LevelSide }
local LEVEL_SIDE = {
  [M.Talents.L10_RIGHT] = { 10, M.Side.RIGHT },
  [M.Talents.L10_LEFT] = { 10, M.Side.LEFT },
  [M.Talents.L15_RIGHT] = { 15, M.Side.RIGHT },
  [M.Talents.L15_LEFT] = { 15, M.Side.LEFT },
  [M.Talents.L20_RIGHT] = { 20, M.Side.RIGHT },
  [M.Talents.L20_LEFT] = { 20, M.Side.LEFT },
  [M.Talents.L25_RIGHT] = { 25, M.Side.RIGHT },
  [M.Talents.L25_LEFT] = { 25, M.Side.LEFT },
}

--- Returns the bitwise OR'ed values
--- @param ... invk.dota2.Talents
--- @return invk.dota2.Talents
function M.select(...)
  return bit.bor(...)
end

--- Map of talent enums and talent ability names
--- @alias invk.dota2.talents.Map { [invk.dota2.Talents]: string }

--- Maps an array of ability names to a map of talents enums and talent ability names
--- @param names string[]
--- @return invk.dota2.talents.Map
function M.names_array_to_enums_table(names)
  assertf(
    #names <= #LIST,
    "names length should be equal or less than talents LIST length. expected: %d <= %d",
    #names,
    #LIST
  )

  return tbl.ltransform(names, function(name, i)
    return LIST[i], name
  end)
end

--- Converts an enum value into level and side values.
--- @param value invk.dota2.Talents
--- @return invk.dota2.talents.LevelSide? # Level and Side tuple if value is valid, `nil` otherwise
function M.level_and_side(value)
  return LEVEL_SIDE[value]
end

return M
