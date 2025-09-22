local Ability = require("invk.dota2.ability")

--- @class F.item.Attributes : F.dota_item.Attributes

--- @param attributes F.item.Attributes
--- @return invk.dota2.Ability
return function(attributes)
  local F = require("support.factory")

  return Ability:new(F.dota_item(attributes))
end
