local class = require("pl.class")
local m = require("moses")

local CBaseEntity = require("support.dota2.CBaseEntity")
local F = require("support.factory")

local INVENTORY = require("invk.const.inventory")

--- @class support.dota2.CDOTA_BaseNPC : support.dota2.CBaseEntity, CDOTA_BaseNPC
--- @field level integer
--- @field max_health integer
--- @field health integer
--- @field max_mana integer
--- @field mana integer
--- @field abilities { n: integer, [integer]: support.dota2.CDOTABaseAbility }
--- @field talent_ability_start integer
--- @field talent_ability_end integer
--- @field has_inventory boolean
--- @field inventory { [DOTAScriptInventorySlot_t]: support.dota2.CDOTA_Item }
--- @field player_owner support.dota2.CDOTAPlayerController
local CDOTA_BaseNPC = class(CBaseEntity)

--- @class (partial) support.dota2.CDOTA_BaseNPC_attributes : support.dota2.CBaseEntity_attributes
--- @field has_inventory? boolean
--- @field level? integer
--- @field max_health? integer
--- @field health? integer
--- @field max_mana? integer
--- @field mana? integer
--- @field [string] any

--- @type support.dota2.CDOTA_BaseNPC_attributes
local ATTRIBUTES = {
  has_inventory = false,
  level = 1,
  max_health = 1,
  health = 1,
  max_mana = 1,
  mana = 1,
}

local ABILITY_KEY_PATT = "^Ability(%d+)$"

--- @param attributes support.dota2.CDOTA_BaseNPC_attributes
function CDOTA_BaseNPC:_init(attributes)
  --- @type support.dota2.CDOTA_BaseNPC_attributes
  local attrs = m.extend({}, ATTRIBUTES, attributes)

  self:super(attrs)

  self.abilities = { n = 0 }
  self.inventory = {}
  self.talent_ability_start = 0
  self.talent_ability_end = 0

  for key, value in pairs(attrs) do
    if key == "AbilityTalentStart" then
      self.talent_ability_start = value
    else
      local index_str = key:match(ABILITY_KEY_PATT)
      local index = tonumber(index_str) --[[@as integer?]]

      if index and type(value) == "string" then
        if value == "" then
          self.talent_ability_end = index - 1
        else
          self.abilities[index] = self:create_ability(value, index)

          if index > self.abilities.n then
            self.abilities.n = index
          end
        end
      end
    end
  end
end

function CDOTA_BaseNPC:GetUnitName()
  return self:GetName()
end

function CDOTA_BaseNPC:IsHero()
  return self:GetName():match("^npc_dota_hero_") ~= nil
end

function CDOTA_BaseNPC:GetPlayerOwner()
  return self.player_owner
end

function CDOTA_BaseNPC:ForceKill(reincarnate)
  self.alive = reincarnate
end

function CDOTA_BaseNPC:GetLevel()
  return self.level
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:set_level(level)
  self.level = level
end

function CDOTA_BaseNPC:GetMaxHealth()
  return self.max_health
end

function CDOTA_BaseNPC:GetHealth()
  return self.health
end

function CDOTA_BaseNPC:Heal(amount, _source)
  local health = self.health + amount --[[@as integer]]

  self.health = health > self.max_health and self.max_health or health
end

function CDOTA_BaseNPC:GetMaxMana()
  return self.max_mana
end

function CDOTA_BaseNPC:GetMana()
  return self.mana
end

function CDOTA_BaseNPC:GiveMana(amount)
  local mana = self.mana + amount --[[@as integer]]

  self.mana = mana > self.max_mana and self.max_mana or mana
end

function CDOTA_BaseNPC:GetAbilityCount()
  return self.abilities.n
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

--- @param name string
--- @param index integer
--- @return CDOTABaseAbility
function CDOTA_BaseNPC:create_ability(name, index)
  local options = {}

  if self:IsHero() then
    options.hero = self:GetUnitName()
  end

  local ability = F.dota_ability({ name = name }, options)

  ability:SetAbilityIndex(index)

  return ability
end

function CDOTA_BaseNPC:AddAbility(name)
  local ability = self:FindAbilityByName(name)

  if ability ~= nil then
    return ability
  end

  local index = self.abilities.n + 1

  ability = self:create_ability(name, index)

  self.abilities[index] = ability
  self.abilities.n = index

  return ability
end

function CDOTA_BaseNPC:HasInventory()
  return self.has_inventory
end

-- not part of Dota2's scripting API
--- @param predicate fun(item: support.dota2.CDOTA_Item?, slot: DOTAScriptInventorySlot_t): boolean
--- @return DOTAScriptInventorySlot_t?
function CDOTA_BaseNPC:find_inventory_slot(predicate)
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
--- @return DOTAScriptInventorySlot_t?
function CDOTA_BaseNPC:find_free_inventory_slot()
  return self:find_inventory_slot(function(i)
    return i == nil
  end)
end

-- not part of Dota2's scripting API
--- @return DOTAScriptInventorySlot_t?
function CDOTA_BaseNPC:find_item_slot(item)
  return self:find_inventory_slot(function(i)
    return i ~= nil and (i:GetEntityIndex() == item:GetEntityIndex())
  end)
end

-- not part of Dota2's scripting API
function CDOTA_BaseNPC:find_item_slot_by_name(name)
  return self:find_inventory_slot(function(i)
    return i ~= nil and (i:GetAbilityName() == name)
  end)
end

function CDOTA_BaseNPC:HasItemInInventory(name)
  return self:find_item_slot_by_name(name) ~= nil
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

  local slot = self:find_free_inventory_slot()

  if slot == nil then
    return nil
  end

  self.inventory[slot] = F.dota_item({ name = name })

  return self.inventory[slot]
end

function CDOTA_BaseNPC:RemoveItem(item)
  if not self:HasInventory() then
    return
  end

  local slot = self:find_item_slot(item)

  if slot ~= nil then
    self.inventory[slot] = nil
  end
end

function CDOTA_BaseNPC:Hold() end
function CDOTA_BaseNPC:Purge(
  _removeBuffs,
  _removeDebuffs,
  _frameOnly,
  _removeStuns,
  _removeExceptions
)
end

function CDOTA_BaseNPC:SetIdleAcquire(_value) end

return CDOTA_BaseNPC
