--- Internal combos hero helpers.
-- @module invokation.combos.hero

local M = {}

local Unit = require("invokation.dota2.Unit")
local Invoker = require("invokation.dota2.Invoker")

-- @todo Setup prepared invokations and orb levels
function M.setup(player, combo)
  local hero = player:GetAssignedHero()
  local unit = Unit(hero)
  local invoker = Invoker(hero)

  while unit:GetLevel() < combo.heroLevel do
    unit:HeroLevelUp(false)
  end

  if not unit:IsAlive() then
    unit:Respawn({isFirst = true})
  end

  unit:Purge({
    buffs = true,
    debuffs = true,
    frameOnly = false,
    stuns = true,
    exceptions = true,
  })

  unit:Interrupt()
  unit:HealMax(nil)
  unit:GiveMaxMana()
  unit:EndAbilityCooldowns()
  unit:RemoveItems({includeStash = true, endCooldown = true})
  unit:AddItemsByName(combo.items or {})
  unit:Hold()

  local points = invoker:ResetAbilities()

  hero:SetAbilityPoints(hero:GetAbilityPoints() + points)
end

return M
