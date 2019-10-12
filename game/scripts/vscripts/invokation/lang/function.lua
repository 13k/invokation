--- Function helpers.
-- @module invokation.lang.function

local M = {}

local func = require("pl.func")

--- Creates a function bound to an instance.
--
-- The created function will call the method passing the instance as the first
-- parameter along with all parameters it received.
--
-- @tparam table t Instance object
-- @tparam function fn Instance method
-- @treturn function Bound function
-- @usage
--   local t = { greeting = "Greetings, %s!", welcome = "Welcome, %s!" }
--   function t:greet(name) return self.greeting:format(name) end
--   print(t.greet)
--   -- => function: 0x7fffc9367cc0
--   local fn = bind(t, t.greet)
--   -- Equivalent to calling `t.greet(t, "Alice")` (or `t:greet("Alice")`)
--   print(fn("Alice"))
--   -- => "Greetings, Alice!"
--   -- If t.greet() is overridden, the bound function still calls the old method:
--   function t:greet(name) return self.welcome:format(name) end
--   print(t.greet)
--   -- => function: 0x7fffc9367ef0
--   print(fn("Alice"))
--   -- => "Greetings, Alice!"
function M.bind(t, fn)
  return func.bind1(fn, t)
end

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