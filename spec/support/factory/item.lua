local Ability = require("invk.dota2.ability")

--- @param attributes support.dota2.CDOTA_Item_attributes
--- @return invk.dota2.Ability
return function(attributes)
  local F = require("support.factory")

  return Ability:new(F.dota_item(attributes))
end
