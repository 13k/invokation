--# selene: allow(unused_variable)

local class = require("middleclass")

local Base = require("invk.game_mode.command.base")

--- Placeholder command to run miscellaneous debug code.
---
--- Use `script_reload` to reload after changes.
---
--- @class invk.game_mode.commands.DebugMisc : invk.game_mode.command.Base
local M = class("invk.game_mode.commands.DebugMisc", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.DebugMisc,
  name = "invk_debug_misc",
  help = "Run miscellaneous debug code (use script_reload to reload)",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)
end

function M:run()
  self:d(self.spec.id, self.args)
end

return M
