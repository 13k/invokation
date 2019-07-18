--- Unit class.
-- @classmod invokation.dota2.Unit

local M = require("pl.class")()

local types = require("pl.types")
local Inventory = require("invokation.const.inventory")
local delegation = require("invokation.lang.delegation")

local UNIT_NO_INVENTORY_ERROR = "Unit '%s' does not have an inventory"
local UNIT_CANNOT_RESPAWN_ERROR = "Unit '%s' cannot respawn"

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

delegation.delegate(M, "entity", DELEGATES)

--- Constructor.
-- @tparam CDOTA_BaseNPC entity Unit entity
function M:_init(entity)
  self.entity = entity
  self.name = self.entity:GetUnitName()
end

--- Respawns the unit.
--
-- If the unit is a hero, uses `CDOTA_BaseNPC_Hero:RespawnHero()` with given
-- options, otherwise uses `CDOTA_BaseNPC:RespawnUnit()`.
--
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.buyback Is buyback respawn?
-- @tparam[opt=false] bool options.isFirst Is actually being spawned for the first time?
-- @tparam[opt=false] bool options.penalty Apply respawn penalty?
function M:Respawn(options)
  options = options or {}

  if not self.entity:UnitCanRespawn() then
    error(UNIT_CANNOT_RESPAWN_ERROR:format(self.name))
  end

  if self:IsHero() then
    return self:RespawnHero(
      types.to_bool(options.buyback),
      types.to_bool(options.isFirst),
      types.to_bool(options.penalty)
    )
  end

  return self:RespawnUnit()
end

--- Purges the unit.
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.buffs Remove positive buffs
-- @tparam[opt=false] bool options.debuffs Remove negative buffs
-- @tparam[opt=false] bool options.frameOnly Remove buffs created this frame only
-- @tparam[opt=false] bool options.stuns Remove stuns
-- @tparam[opt=false] bool options.exceptions Remove exceptions
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

--- Heals the unit to the maximum health.
-- @tparam[opt] CBaseEntity healSource Heal source entity
function M:HealMax(healSource)
  return self:Heal(self:GetMaxHealth(), healSource)
end

--- Gives the unit maximum mana.
function M:GiveMaxMana()
  return self:GiveMana(self:GetMaxMana())
end

--- Add items with given names.
-- @tparam array(string) items List of item names
function M:AddItemsByName(items)
  for _, itemName in ipairs(items) do
    self:AddItemByName(itemName)
  end
end

--- Finds item by name in inventory.
-- @tparam string name Item name
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.includeStash Include the stash in the search
-- @treturn CDOTA_Item|nil Item if found, `nil` otherwise
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

--- Removes all items.
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.includeStash Remove items in stash too
-- @tparam[opt=false] bool options.endCooldown Reset item cooldowns before removing
-- @treturn {CDOTA_Item,...} A list of removed items
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

--- Finds ability or item by name.
-- @tparam string name Ability or item name
-- @treturn CDOTABaseAbility|CDOTA_Item|nil Ability or item entity if found, `nil` otherwise
function M:FindAbilityOrItem(name)
  if self:HasAbility(name) then
    return self:FindAbilityByName(name)
  end

  if self:HasItemInInventory(name) then
    return self:FindItemInInventory(name)
  end

  return nil
end

--- Clears all abilities cooldowns.
function M:EndAbilityCooldowns()
  for i = 0, self.entity:GetAbilityCount() - 1 do
    local ability = self:GetAbilityByIndex(i)

    if ability ~= nil then
      ability:EndCooldown()
    end
  end
end

return M
