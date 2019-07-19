--- Internal combos hero helpers.
-- @module invokation.combos.hero

local M = {}

local Unit = require("invokation.dota2.Unit")
local Invoker = require("invokation.dota2.Invoker")

function M.setup(player, combo)
  local hero = player:GetAssignedHero()
  local unit = Unit(hero)
  local invoker = Invoker(hero)
  local resetXP = 0
  local resetGold = 0
  local resetLevel = 1

  unit:RemoveItems({includeStash = true, endCooldown = true})
  -- Orbs reset must come before hero replacement
  invoker:ResetAbilities()
  hero:SetAbilityPoints(resetLevel)
  hero = PlayerResource:ReplaceHeroWith(player:GetPlayerID(), hero:GetUnitName(), resetGold, resetXP)
  unit = Unit(hero)

  while unit:GetLevel() < combo.heroLevel do
    unit:HeroLevelUp(false)
  end

  unit:AddItemsByName(combo.items or {})
  unit:Hold()
end

return M
