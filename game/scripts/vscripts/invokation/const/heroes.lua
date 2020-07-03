--- Heroes constants.
-- @module invokation.const.heroes
local M = {}

local KEY_VALUES_FILE = "scripts/npc/npc_heroes.txt"

--- KeyValues table of all heroes.
-- @table KEY_VALUES
M.KEY_VALUES = LoadKeyValues(KEY_VALUES_FILE)

return M
