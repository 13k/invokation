local class = require("pl.class")

local CDOTABaseAbility = require("support.dota2.CDOTABaseAbility")

--- @class support.dota2.CDOTA_Item : support.dota2.CDOTABaseAbility, CDOTA_Item
--- @field slot DOTAScriptInventorySlot_t
--- @field purchaser support.dota2.CDOTA_BaseNPC_Hero
local CDOTA_Item = class(CDOTABaseAbility)

--- @class support.dota2.CDOTA_Item_attributes : support.dota2.CDOTABaseAbility_attributes
--- @field slot? DOTAScriptInventorySlot_t
--- @field purchaser? support.dota2.CDOTA_BaseNPC_Hero

--- @param attributes support.dota2.CDOTA_Item_attributes
function CDOTA_Item:_init(attributes)
  self:super(attributes)
end

function CDOTA_Item:GetItemSlot()
  return self.slot
end

function CDOTA_Item:GetPurchaser()
  return self.purchaser
end

return CDOTA_Item
