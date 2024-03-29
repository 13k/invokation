--- Unit constants.
-- @module invokation.const.units
local M = {}

--- Dummy target spawn entity name
-- @tfield string DUMMY_TARGET_SPAWN
M.DUMMY_TARGET_SPAWN = "dummy_target_spawn"
--- Dummy target unit name
-- @tfield string DUMMY_TARGET
M.DUMMY_TARGET = "npc_invokation_dummy_target"
--- Invoker unit name
-- @tfield string INVOKER
M.INVOKER = "npc_dota_hero_invoker"
--- Units spawned by Invoker
-- @table INVOKER_SPAWNED
-- @tfield string FORGED_SPIRIT
M.INVOKER_SPAWNED = { FORGED_SPIRIT = "npc_dota_invoker_forged_spirit" }

return M
