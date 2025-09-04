local M = {}

--- @param player CDOTAPlayerController
--- @param name string
function M.reinsert(player, name)
  local hero = player:GetAssignedHero()
  local ability = hero:FindAbilityByName(name)

  if not ability then
    errorf("Ability %q not found", name)
  end

  local index = ability:GetAbilityIndex()
  local level = ability:GetLevel()

  hero:RemoveAbility(name)

  ability = hero:AddAbility(name)
  ability:SetAbilityIndex(index)
  ability:SetLevel(level)
end

return M
