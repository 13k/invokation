local module = {}

local tablex = require('pl.tablex')

function module.slice(t, ...)
  local result = {}

  for i = 1,select('#', ...) do
    local key = select(i, ...)
    result[key] = t[key]
  end

  return result
end

function module.except(t, ...)
  local result = tablex.copy(t)

  for i = 1,select('#', ...) do
    local key = select(i, ...)
    result[key] = nil
  end

  return result
end

function module.tolist(t)
  local result = {}

  for k, v in pairs(t) do
    local i = tonumber(k)
    assert(i ~= nil)
    result[i] = v
  end

  return result
end

return module