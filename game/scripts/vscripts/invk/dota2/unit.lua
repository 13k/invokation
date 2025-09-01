local class = require("middleclass")

local INVENTORY = require("invk.const.inventory")
local LIMITS = require("invk.const.limits")
local tbl = require("invk.lang.table")
local val = require("invk.lang.value")

--- Unit class.
--- @class invk.dota2.Unit : middleclass.Class
--- @field entity CDOTA_BaseNPC
--- @field name string
--- @field is_hero boolean
local M = class("invk.dota2.Unit")

local ERRF_UNIT_NO_INVENTORY = "Unit '%s' does not have an inventory"
local ERRF_UNIT_CANNOT_RESPAWN = "Unit '%s' cannot respawn"

--- Constructor.
--- @param entity CDOTA_BaseNPC # Unit entity
function M:initialize(entity)
  self.entity = entity
  self.name = self.entity:GetUnitName()
  self.is_hero = self.entity:IsHero()
end

--- @return CDOTA_BaseNPC_Hero
function M:require_hero()
  assert(self.is_hero, "expected hero unit")

  --- @cast self.entity CDOTA_BaseNPC_Hero
  return self.entity
end

--- @class invk.dota2.unit.RespawnOptions
--- @field buyback? boolean # Is buyback respawn? (default: `false`)
--- @field penalty? boolean # Apply respawn penalty? (default: `false`)

--- Respawns the unit.
---
--- If the unit is a hero, uses [CDOTA_BaseNPC_Hero:RespawnHero] with given
--- options, otherwise uses [CDOTA_BaseNPC:RespawnUnit].
--- @param options? invk.dota2.unit.RespawnOptions # Options table (default: `{}`)
function M:respawn(options)
  if not self.entity:UnitCanRespawn() then
    errorf(ERRF_UNIT_CANNOT_RESPAWN, self.name)
  end

  local opts = options or {}
  local buyback = val.non_nil(opts.buyback, false)
  local penalty = val.non_nil(opts.penalty, false)

  if self.is_hero then
    --- @cast self.entity CDOTA_BaseNPC_Hero
    return self.entity:RespawnHero(buyback, penalty)
  end

  return self.entity:RespawnUnit()
end

--- @class invk.dota2.unit.PurgeOptions
--- @field buffs? boolean # Remove positive buffs (default: `true`)
--- @field debuffs? boolean # Remove negative buffs (default: `true`)
--- @field stuns? boolean # Remove stuns (default: `true`)
--- @field exceptions? boolean # Remove exceptions (default: `true`)
--- @field frame_only? boolean # Remove buffs created this frame only (default: `false`)

--- Purges the unit.
--- @param options? invk.dota2.unit.PurgeOptions # Options table (default: `{}`)
function M:purge(options)
  local opts = options or {}
  local buffs = val.non_nil(opts.buffs, true)
  local debuffs = val.non_nil(opts.debuffs, true)
  local stuns = val.non_nil(opts.stuns, true)
  local exceptions = val.non_nil(opts.exceptions, true)
  local frame_only = val.non_nil(opts.frame_only, false)

  return self.entity:Purge(buffs, debuffs, frame_only, stuns, exceptions)
end

--- @class invk.dota.unit.HeroLevelUpOptions
--- @field play_effects? boolean # Play level up effects (default: `false`)

--- Levels up the hero unit.
--- @param level integer # Target level (if current level is higher, does nothing)
--- @param options? invk.dota.unit.HeroLevelUpOptions # Options table (default: `{}`)
function M:hero_level_up_to(level, options)
  local hero = self:require_hero()
  local opts = options or {}
  local play_effects = val.non_nil(opts.play_effects, false)

  if level > LIMITS.MAX_HERO_LEVEL then
    level = LIMITS.MAX_HERO_LEVEL
  end

  while hero:GetLevel() < level do
    hero:HeroLevelUp(play_effects)
  end
end

--- Heals the unit to the maximum health.
--- @param heal_source? CBaseEntity # Heal source entity
function M:give_max_health(heal_source)
  return self.entity:Heal(self.entity:GetMaxHealth(), heal_source)
end

--- Gives the unit maximum mana.
function M:give_max_mana()
  return self.entity:GiveMana(self.entity:GetMaxMana())
end

--- @class invk.dota2.unit.GiveGoldOptions
--- @field reliable? boolean # Is this gold reliable? (default: `true`)
--- @field reason? EDOTA_ModifyGold_Reason # Reason flags (default: `DOTA_ModifyGold_Unspecified`)

--- Gives the hero unit a gold amount.
--- @param amount integer # Gold amount (can be negative)
--- @param options? invk.dota2.unit.GiveGoldOptions # Options table
function M:give_gold(amount, options)
  local hero = self:require_hero()
  local opts = options or {}
  local reliable = val.non_nil(opts.reliable, true)
  local reason = val.non_nil(opts.reason, DOTA_ModifyGold_Unspecified)

  return hero:ModifyGold(amount, reliable, reason)
end

--- @class invk.dota2.unit.ForEachItemOptions
--- @field sections? invk.dota2.inventory.Section[] # Array of inventory sections to scan (default: `{}`)

