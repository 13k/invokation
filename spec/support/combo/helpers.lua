local m = require("moses")

local M = {}

--- @param steps invk.combo.ComboStep[]
--- @return integer[]
function M.steps_ids(steps)
  return m.map(steps, function(s)
    return s.id
  end)
end

return M
