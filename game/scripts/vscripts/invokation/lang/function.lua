--- Function helpers.
-- @module invokation.lang.function

local M = {}

--- Creates a wrapper function that performs method lookup by name on a table.
--
-- The created function will perform method lookup by name on the given table,
-- then call the method passing all parameters it received.
--
-- @tparam table t Table object
-- @tparam string name Method name
-- @treturn function Wrapper function
-- @usage
--   local t = {}
--   function t.greet(name) return "Greetings, " .. name end
--   print(t.greet)
--   -- => function: 0x7fffc9367cc0
--   local fn = lookupbyname(t, "greet")
--   -- Equivalent to calling `t["greet"]("Alice")`
--   print(fn("Alice"))
--   -- => "Greetings, Alice"
--   -- t.greet() can be overridden and is still looked up by name:
--   function t.greet(name) return "Welcome, " .. name end
--   print(t.greet)
--   -- => function: 0x7fffc9367ef0
--   print(fn("Alice"))
--   -- => "Welcome, Alice"
function M.lookupbyname(t, name)
  return function(...)
    return t[name](...)
  end
end

return M