--- Iterates over the unit's inventory, yielding each non-nil item.
--- @param f (fun(item: CDOTA_Item): (boolean?, any...)) # Iterator function
--- @param options? invk.dota2.unit.ForEachItemOptions # Options table (default: `{}`)
--- @return any...
function M:for_each_item(f, options)
  if not self.entity:HasInventory() then
    errorf(ERRF_UNIT_NO_INVENTORY, self.name)
  end

  local opts = options or {}
  --- @type invk.dota2.inventory.Section[]
  local sections = opts.sections or INVENTORY.ALL_SECTIONS
  --- @type DOTAScriptInventorySlot_t[]
  local slots = {}

  for _, section in ipairs(sections) do
    slots = tbl.append(slots, INVENTORY.SECTION_SLOTS[section])
  end

  for _, slot in ipairs(slots) do
    local item = self.entity:GetItemInSlot(slot)

    if item then
      local ret = { f(item) }
      local continue = true

      if ret[1] ~= nil then
        continue = ret[1]
        table.remove(ret, 1)
      end

      if not continue then
        return unpack(ret)
      end
    end
  end

  return nil
end

--- @class invk.dota2.unit.ItemNamesOptions : invk.dota2.unit.ForEachItemOptions
--- @field sort? boolean # Sorts the resulting array. (default: `false`)

--- Returns an array of names of all items in the unit's inventory.
--- @param options? invk.dota2.unit.ItemNamesOptions # Accepts the same options as @{ForEachItem} (default: `{}`)
--- @return string[] # Array of item names
function M:item_names(options)
  local names = {}
  local opts = options or {}

  self:for_each_item(function(item)
    names[#names + 1] = item:GetAbilityName()
  end, opts)

  if opts.sort then
    table.sort(names)
  end

  return names
end

--- @class invk.dota2.unit.AddItemsByNameOptions
--- @field only_missing? boolean # Only add missing items (the diff between the inventory and the array) (default: `false`)

--- Add items with given names.
--- @param items string[] # Array of item names
--- @param options? invk.dota2.unit.AddItemsByNameOptions # Options table (default: `{}`)
--- @return CDOTA_Item[] # Array of added item entities
function M:add_items_by_name(items, options)
  if not self.entity:HasInventory() then
    errorf(ERRF_UNIT_NO_INVENTORY, self.name)
  end

  local opts = options or {}

  if opts.only_missing then
    items = tbl.diff(items, self:item_names())
  end

  return tbl.map(items, function(name)
    return self.entity:AddItemByName(name)
  end)
end

--- Finds item by name in inventory.
--- @param name string # Item name
--- @param options? invk.dota2.unit.ForEachItemOptions
--- @return CDOTA_Item? # Item if found, `nil` otherwise
function M:find_item_in_inventory(name, options)
  return self:for_each_item(function(item)
    if item:GetAbilityName() == name then
      return false, item
    end
  end, options)
end

--- @class invk.dota2.unit.RemoveItemsOptions : invk.dota2.unit.ForEachItemOptions
--- @field endCooldown? boolean # Reset item cooldowns before removing (default: `false`)

--- Removes all items.
--- @param options? invk.dota2.unit.RemoveItemsOptions
--- @return CDOTA_Item[] # An array of removed items
function M:remove_items(options)
  local opts = options or {}
  --- @type CDOTA_Item[]
  local removed = {}

  self:for_each_item(function(item)
    if opts.endCooldown then
      item:EndCooldown()
    end

    self.entity:RemoveItem(item)

    removed[#removed + 1] = item
  end, opts)

  return removed
end

--- Clears all items cooldowns.
--- @param options? invk.dota2.unit.ForEachItemOptions
function M:end_item_cooldowns(options)
  self:for_each_item(function(item)
    item:EndCooldown()
  end, options)
end

--- Removes all dropped items owned by this unit.
--- @return CDOTA_Item[] # An array of removed items
function M:remove_dropped_items()
  --- @type CDOTA_Item[]
  local removed = {}

  for i = 0, GameRules:NumDroppedItems() - 1 do
    local ent = GameRules:GetDroppedItem(i)

    if ent then
      ---- @type CDOTA_Item
      -- local item = EntityFramework:CreateEntity("CDOTA_Item", ent)
      local item = EntIndexToHScript(ent:GetEntityIndex()) --[[@as CDOTA_Item]]
      local purchaser = item:GetPurchaser()
      local ent_idx = purchaser and purchaser:GetEntityIndex()

      if ent_idx == self.entity:GetEntityIndex() then
        item:RemoveSelf()

        removed[#removed + 1] = item
      end
    end
  end

  return removed
end

--- Finds ability or item by name.
--- @param name string # Ability or item name
--- @return invk.dota2.AbilityOrItem? # Ability or item entity if found
function M:find_ability_or_item(name)
  if self.entity:HasAbility(name) then
    return self.entity:FindAbilityByName(name)
  end

  if self.entity:HasInventory() and self.entity:HasItemInInventory(name) then
    return self:find_item_in_inventory(name)
  end

  return nil
end

--- Iterates over the unit's abilities, yielding each non-nil ability.
--- @generic Ret
--- @param f fun(ability: CDOTABaseAbility): (boolean?, Ret...)
function M:for_each_ability(f)
  for i = 0, self.entity:GetAbilityCount() - 1 do
    local ability = self.entity:GetAbilityByIndex(i)

    if ability ~= nil then
      local ret = { f(ability) }
      local continue = true

      if ret[1] ~= nil then
        continue = ret[1]
        table.remove(ret, 1)
      end

      if not continue then
        return unpack(ret)
      end
    end
  end

  return nil
end

--- Clears all abilities cooldowns.
function M:end_ability_cooldowns()
  self:for_each_ability(function(ability)
    ability:EndCooldown()
  end)
end

----------------------------------------------------------------------------------------------------

--- @return integer
function M:get_level()
  return self.entity:GetLevel()
end

function M:hold()
  self.entity:Hold()
end

--- @param name string
function M:stop_sound(name)
  self.entity:StopSound(name)
end

--- @param points integer
function M:set_ability_points(points)
  local hero = self:require_hero()

  hero:SetAbilityPoints(points)
end

return M
