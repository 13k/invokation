local class = require("middleclass")

local Id = require("invk.game_mode.command.id")
local Logger = require("invk.logger")

--- Console command definition.
--- @class invk.game_mode.command.Spec
--- @field id invk.game_mode.command.Id
--- @field name string # Command name
--- @field help string # Command help
--- @field flags? integer # Command flags
--- @field dev boolean # Only registered in development environment

--- Base console command class.
--- @class invk.game_mode.command.Base : middleclass.Class, invk.log.Mixin
--- @field SPEC invk.game_mode.command.Spec
--- @field spec invk.game_mode.command.Spec
--- @field game invk.GameMode
--- @field player CDOTAPlayerController
--- @field args string[]
--- @field logger invk.Logger
local M = class("invk.game_mode.command.Base")

M:include(Logger.Mixin)

M.Id = Id

--- @param value any
--- @return boolean?
function M.bool(value)
  if value == nil then
    return nil
  end

  if type(value) == "boolean" then
    return value
  end

  return value == 1 or value == "1" or value == "true"
end

--- @param spec invk.game_mode.command.Spec
--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(spec, game, player, args)
  self.spec = spec
  self.game = game
  self.player = player
  self.args = args
  self.logger = game.logger:child(F("command.%s", spec.id))
end

--- @abstract
--- @diagnostic disable-next-line: unused
function M:run()
  error("not implemented")
end

return M
