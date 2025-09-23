--# selene: allow(unscoped_variables)

local class = require("middleclass")

--- @class T.dota2.Vector : middleclass.Class, Vector
Vector = class("Vector")

--- @param x number
--- @param y number
--- @param z number
function Vector:initialize(x, y, z)
  self.x = x
  self.y = y
  self.z = z
end

return Vector
