local class = require("middleclass")

local Base = require("invk.game_mode.command.base")
local Invoker = require("invk.dota2.invoker")

--- Invoke ability by name.
---
--- Usage: invk_ability_invoke <ability:string>
---
--- @class invk.game_mode.commands.Invoke : invk.game_mode.command.Base
--- @field ability string
local M = class("invk.game_mode.commands.Invoke", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.AbilityInvoke,
  name = "invk_ability_invoke",
  help = "Invoke an ability (<ability:string>)",
  flags = FCVAR_CHEAT,
  dev = true,
}

--- @param game invk.GameMode
--- @param player CDOTAPlayerController
--- @param args string[]
function M:initialize(game, player, args)
  Base.initialize(self, M.SPEC, game, player, args)

  self.ability = assert(args[1], "argument <ability> is required")
end

function M:run()
  self:d(self.spec.id, self.args)

  local hero = self.player:GetAssignedHero()
  local invoker = Invoker:new(hero)

  invoker:invoke(self.ability)
end

return M
