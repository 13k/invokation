local tbl = require("invk.lang.table")

--- Inventory constants.
--- @class invk.const.inventory
local M = {}

--- @enum invk.dota2.inventory.Section
M.Section = {
  INVENTORY = "inventory",
  STASH = "stash",
  NEUTRAL = "neutral",
}

--- Array of inventory slots indices.
--- @type DOTAScriptInventorySlot_t[]
M.INVENTORY_SLOTS = {
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

--- Array of stash slots indices.
--- @type DOTAScriptInventorySlot_t[]
M.STASH_SLOTS = {
  DOTA_STASH_SLOT_1,
  DOTA_STASH_SLOT_2,
  DOTA_STASH_SLOT_3,
  DOTA_STASH_SLOT_4,
  DOTA_STASH_SLOT_5,
  DOTA_STASH_SLOT_6,
}

--- Array of neutral slots indices.
--- @type DOTAScriptInventorySlot_t[]
M.NEUTRAL_SLOTS = {
  DOTA_ITEM_NEUTRAL_ACTIVE_SLOT,
  DOTA_ITEM_NEUTRAL_PASSIVE_SLOT,
}

--- Array of all non-neutral slots indices (union of [INVENTORY_SLOTS] and [STASH_SLOTS]).
--- @type DOTAScriptInventorySlot_t[]
M.NON_NEUTRAL_SLOTS = tbl.append(M.INVENTORY_SLOTS, M.STASH_SLOTS)

--- Array of all slots indices (union of [INVENTORY_SLOTS], [STASH_SLOTS] and [NEUTRAL_SLOTS]).
--- @type DOTAScriptInventorySlot_t[]
M.SLOTS = tbl.append(M.INVENTORY_SLOTS, M.STASH_SLOTS, M.NEUTRAL_SLOTS)

M.ALL_SECTIONS = { M.Section.INVENTORY, M.Section.STASH, M.Section.NEUTRAL }

--- @type { [invk.dota2.inventory.Section]: DOTAScriptInventorySlot_t[] }
M.SECTION_SLOTS = {
  [M.Section.INVENTORY] = M.INVENTORY_SLOTS,
  [M.Section.STASH] = M.STASH_SLOTS,
  [M.Section.NEUTRAL] = M.NEUTRAL_SLOTS,
}

return M
