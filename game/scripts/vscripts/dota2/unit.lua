local M = require("pl.class")()

local types = require("pl.types")
local Inventory = require("const.inventory")

local UNIT_NO_INVENTORY_ERROR = "Unit '%s' does not have an inventory"
local UNIT_CANNOT_RESPAWN_ERROR = "Unit '%s' cannot respawn"

local MAX_ABILITIES = 16
local DELEGATES = {
  "AddItemByName",
  "FindAbilityByName",
  "GetPlayerOwner",
  "GetPlayerOwnerID",
  "GetAbilityByIndex",
  "GetItemInSlot",
  "GetLevel",
  "GetMaxHealth",
  "GetMaxMana",
  "GiveMana",
  "HasAbility",
  "HasInventory",
  "HasItemInInventory",
  "Heal",
  "HeroLevelUp",
  "Hold",
  "Interrupt",
  "IsAlive",
  "IsHero",
  "RemoveItem",
  "RespawnHero",
  "RespawnUnit",
}

function M:_init(entity)
  self.entity = entity
  self.name = self.entity:GetUnitName()
end

function M:Respawn(options)
  options = options or {}

  if not self.entity:UnitCanRespawn() then
    error(UNIT_CANNOT_RESPAWN_ERROR:format(self.name))
  end

  if self:IsHero() then
    self:RespawnHero(
      types.to_bool(options.buyback),
      types.to_bool(options.isFirst),
      types.to_bool(options.penalty)
    )
  else
    self:RespawnUnit()
  end
end

function M:Purge(options)
  options = options or {}

  return self.entity:Purge(
    types.to_bool(options.buffs),
    types.to_bool(options.debuffs),
    types.to_bool(options.frameOnly),
    types.to_bool(options.stuns),
    types.to_bool(options.exceptions)
  )
end

function M:HealMax(healSource)
  return self:Heal(self:GetMaxHealth(), healSource)
end

function M:GiveMaxMana()
  return self:GiveMana(self:GetMaxMana())
end

function M:AddItemsByName(items)
  for _, itemName in ipairs(items) do
    self:AddItemByName(itemName)
  end
end

function M:FindItemInInventory(name, options)
  options = options or {}

  if not self:HasInventory() then
    error(UNIT_NO_INVENTORY_ERROR:format(self.name))
  end

  local slots = options.includeStash and Inventory.SLOTS or Inventory.INVENTORY_SLOTS

  for _, slot in ipairs(slots) do
    local item = self:GetItemInSlot(slot)

    if item and item:GetAbilityName() == name then
      return item
    end
  end

  return nil
end

function M:RemoveItems(options)
  options = options or {}

  local items = {}
  local slots = options.includeStash and Inventory.SLOTS or Inventory.INVENTORY_SLOTS

  for _, slot in ipairs(slots) do
    local item = self:GetItemInSlot(slot)

    if item ~= nil then
      if options.endCooldown then
        item:EndCooldown()
      end

      self:RemoveItem(item)
      table.insert(items, item)
    end
  end

  return items
end

function M:FindAbilityOrItem(name)
  if self:HasAbility(name) then
    return self:FindAbilityByName(name)
  end

  if self:HasItemInInventory(name) then
    return self:FindItemInInventory(name)
  end

  return nil
end

function M:EndAbilitiesCooldowns()
  for i = 0, MAX_ABILITIES - 1 do
    local ability = self:GetAbilityByIndex(i)

    if ability ~= nil then
      ability:EndCooldown()
    end
  end
end

for _, method in ipairs(DELEGATES) do
  M[method] = function(self, ...)
    return self.entity[method](self.entity, ...)
  end
end

return M
