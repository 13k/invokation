--- List (integer-indexed table) helpers.
-- @module invokation.lang.list

local List = require("pl.List")

local M = {}

--- Returns the (simple) difference between two lists.
-- @tparam array a Left-side list
-- @tparam array b Right-side list
-- @treturn array A copy of `a` with all values in `b` removed.
function M.diff(a, b)
  local l = List.new(a)

  for _, v in ipairs(b) do
    l:remove_value(v)
  end

  return l
end

return M
