--# selene: allow(unscoped_variables)

local class = require("pl.class")

--- @class T.dota2.Vector : Vector
Vector = class()

--- @param x number
--- @param y number
--- @param z number
function Vector:_init(x, y, z)
  self.x = x
  self.y = y
  self.z = z
end
