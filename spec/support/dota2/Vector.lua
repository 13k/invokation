local class = require("pl.class")

Vector = class()

function Vector:_init(x, y, z)
  self.x = x
  self.y = y
  self.z = z
end
