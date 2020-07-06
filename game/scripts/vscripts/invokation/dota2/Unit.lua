--- Unit class.
-- @classmod invokation.dota2.Unit
local m = require("moses")
local class = require("pl.class")
local types = require("pl.types")
local delegation = require("invokation.lang.delegation")

local LIMITS = require("invokation.const.limits")
local INVENTORY = require("invokation.const.inventory")

local M = class()

local ERRF_UNIT_NO_INVENTORY = "Unit '%s' does not have an inventory"
local ERRF_UNIT_CANNOT_RESPAWN = "Unit '%s' cannot respawn"

local DELEGATES = {
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
-- If the unit is a hero, uses `CDOTA_BaseNPC_Hero:RespawnHero` with given
-- options, otherwise uses `CDOTA_BaseNPC:RespawnUnit`.
--
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.buyback Is buyback respawn?
-- @tparam[opt=false] bool options.isFirst Is actually being spawned for the first time?
-- @tparam[opt=false] bool options.penalty Apply respawn penalty?
function M:Respawn(options)
  if not self.entity:UnitCanRespawn() then
    error(ERRF_UNIT_CANNOT_RESPAWN:format(self.name))
  end

  options = options or {}

  if self:IsHero() then
    return self:RespawnHero(types.to_bool(options.buyback), types.to_bool(options.isFirst),
                            types.to_bool(options.penalty))
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

  return self.entity:Purge(types.to_bool(options.buffs), types.to_bool(options.debuffs),
                           types.to_bool(options.frameOnly), types.to_bool(options.stuns),
                           types.to_bool(options.exceptions))
end

--- Levels up the hero unit.
-- @tparam int level Target level (if current level is higher, does nothing)
-- @tparam[opt={}] table options Options table
-- @tparam[opt=false] bool options.playEffects Play level up effects
function M:HeroLevelUpTo(level, options)
  options = options or {}

  if level > LIMITS.MAX_HERO_LEVEL then
    level = LIMITS.MAX_HERO_LEVEL
  end

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

--- Iterates over the unit's inventory, yielding each non-nil item.
-- @tparam function callback Iterator function
-- @tparam[opt={}] table options Options table
-- @tparam[opt={}] table options.sections Array of inventory sections to scan ("inventory", "stash",
--   "neutral"). Scans the whole inventory if empty.
function M:ForEachItem(callback, options)
  if not self:HasInventory() then
    error(ERRF_UNIT_NO_INVENTORY:format(self.name))
  end

  options = options or {}
  options.sections = options.sections or {"inventory", "stash", "neutral"}

  local slots = m.chain({})

  for _, part in ipairs(options.sections) do
    if part == "inventory" then
      slots = slots:append(INVENTORY.INVENTORY_SLOTS)
    elseif part == "stash" then
      slots = slots:append(INVENTORY.STASH_SLOTS)
    elseif part == "neutral" then
      slots = slots:append(INVENTORY.NEUTRAL_SLOTS)
    end
  end

  slots = slots:value()

  for _, slot in ipairs(slots) do
    local item = self:GetItemInSlot(slot)

    if item then
      local ret = {callback(item)}
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
-- @tparam[opt={}] table options Accepts the same options as @{ForEachItem}
-- @tparam[opt=false] bool options.sort Sorts the resulting array.
-- @treturn {string,...} Array of item names
function M:ItemNames(options)
  local names = {}

  options = options or {}

  self:ForEachItem(function(item)
    table.insert(names, item:GetAbilityName())
  end, options)

  if options.sort then
    names = m.sort(names)
  end

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
    error(ERRF_UNIT_NO_INVENTORY:format(self.name))
  end

  options = options or {}
  items = m.chain(items)

  if options.onlyMissing then
    items = items:difference(self:ItemNames())
  end

  items = items:map(function(name)
    return self:AddItemByName(name)
  end)

  return items:value()
end

--- Finds item by name in inventory.
-- @tparam string name Item name
-- @tparam[opt={}] table options Accepts the same options as @{ForEachItem}
-- @treturn ?CDOTA_Item Item if found, `nil` otherwise
function M:FindItemInInventory(name, options)
  return self:ForEachItem(function(item)
    if item:GetAbilityName() == name then
      return false, item
    end
  end, options)
end

--- Removes all items.
-- @tparam[opt={}] table options Accepts the same options as @{ForEachItem}
-- @tparam[opt=false] bool options.endCooldown Reset item cooldowns before removing
-- @treturn {CDOTA_Item,...} An array of removed items
function M:RemoveItems(options)
  options = options or {}

  local removed = {}

  self:ForEachItem(function(item)
    if options.endCooldown then
      item:EndCooldown()
    end

    self:RemoveItem(item)

    table.insert(removed, item)
  end, options)

  return removed
end

--- Clears all items cooldowns.
-- @tparam[opt={}] table options Accepts the same options as @{ForEachItem}
function M:EndItemCooldowns(options)
  self:ForEachItem(function(item)
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

--- Iterates over the unit's abilities, yielding each non-nil ability.
-- @tparam function callback Iterator function
function M:ForEachAbility(callback)
  for i = 0, self.entity:GetAbilityCount() - 1 do
    local ability = self:GetAbilityByIndex(i)

    if ability ~= nil then
      local ret = {callback(ability)}
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

--- Clears all abilities cooldowns.
function M:EndAbilityCooldowns()
  self:ForEachAbility(function(ability)
    ability:EndCooldown()
  end)
end

return M
