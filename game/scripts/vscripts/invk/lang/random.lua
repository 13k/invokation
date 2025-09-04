--- Random helpers.
--- @class invk.lang.random
local M = {}

--- Seeds random generation.
--- @param seed? integer # Seed value (default: `Time()`)
--- @return integer # Seed number
function M.seed(seed)
  seed = seed or (
      Time() --[[@as integer]]
    )

  math.randomseed(seed)

  return seed
end

return M
