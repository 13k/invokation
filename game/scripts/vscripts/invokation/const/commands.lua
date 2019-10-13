--- Command definitions.
-- @module invokation.const.commands

--- Command definition.
-- @table CommandDefinition
-- @tfield string name Command name
-- @tfield string method `GameMode` method name
-- @tfield string help Command help
-- @tfield int flags Command flags
-- @tfield bool dev Only registered in development environment

local M = {}

table.insert(M, {
  name = "inv_debug",
  method = "CommandSetDebug",
  help = "Set debugging (empty - print debug status, 0 - disabled, 1 - enabled)",
  flags = FCVAR_CHEAT,
  dev = false,
})

table.insert(M, {
  name = "inv_debug_misc",
  method = "CommandDebugMisc",
  help = "Run miscellaneous debug code (use script_reload to reload)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_dump_lua_version",
  method = "CommandDumpLuaVersion",
  help = "Dump Lua version",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_dump_global",
  method = "CommandDumpGlobal",
  help = "Dump global value (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_find_global",
  method = "CommandFindGlobal",
  help = "Find global name (<pattern:regex>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_item_query",
  method = "CommandItemQuery",
  help = "Query items (<query:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_dump_abilities",
  method = "CommandDumpAbilities",
  help = "Dump current hero abilities ([simplified:int])",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_invoke",
  method = "CommandInvokeAbility",
  help = "Invoke an ability (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_dump_combo_graph",
  method = "CommandDumpComboGraph",
  help = "Dumps a combo's finite state machine in DOT format",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_music_status",
  method = "CommandChangeMusicStatus",
  help = "Change music status (<status:int> <intensity:float>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_dump_specials",
  method = "CommandDumpSpecials",
  help = "Dump Invoker ability specials ([onlyScaling:int])",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_debug_specials",
  method = "CommandDebugSpecials",
  help = "Run debug operations on ability specials (<dump|findKeys|findValues> <query:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

table.insert(M, {
  name = "inv_reinsert_ability",
  method = "CommandReinsertAbility",
  help = "Reinsert Invoker ability (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
})

return M
