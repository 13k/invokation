local class = require("middleclass")

local Base = require("invk.game_mode.command.base")
---
--- Usage: invk_ability_reinsert <ability:string>
---
--- @class invk.game_mode.commands.AbilityReinsert : invk.game_mode.command.Base
--- @field ability string
local M = class("invk.game_mode.commands.AbilityReinsert", Base)

--- @type invk.game_mode.command.Spec
M.SPEC = {
  id = Base.Id.AbilityReinsert,
  name = "invk_ability_reinsert",
  help = "Reinsert Invoker ability (<ability:string>)",
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
  local ability = hero:FindAbilityByName(self.ability)

  if not ability then
    errorf("Ability %q not found", self.ability)
  end

  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(self.ability)

  ability = hero:AddAbility(self.ability)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end

return M
