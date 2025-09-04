--- Value helpers.
--- @class invk.lang.value
local M = {}

--- Returns the first non-nil value
--- @generic T
--- @param ... T
--- @return T - ?
function M.non_nil(...)
  for i = 1, select("#", ...) do
    local value = select(i, ...)

    if value ~= nil then
      return value
    end
  end

  return nil
end

return M
