local class = require("middleclass")

local Base = require("invk.game_mode.command.base")

--- Search a global value.
---
--- Usage: invk_global_find <pattern:string>
---
--- @class invk.game_mode.commands.FindGlobal : invk.game_mode.command.Base
--- @field pattern string
local M = class("invk.game_mode.commands.FindGlobal", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.GlobalFind,
  name = "invk_global_find",
  help = "Find global name (<pattern:regex>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  self.pattern = assert(args[1], "argument <pattern> is required")
end

function M:run()
  self:d(self.spec.id, self.args)

  local matches = {}

  -- selene: allow(global_usage)
  for name, _ in pairs(_G) do
    if name:match(self.pattern) then
      table.insert(matches, name)
    end
  end

  table.sort(matches)

  print(F("Globals matching pattern %q:", self.pattern))

  for _, match in ipairs(matches) do
    print(F(" * %s", match))
  end

  print("---")
end

return M
