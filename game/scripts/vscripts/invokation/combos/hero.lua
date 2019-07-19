--- Internal combos hero helpers.
-- @module invokation.combos.hero

local M = {}

local Unit = require("invokation.dota2.Unit")
local Invoker = require("invokation.dota2.Invoker")

function M.setup(player, combo)
  local hero = player:GetAssignedHero()
  local resetXP = 0
  local resetGold = 0
  local resetLevel = 1

  hero = PlayerResource:ReplaceHeroWith(player:GetPlayerID(), hero:GetUnitName(), resetGold, resetXP)

  local invoker = Invoker(hero)
  local unit = Unit(hero)

  invoker:ResetAbilities()
  hero:SetAbilityPoints(resetLevel)

  while unit:GetLevel() < combo.heroLevel do
    unit:HeroLevelUp(false)
  end

  unit:RemoveItems({includeStash = true, endCooldown = true})
  unit:AddItemsByName(combo.items or {})
  unit:Hold()
end

return M
