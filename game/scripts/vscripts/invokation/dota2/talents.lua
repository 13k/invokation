--- Talents helpers.
-- @module invokation.dota2.talents

local m = require("moses")

local M = {}

--- No talents selected
M.NONE = 0x00
--- Level 10 right talent
M.L10_RIGHT = 0x01
--- Level 10 left talent
M.L10_LEFT = 0x02
--- Level 15 right talent
M.L15_RIGHT = 0x04
--- Level 15 left talent
M.L15_LEFT = 0x08
--- Level 20 right talent
M.L20_RIGHT = 0x10
--- Level 20 left talent
M.L20_LEFT = 0x20
--- Level 25 right talent
M.L25_RIGHT = 0x40
--- Level 25 left talent
M.L25_LEFT = 0x80

--- Talents enum
-- @table Enum
-- @tfield int 1 L10_RIGHT
-- @tfield int 2 L10_LEFT
-- @tfield int 3 L15_RIGHT
-- @tfield int 4 L15_LEFT
-- @tfield int 5 L20_RIGHT
-- @tfield int 6 L20_LEFT
-- @tfield int 7 L25_RIGHT
-- @tfield int 8 L25_LEFT
M.ENUM =
  {
    M.L10_RIGHT,
    M.L10_LEFT,
    M.L15_RIGHT,
    M.L15_LEFT,
    M.L20_RIGHT,
    M.L20_LEFT,
    M.L25_RIGHT,
    M.L25_LEFT,
  }

local LEVEL_SIDE = {
  [M.L10_RIGHT] = { 10, "RIGHT" },
  [M.L10_LEFT] = { 10, "LEFT" },
  [M.L15_RIGHT] = { 15, "RIGHT" },
  [M.L15_LEFT] = { 15, "LEFT" },
  [M.L20_RIGHT] = { 20, "RIGHT" },
  [M.L20_LEFT] = { 20, "LEFT" },
  [M.L25_RIGHT] = { 25, "RIGHT" },
  [M.L25_LEFT] = { 25, "LEFT" },
}

--- Returns the bitwise OR'ed values
-- @tparam {int,...} ... @{Enum} vararg values
-- @treturn int OR'ed value
function M.Select(...)
  return bit.bor(...)
end

--- Talents table.
--
-- Keys are @{Enum} values and values are ability names.
--
-- @table Talents
-- @tfield string L10_RIGHT Level 10 right talent ability name
-- @tfield string L10_LEFT Level 10 left talent ability name
-- @tfield string L15_RIGHT Level 15 right talent ability name
-- @tfield string L15_LEFT Level 15 left talent ability name
-- @tfield string L20_RIGHT Level 20 right talent ability name
-- @tfield string L20_LEFT Level 20 left talent ability name
-- @tfield string L25_RIGHT Level 25 right talent ability name
-- @tfield string L25_LEFT Level 25 left talent ability name

--- Maps an array of ability names to a table of talents enums and talent ability names
-- @tparam {string,...} names Ability names
-- @treturn Talents Talents table
function M.NamesArrayToEnumsTable(names)
  return m.map(names, function(name, idx)
    return M.ENUM[idx], name
  end)
end

--- Converts an enum value into level and side values.
-- @tparam int value @{Enum} value
-- @treturn ?int Level if value is valid, `nil` otherwise
-- @treturn ?string Side if value is valid, `nil` otherwise
function M.LevelAndSide(value)
  return unpack(LEVEL_SIDE[value] or { nil, nil })
end

return M
