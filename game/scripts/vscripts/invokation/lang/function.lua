--- Function helpers.
-- @module invokation.lang.function

local M = {}

--- Binds a function to an instance, performing lookup by name.
-- @tparam table t Instance object
-- @tparam string name Method name
-- @treturn function Bound function
function M.bindbyname(t, name)
  return function(...)
    return t[name](t, ...)
  end
end

--- Creates a function to perform lookup by name.
-- @tparam table t Object
-- @tparam string name Method name
-- @treturn function Wrapped function
function M.lookupbyname(t, name)
  return function(...)
    return t[name](...)
  end
end

return M
