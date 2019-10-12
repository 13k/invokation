--- Shop items constants.
-- @module invokation.const.shop_items

local M = {}

local KEY_VALUES_FILE = "scripts/custom_game/shops.txt"

--- KeyValues table of shop items.
-- @table KEY_VALUES
M.KEY_VALUES = LoadKeyValues(KEY_VALUES_FILE)

return M