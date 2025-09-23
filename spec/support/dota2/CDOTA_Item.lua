local class = require("middleclass")

local CDOTABaseAbility = require("support.dota2.CDOTABaseAbility")

--- @class T.dota2.CDOTA_Item : T.dota2.CDOTABaseAbility, CDOTA_Item
--- @field slot DOTAScriptInventorySlot_t
--- @field purchaser T.dota2.CDOTA_BaseNPC_Hero
local CDOTA_Item = class("CDOTA_Item", CDOTABaseAbility)

--- @class T.dota2.CDOTA_Item.Attributes : T.dota2.CDOTABaseAbility.Attributes
--- @field slot? DOTAScriptInventorySlot_t
--- @field purchaser? T.dota2.CDOTA_BaseNPC_Hero

--- @param attributes T.dota2.CDOTA_Item.Attributes
function CDOTA_Item:initialize(attributes)
  CDOTABaseAbility.initialize(self, attributes)
end

function CDOTA_Item:GetItemSlot()
  return self.slot
end

function CDOTA_Item:GetPurchaser()
  return self.purchaser
end

return CDOTA_Item
