local class = require("pl.class")

CDOTA_Item = class(CDOTABaseAbility)

function CDOTA_Item:_init(attributes)
  self:super(attributes)
end

function CDOTA_Item:GetPurchaser()
  return self.purchaser
end
