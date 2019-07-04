local module = {}

function module.randomseed()
  math.randomseed(Time())
end

return module