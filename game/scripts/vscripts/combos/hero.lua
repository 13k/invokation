local M = {}

local Unit = require("dota2.unit")
local Invoker = require("dota2.invoker")

-- TODO: setup prepared invokations and orb levels
function M.setup(player, combo)
  local hero = player:GetAssignedHero()
  local unit = Unit(hero)
  local invoker = Invoker(hero)

  while unit:GetLevel() < combo.hero_level do
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

  invoker:Invoke(Invoker.ABILITY_EMPTY2)
  invoker:Invoke(Invoker.ABILITY_EMPTY1)

  local points = invoker:ResetAbilities()

  hero:SetAbilityPoints(hero:GetAbilityPoints() + points)
end

return M
