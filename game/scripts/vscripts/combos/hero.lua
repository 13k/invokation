local M = {}

local Unit = require("dota2.unit")

-- TODO: setup abilities, prepared invokations, items
function M.setup(player, combo)
  local hero = Unit(player:GetAssignedHero())

  while hero:GetLevel() < combo.hero_level do
    hero:HeroLevelUp(true)
  end

  if not hero:IsAlive() then
    hero:Respawn({isFirst = true})
  end

  hero:Purge({
    buffs = true,
    debuffs = true,
    frameOnly = false,
    stuns = true,
    exceptions = true,
  })

  hero:Interrupt()
  hero:HealMax(nil)
  hero:GiveMaxMana()
  hero:EndAbilitiesCooldowns()
  hero:RemoveItems({includeStash = true, endCooldown = true})
  hero:AddItemsByName(combo.items or {})
  hero:Hold()
end

return M
