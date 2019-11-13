local Factory = require("support.factory")
local m = require("moses")

Factory.define("vector", function(attributes)
  local coordinates

  if m.isArray(attributes) then
    coordinates = attributes
  else
    coordinates = { attributes.x, attributes.y, attributes.z }
  end

  return Vector(unpack(coordinates))
end)
