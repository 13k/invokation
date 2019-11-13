local m = require("moses")
local class = require("pl.class")
local Factory = require("support.factory")

local INVENTORY_ACTIVE_SLOTS =
  {
    DOTA_ITEM_SLOT_1,
    DOTA_ITEM_SLOT_2,
    DOTA_ITEM_SLOT_3,
    DOTA_ITEM_SLOT_4,
    DOTA_ITEM_SLOT_5,
    DOTA_ITEM_SLOT_6,
    DOTA_ITEM_SLOT_7,
    DOTA_ITEM_SLOT_8,
    DOTA_ITEM_SLOT_9,
  }

local INVENTORY_STASH_SLOTS =
  {
    DOTA_STASH_SLOT_1,
    DOTA_STASH_SLOT_2,
    DOTA_STASH_SLOT_3,
    DOTA_STASH_SLOT_4,
    DOTA_STASH_SLOT_5,
    DOTA_STASH_SLOT_6,
  }

local INVENTORY_SLOTS =
  m.chain({}):append(INVENTORY_ACTIVE_SLOTS):append(INVENTORY_STASH_SLOTS):value()

CDOTA_BaseNPC = class(CBaseFlex)

function CDOTA_BaseNPC:_init(attributes)
  self:super(attributes)

  self.level = self.level or 1
  self.maxHealth = self.maxHealth or 0
  self.health = self.health or self.maxHealth
  self.maxMana = self.maxMana or 0
  self.mana = self.mana or self.maxMana
  self.abilities = {}
  self.inventory = {}
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

-- does not exist in original API
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
  local ability = Factory.create("dota_ability", { name = name })

  table.insert(self.abilities, ability)
  ability:SetAbilityIndex(#self.abilities)

  return ability
end

function CDOTA_BaseNPC:HasInventory()
  return self.hasInventory
end

-- does not exist in engine's API
function CDOTA_BaseNPC:findFreeInventorySlot()
  if not self.hasInventory then
    return nil
  end

  for _, slot in ipairs(INVENTORY_SLOTS) do
    if self.inventory[slot] == nil then
      return slot
    end
  end

  return nil
end

-- does not exist in engine's API
function CDOTA_BaseNPC:findInventorySlot(predicate)
  if not self.hasInventory then
    return nil
  end

  for _, slot in ipairs(INVENTORY_SLOTS) do
    if predicate(self.inventory[slot], slot) then
      return slot
    end
  end

  return nil
end

-- does not exist in engine's API
function CDOTA_BaseNPC:findItemSlot(item)
  return self:findInventorySlot(function(it)
    return it ~= nil and (it:GetEntityIndex() == item:GetEntityIndex())
  end)
end

-- does not exist in engine's API
function CDOTA_BaseNPC:findItemSlotByName(name)
  return self:findInventorySlot(function(it)
    return it ~= nil and (it:GetAbilityName() == name)
  end)
end

function CDOTA_BaseNPC:HasItemInInventory(name)
  return self:findItemSlotByName(name) ~= nil
end

function CDOTA_BaseNPC:GetItemInSlot(slot)
  if not self.hasInventory then
    return nil
  end

  return self.inventory[slot]
end

function CDOTA_BaseNPC:AddItemByName(name)
  if not self.hasInventory then
    return nil
  end

  local slot = self:findFreeInventorySlot()

  if slot == nil then
    return nil
  end

  self.inventory[slot] = CDOTA_Item{ name = name }

  return self.inventory[slot]
end

function CDOTA_BaseNPC:RemoveItem(item)
  if not self.hasInventory then return end

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

function CDOTA_BaseNPC:Purge(removeBuffs, removeDebuffs, frameOnly, removeStuns, removeExceptions)
end
