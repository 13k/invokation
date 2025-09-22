local class = require("middleclass")

local Base = require("invk.game_mode.command.base")
local Logger = require("invk.logger")

--- Set debugging on/off.
---
--- Usage: invk_debug [value:bool]
---
---   * value:
---     - `true`: enable debugging
---     - `false`: disable debugging
---     - none: print current debugging setting
---
--- @class invk.game_mode.commands.Debug : invk.game_mode.command.Base
--- @field current_value boolean
--- @field value? boolean
local M = class("invk.game_mode.commands.Debug", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.Debug,
  name = "invk_debug",
  help = "Set debugging (empty - print debug status, 0 - disabled, 1 - enabled)",
  flags = FCVAR_CHEAT,
  dev = false,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  self.current_value = self.game.logger.level <= Logger.Level.DEBUG
  self.value = Base.bool(args[1])
end

function M:run()
  self:d(self.spec.id, self.args)

  if self.value == nil then
    print(F("%s: %s", self.spec.name, self.current_value))
    return
  end

  if self.value then
    self.game.logger.level = Logger.Level.DEBUG
  else
    self.game.logger.level = Logger.Level.INFO
  end

  print(F("%s: %s -> %s", self.spec.name, self.current_value, self.value))
end

return M
