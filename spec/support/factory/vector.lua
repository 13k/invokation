--- @alias F.vector.Attributes { [1]: number, [2]: number, [3]: number }

--- @param attributes F.vector.Attributes
--- @return Vector
return function(attributes)
  return Vector(unpack(attributes))
end
