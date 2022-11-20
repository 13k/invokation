local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
Vector = class()

function Vector:_init(x, y, z)
  self.x = x
  self.y = y
  self.z = z
end
