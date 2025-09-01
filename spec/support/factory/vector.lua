--- @alias support.factory.VectorAttributes { [1]: number, [2]: number, [3]: number }

--- @param attributes support.factory.VectorAttributes
--- @return Vector
return function(attributes)
  return Vector(unpack(attributes))
end
