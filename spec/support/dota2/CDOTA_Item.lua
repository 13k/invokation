local class = require("pl.class")

CDOTA_Item = class(CDOTABaseAbility)

function CDOTA_Item:_init(attributes)
  self:super(attributes or {})
end

function CDOTA_Item:GetItemSlot()
  return self.slot
end

function CDOTA_Item:GetPurchaser()
  return self.purchaser
end
