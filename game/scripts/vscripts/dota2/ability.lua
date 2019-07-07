local M = require("pl.class")()

local tablex = require("pl.tablex")
local Invoker = require("const.invoker")

local ORB_ABILITIES = tablex.pairmap(
  function(_, ability) return true, ability end,
  Invoker.ORB_ABILITIES
)

function M:_init(abilityEntity)
  self.entity = abilityEntity
  self.name = self.entity:GetAbilityName()
end

function M:IsItem()
  return self.entity:IsItem()
end

function M:IsOrbAbility()
  return ORB_ABILITIES[self.name] or false
end

function M:IsInvokationAbility()
  return self:IsOrbAbility() or self.name == Invoker.ABILITY_INVOKE
end

return M
