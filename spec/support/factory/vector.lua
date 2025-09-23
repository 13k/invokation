local Vector = require("support.dota2.Vector")

--- @alias F.vector.Attributes { [1]: number, [2]: number, [3]: number }

--- @param attributes F.vector.Attributes
--- @return T.dota2.Vector
return function(attributes)
  -- selene: allow(undefined_variable)
  return Vector:new(unpack(attributes))
end
