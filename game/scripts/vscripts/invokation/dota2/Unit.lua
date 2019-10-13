--- Unit class.
-- @classmod invokation.dota2.Unit

local M = require("pl.class")()

local list = require("invokation.lang.list")
local types = require("pl.types")
local INVENTORY = require("invokation.const.inventory")
local delegation = require("invokation.lang.delegation")

local UNIT_NO_INVENTORY_ERROR = "Unit '%s' does not have an inventory"
local UNIT_CANNOT_RESPAWN_ERROR = "Unit '%s' cannot respawn"

local DELEGATES =
  {
    "AddItemByName",
    "FindAbilityByName",
    "GetAbilityByIndex",
    "GetEntityIndex",
    "GetItemInSlot",
    "GetLevel",
    "GetMaxHealth",
    "GetMaxMana",
    "GetPlayerOwner",
    "GetPlayerOwnerID",
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
    "SetAbilityPoints",
    "SetGold",
    "StopSound",
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
  if not self.entity:UnitCanRespawn() then
    error(UNIT_CANNOT_RESPAWN_ERROR:format(self.name))
  end

  options = options or {}

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
-- @tparam[opt=true] bool options.buffs Remove positive buffs
-- @tparam[opt=true] bool options.debuffs Remove negative buffs
-- @tparam[opt=true] bool options.stuns Remove stuns
-- @tparam[opt=true] bool options.exceptions Remove exceptions
-- @tparam[opt=false] bool options.frameOnly Remove buffs created this frame only
function M:Purge(options)
  options = options or {}
  options.buffs = options.buffs == nil and true or options.buffs
  options.debuffs = options.debuffs == nil and true or options.debuffs
  options.stuns = options.stuns == nil and true or options.stuns
  options.exceptions = options.exceptions == nil and true or options.exceptions

  return self.entity:Purge(
    types.to_bool(options.buffs),
    types.to_bool(options.debuffs),
    types.to_bool(options.frameOnly),
    types.to_bool(options.stuns),
    types.to_bool(options.exceptions)
  )
end

--- Levels up the hero unit.
-- @tparam int level Target level (if current level is higher, does nothing)
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.playEffects Play level up effects
function M:HeroLevelUpTo(level, options)
  options = options or {}

  while self:GetLevel() < level do
    self:HeroLevelUp(types.to_bool(options.playEffects))
  end
end

--- Heals the unit to the maximum health.
-- @tparam[opt] CBaseEntity healSource Heal source entity
function M:GiveMaxHealth(healSource)
  return self:Heal(self:GetMaxHealth(), healSource)
end

--- Gives the unit maximum mana.
function M:GiveMaxMana()
  return self:GiveMana(self:GetMaxMana())
end

--- Gives the hero unit a gold amount.
-- @tparam int amount Gold amount (can be negative)
-- @tparam table options Options table
-- @tparam[opt=true] bool options.reliable Is this gold reliable?
-- @tparam[opt=DOTA_ModifyGold_Unspecified] EDOTA_ModifyGold_Reason options.reason Reason flags
function M:GiveGold(amount, options)
  options = options or {}
  options.reliable = options.reliable == nil and true or options.reliable
  options.reason = options.reason == nil and DOTA_ModifyGold_Unspecified or options.reason

  return self.entity:ModifyGold(amount, types.to_bool(options.reliable), options.reason)
end

function M:forEachItem(callback, options)
  if not self:HasInventory() then
    error(UNIT_NO_INVENTORY_ERROR:format(self.name))
  end

  options = options or {}
  options.includeStash = options.includeStash == nil and true or options.includeStash

  local slots

  if options.onlyStash then
    slots = INVENTORY.STASH_SLOTS
  elseif options.includeStash then
    slots = INVENTORY.SLOTS
  else
    slots = INVENTORY.INVENTORY_SLOTS
  end

  for _, slot in ipairs(slots) do
    local item = self:GetItemInSlot(slot)

    if item then
      local ret = { callback(item, slot) }
      local continue = true

      if #ret > 0 then
        continue = table.remove(ret, 1)
      end

      if not continue then
        return unpack(ret)
      end
    end
  end

  return nil
end

--- Returns an array of names of all items in the unit's inventory.
-- @tparam[opt={}] table options Options table
-- @tparam[opt=true] bool options.includeStash Including stash
-- @tparam[opt=false] bool options.onlyStash Only stash
--   (mutually exclusive with `includeStash`. `onlyStash` takes precedence.)
-- @treturn {string,...} Array of item names
function M:ItemNames(options)
  local names = {}

  self:forEachItem(function(item)
    table.insert(names, item:GetAbilityName())
  end, options)

  return names
end

--- Add items with given names.
-- @tparam {string,...} items Array of item names
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.onlyMissing Only add missing items
--   (the diff between the inventory and the array)
-- @treturn {CDOTA_Item,...} Array of added item entities
function M:AddItemsByName(items, options)
  if not self:HasInventory() then
    error(UNIT_NO_INVENTORY_ERROR:format(self.name))
  end

  options = options or {}

  if options.onlyMissing then
    items = list.diff(items, self:ItemNames())
  end

  local added = {}

  for _, itemName in ipairs(items) do
    table.insert(added, self:AddItemByName(itemName))
  end

  return added
end

--- Finds item by name in inventory.
-- @tparam string name Item name
-- @tparam[opt={}] table options Options table
-- @tparam[opt=true] bool options.includeStash Including stash
-- @tparam[opt=false] bool options.onlyStash Only stash
--   (mutually exclusive with `includeStash`. `onlyStash` takes precedence.)
-- @treturn ?CDOTA_Item Item if found, `nil` otherwise
function M:FindItemInInventory(name, options)
  return self:forEachItem(function(item)
    if item:GetAbilityName() == name then
      return false, item
    end
  end, options)
end

--- Removes all items.
-- @tparam[opt={}] table options Options table
-- @tparam[opt=true] bool options.includeStash Including stash
-- @tparam[opt=false] bool options.onlyStash Only stash
--   (mutually exclusive with `includeStash`. `onlyStash` takes precedence.)
-- @tparam[opt=false] bool options.endCooldown Reset item cooldowns before removing
-- @treturn {CDOTA_Item,...} An array of removed items
function M:RemoveItems(options)
  options = options or {}

  local removed = {}

  self:forEachItem(function(item)
    if options.endCooldown then
      item:EndCooldown()
    end

    self:RemoveItem(item)
    table.insert(removed, item)
  end, options)

  return removed
end

--- Clears all items cooldowns.
-- @tparam[opt={}] table options Options table
-- @tparam[opt=true] bool options.includeStash Including stash
-- @tparam[opt=false] bool options.onlyStash Only stash
--   (mutually exclusive with `includeStash`. `onlyStash` takes precedence.)
function M:EndItemCooldowns(options)
  self:forEachItem(function(item)
    item:EndCooldown()
  end, options)
end

--- Removes all dropped items owned by this unit.
function M:RemoveDroppedItems()
  local removed = {}

  for i = 0, GameRules:NumDroppedItems() - 1 do
    local ent = GameRules:GetDroppedItem(i)
    local item = EntityFramework:CreateEntity("CDOTA_Item", ent)
    local purchaser = item:GetPurchaser()
    local purchaserEntIdx = purchaser and purchaser:GetEntityIndex()

    if purchaserEntIdx == self:GetEntityIndex() then
      table.insert(removed, item)
    end
  end

  for _, item in ipairs(removed) do
    item:RemoveSelf()
  end

  return removed
end

--- Finds ability or item by name.
-- @tparam string name Ability or item name
-- @treturn CDOTABaseAbility|CDOTA_Item Ability or item entity if found
-- @treturn nil otherwise
function M:FindAbilityOrItem(name)
  if self:HasAbility(name) then
    return self:FindAbilityByName(name)
  end

  if self:HasInventory() and self:HasItemInInventory(name) then
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
