local Unit = require("invk.dota2.unit")

--- @class F.unit.Attributes : F.dota_unit.Attributes

--- @param attributes F.unit.Attributes
--- @return invk.dota2.Unit
return function(attributes)
  local F = require("support.factory")

  return Unit:new(F.dota_unit(attributes))
end
