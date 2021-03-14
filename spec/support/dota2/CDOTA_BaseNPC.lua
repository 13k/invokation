local m = require("moses")
local class = require("pl.class")
local Factory = require("support.factory")

local INVENTORY = require("invokation.const.inventory")

CDOTA_BaseNPC = class(CBaseFlex)

local DEFAULTS = {
  hasInventory = false,
  level = 1,
  maxHealth = 0,
  health = 0,
  maxMana = 0,
  mana = 0,
}

function CDOTA_BaseNPC:_init(attributes)
  local baseAttributes = {abilities = {}, inventory = {}}
  self:super(m.extend(baseAttributes, DEFAULTS, attributes or {}))
end

function CDOTA_BaseNPC:GetUnitName()
  return self:GetName()
end

function CDOTA_BaseNPC:GetPlayerOwner()
  return self.playerOwner
end

function CDOTA_BaseNPC:ForceKill(reincarnate)
  self.alive = reincarnate
end

function CDOTA_BaseNPC:GetLevel()
  return self.level
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:SetLevel(level)
  self.level = level
end

function CDOTA_BaseNPC:GetMaxHealth()
  return self.maxHealth
end

function CDOTA_BaseNPC:GetHealth()
  return self.health
end

function CDOTA_BaseNPC:Heal(amount, source)
  local health = self.health + amount
  self.health = health > self.maxHealth and self.maxHealth or health
end

function CDOTA_BaseNPC:GetMaxMana()
  return self.maxMana
end

function CDOTA_BaseNPC:GetMana()
  return self.mana
end

function CDOTA_BaseNPC:GiveMana(amount)
  local mana = self.mana + amount
  self.mana = mana > self.maxMana and self.maxMana or mana
end

function CDOTA_BaseNPC:GetAbilityCount()
  return 24
end

function CDOTA_BaseNPC:GetAbilityByIndex(i)
  return self.abilities[i]
end

function CDOTA_BaseNPC:FindAbilityByName(name)
  for i = 1, self:GetAbilityCount() do
    local ability = self.abilities[i]
    if ability ~= nil and ability:GetAbilityName() == name then
      return ability
    end
  end

  return nil
end

function CDOTA_BaseNPC:AddAbility(name)
  local ability = self:FindAbilityByName(name)

  if ability ~= nil then
    return ability
  end

  ability = Factory.create("dota_ability", {name = name})

  table.insert(self.abilities, ability)
  ability:SetAbilityIndex(#self.abilities)

  return ability
end

function CDOTA_BaseNPC:HasInventory()
  return self.hasInventory
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:findInventorySlot(predicate)
  if not self:HasInventory() then
    return nil
  end

  for _, slot in ipairs(INVENTORY.SLOTS) do
    if predicate(self.inventory[slot], slot) then
      return slot
    end
  end

  return nil
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:findFreeInventorySlot()
  return self:findInventorySlot(function(item)
    return item == nil
  end)
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:findItemSlot(item)
  return self:findInventorySlot(function(it)
    return it ~= nil and (it:GetEntityIndex() == item:GetEntityIndex())
  end)
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:findItemSlotByName(name)
  return self:findInventorySlot(function(it)
    return it ~= nil and (it:GetAbilityName() == name)
  end)
end

function CDOTA_BaseNPC:HasItemInInventory(name)
  return self:findItemSlotByName(name) ~= nil
end

function CDOTA_BaseNPC:GetItemInSlot(slot)
  if not self:HasInventory() then
    return nil
  end

  return self.inventory[slot]
end

function CDOTA_BaseNPC:AddItemByName(name)
  if not self:HasInventory() then
    return nil
  end

  local slot = self:findFreeInventorySlot()

  if slot == nil then
    return nil
  end

  self.inventory[slot] = CDOTA_Item({name = name})

  return self.inventory[slot]
end

function CDOTA_BaseNPC:RemoveItem(item)
  if not self:HasInventory() then
    return
  end

  local slot = self:findItemSlot(item)

  if slot ~= nil then
    self.inventory[slot] = nil
  end

  return slot
end

function CDOTA_BaseNPC:SetIdleAcquire(value)
  self.idleAcquire = value
end

function CDOTA_BaseNPC:Hold()
end

function CDOTA_BaseNPC:Purge(removeBuffs,
                             removeDebuffs,
                             frameOnly,
                             removeStuns,
                             removeExceptions)
end
