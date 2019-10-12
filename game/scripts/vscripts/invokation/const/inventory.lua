--- Inventory constants.
-- @module invokation.const.inventory

local tablex = require("pl.tablex")

local M = {}

--- List of inventory slots indices.
M.INVENTORY_SLOTS =
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

--- List of stash slots indices.
M.STASH_SLOTS =
  {
    DOTA_STASH_SLOT_1,
    DOTA_STASH_SLOT_2,
    DOTA_STASH_SLOT_3,
    DOTA_STASH_SLOT_4,
    DOTA_STASH_SLOT_5,
    DOTA_STASH_SLOT_6,
  }

--- List of all slots indices (union of @{INVENTORY_SLOTS} and @{STASH_SLOTS}).
M.SLOTS = {}

tablex.insertvalues(M.SLOTS, M.INVENTORY_SLOTS)
tablex.insertvalues(M.SLOTS, M.STASH_SLOTS)

return M