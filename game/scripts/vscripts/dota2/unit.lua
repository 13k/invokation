local M = require("pl.class")()

local INVENTORY_SLOTS = 6
local UNIT_WITHOUT_INVENTORY_ERROR = "Unit '%s' doesn't have an inventory"

function M:_init(entity)
  self.entity = entity
  self.name = self.entity:GetUnitName()
end

function M:FindItemInInventory(name)
  if not self.entity:HasInventory() then
    error(UNIT_WITHOUT_INVENTORY_ERROR:format(self.name))
  end

  for i = 0, INVENTORY_SLOTS-1 do
    local item = self.entity:GetItemInSlot(i)

    if item and item:GetAbilityName() == name then
      return item
    end
  end

  return nil
end

function M:FindAbilityOrItem(name)
  if self.entity:HasAbility(name) then
    return self.entity:FindAbilityByName(name)
  end

  if self.entity:HasItemInInventory(name) then
    return self:FindItemInInventory(name)
  end

  return nil
end

return M
