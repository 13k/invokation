--- Command definitions.
--- @class invk.const.commands : invk.game_mode.ConsoleCommmand[]
local M = {}

--- Command definition.
--- @class invk.game_mode.ConsoleCommmand
--- @field name string # Command name
--- @field method string # `GameMode` method name
--- @field help string # Command help
--- @field flags? integer # Command flags
--- @field dev boolean # Only registered in development environment

M[#M + 1] = {
  name = "invk_debug",
  method = "CommandSetDebug",
  help = "Set debugging (empty - print debug status, 0 - disabled, 1 - enabled)",
  flags = FCVAR_CHEAT,
  dev = false,
}

M[#M + 1] = {
  name = "invk_debug_misc",
  method = "CommandDebugMisc",
  help = "Run miscellaneous debug code (use script_reload to reload)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_dump_lua_version",
  method = "CommandDumpLuaVersion",
  help = "Dump Lua version",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_dump_global",
  method = "CommandDumpGlobal",
  help = "Dump global value (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_find_global",
  method = "CommandFindGlobal",
  help = "Find global name (<pattern:regex>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_item_query",
  method = "CommandItemQuery",
  help = "Query items (<query:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_dump_abilities",
  method = "CommandDumpAbilities",
  help = "Dump current hero abilities ([simplified:int])",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_invoke",
  method = "CommandInvokeAbility",
  help = "Invoke an ability (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_dump_combo_graph",
  method = "CommandDumpComboGraph",
  help = "Dumps a combo's finite state machine in DOT format",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_music_status",
  method = "CommandChangeMusicStatus",
  help = "Change music status (<status:int> <intensity:float>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_dump_specials",
  method = "CommandDumpSpecials",
  help = "Dump Invoker ability specials ([onlyScaling:int])",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_debug_specials",
  method = "CommandDebugSpecials",
  help = "Run debug operations on ability specials (<dump|findKeys|findValues> <query:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

M[#M + 1] = {
  name = "invk_reinsert_ability",
  method = "CommandReinsertAbility",
  help = "Reinsert Invoker ability (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

return M
