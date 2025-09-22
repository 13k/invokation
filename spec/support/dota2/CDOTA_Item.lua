local class = require("pl.class")

local CDOTABaseAbility = require("support.dota2.CDOTABaseAbility")

--- @class T.dota2.CDOTA_Item : T.dota2.CDOTABaseAbility, CDOTA_Item
--- @field slot DOTAScriptInventorySlot_t
--- @field purchaser T.dota2.CDOTA_BaseNPC_Hero
local CDOTA_Item = class(CDOTABaseAbility)

--- @class T.dota2.CDOTA_Item.Attributes : T.dota2.CDOTABaseAbility.Attributes
--- @field slot? DOTAScriptInventorySlot_t
--- @field purchaser? T.dota2.CDOTA_BaseNPC_Hero

--- @param attributes T.dota2.CDOTA_Item.Attributes
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
