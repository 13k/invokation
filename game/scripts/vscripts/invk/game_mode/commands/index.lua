local Id = require("invk.game_mode.command.id")

local MOD_BASE = "invk.game_mode.commands"

--- @class invk.game_mode.commands
--- @field [invk.game_mode.command.Id] invk.game_mode.command.Base
local M = setmetatable({}, {
  __index = function(self, modname)
    local value = rawget(self, modname)

    if value then
      return value
    end

    local ok, mod = pcall(require, F("%s.%s", MOD_BASE, modname))

    if not ok then
      error(F("error loading module %q: %s", modname, mod))
    end

    self[modname] = mod

    return mod
  end,
})

M.Id = Id

return M
