--- Random helpers.
-- @module invokation.lang.random

local M = {}

--- Seeds random generation with the current time.
-- @treturn int Seed number
function M.randomseed()
  local seed = Time()
  math.randomseed(seed)
  return seed
end

return M