local class = require("middleclass")

local Base = require("invk.game_mode.command.base")

--- Change music status.
---
--- Usage: invk_music_status <status:integer> <intensity:float>
---
--- @class invk.game_mode.commands.MusicStatus : invk.game_mode.command.Base
--- @field status integer
--- @field intensity number
local M = class("invk.game_mode.commands.MusicStatus", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.MusicStatus,
  name = "invk_music_status",
  help = "Change music status (<status:integer> <intensity:float>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  local status_str = assert(args[1], "argument <status> is required")
  local status = tonumber(status_str) --[[@as integer?]]

  if not status then
    errorf("Invalid status %q", status_str)
  end

  local intensity_str = assert(args[1], "argument <intensity> is required")
  local intensity = tonumber(intensity_str)

  if not intensity then
    errorf("Invalid intensity %q", intensity_str)
  end

  self.status = status
  self.intensity = intensity
end

function M:run()
  self:d(self.spec.id, self.args)

  self.player:SetMusicStatus(self.status, self.intensity)
end

return M
