local M = {}

local stringx = require("pl.stringx")

-- TODO: setup abilities, prepared invokations, items
function M.setup(player, combo)
  local hero = player:GetAssignedHero()
  local level = hero:GetLevel()

  while level < combo.hero_level do
    hero:HeroLevelUp(true)
    level = hero:GetLevel()
  end

  if not hero:IsAlive() then
    hero:RespawnUnit()
  end

  hero:Interrupt()
  hero:Purge(true, true, false, true, true)
  hero:Heal(hero:GetMaxHealth(), nil)
  hero:GiveMana(hero:GetMaxMana())

  for i = 0, hero:GetAbilityCount() do
    local ability = hero:GetAbilityByIndex(i)

    if ability ~= nil then
      ability:EndCooldown()
    end
  end

  for i = 0, 5 do
    local item = hero:GetItemInSlot(i)

    if item ~= nil then
      item:EndCooldown()
      hero:RemoveItem(item)
    end
  end

  for _, itemName in ipairs(combo.items or {}) do
    hero:AddItemByName(itemName)
  end
end

return M
