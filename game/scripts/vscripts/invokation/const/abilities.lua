--- Abilities constants.
-- @module invokation.const.abilities
local M = {}

local KEY_VALUES_FILE = "scripts/npc/heroes/npc_dota_hero_invoker.txt"

--- KeyValues table of all abilities.
-- @table KEY_VALUES
M.KEY_VALUES = LoadKeyValues(KEY_VALUES_FILE)

return M
