local class = require("middleclass")
local inspect = require("inspect")

local Base = require("invk.game_mode.command.base")

--- Dump global value.
---
--- Usage: invk_global_dump <name:string>
---
--- @class invk.game_mode.commands.DumpGlobal : invk.game_mode.command.Base
--- @field name string
local M = class("invk.game_mode.commands.DumpGlobal", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.GlobalDump,
  name = "invk_global_dump",
  help = "Dump global value (<name:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  self.name = assert(args[1], "argument <name> is required")
end

function M:run()
  self:d(self.spec.id, self.args)

  -- selene: allow(global_usage)
  local value = _G

  for segment in self.name:gmatch("([^.]+)%.?") do
    value = value[segment]
  end

  local ty = type(value)
  local repr = inspect(value)

  print(F("%q (%s): %s", self.name, ty, repr))

  if ty == "function" then
    local info = debug.getinfo(value)

    print(F("source: %s:%d", info.source, info.linedefined))
  end
end

return M
