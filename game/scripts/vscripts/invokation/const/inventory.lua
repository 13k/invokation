--- Inventory constants.
-- @module invokation.const.inventory
local m = require("moses")

local M = {}

--- Array of inventory slots indices.
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
M.STASH_SLOTS = {
  DOTA_STASH_SLOT_1,
  DOTA_STASH_SLOT_2,
  DOTA_STASH_SLOT_3,
  DOTA_STASH_SLOT_4,
  DOTA_STASH_SLOT_5,
  DOTA_STASH_SLOT_6,
}

--- Array of neutral slots indices.
M.NEUTRAL_SLOTS = { DOTA_ITEM_NEUTRAL_SLOT }

--- Array of all non-neutral slots indices (union of @{INVENTORY_SLOTS} and @{STASH_SLOTS}).
M.NON_NEUTRAL_SLOTS = m.chain({}):append(M.INVENTORY_SLOTS):append(M.STASH_SLOTS):value()

--- Array of all slots indices (union of @{INVENTORY_SLOTS}, @{STASH_SLOTS} and @{NEUTRAL_SLOTS}).
M.SLOTS = m.chain({}):append(M.INVENTORY_SLOTS):append(M.STASH_SLOTS):append(M.NEUTRAL_SLOTS):value()

return M
