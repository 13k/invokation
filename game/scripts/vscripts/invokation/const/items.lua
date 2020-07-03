--- Items constants.
-- @module invokation.const.items
local M = {}

local KEY_VALUES_FILE = "scripts/npc/items.txt"

--- KeyValues table of all items.
-- @table KEY_VALUES
M.KEY_VALUES = LoadKeyValues(KEY_VALUES_FILE)

return M
