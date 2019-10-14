--- Random helpers.
-- @module invokation.lang.random

local M = {}

--- Seeds random generation.
-- @tparam[opt=Time()] int seed Seed value
-- @treturn int Seed number
function M.seed(seed)
  seed = seed or Time()
  math.randomseed(seed)
  return seed
end

return M
