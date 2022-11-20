local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
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
