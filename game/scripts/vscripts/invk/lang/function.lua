local tbl = require("invk.lang.table")

--- Function helpers.
--- @class invk.lang.function
local M = {}

--- @generic Bound, Unbound, Ret
--- @param f fun(...: Bound, ...: Unbound): Ret...
--- @param ... Bound # Bound arguments
--- @return fun(...: Unbound): Ret...
function M.bind(f, ...)
  --- @type Bound[]
  local bound_args = { ... }

  --- @param ... Unbound
  --- @return Ret...
  return function(...)
    local args = tbl.append(bound_args, { ... })

    return f(table.unpack(args))
  end
end

--- @generic T
--- @return fun(left: T, right: T): boolean
function M.eq()
  --- @param left T
  --- @param right T
  --- @return boolean
  return function(left, right)
    return left == right
  end
end

--- @generic T
--- @param left T
--- @return fun(right: T): boolean
function M.is_eq(left)
  return M.bind(M.eq(), left)
end

--- @generic T, U
--- @return fun(left: T, right: U): (T | U)
function M.sum()
  --- @param left T
  --- @param right U
  --- @return T | U
  return function(left, right)
    return left + right
  end
end

--- Creates a wrapper function that performs method lookup by name on a table.
---
--- The created function will perform method lookup by name on the given table,
--- then call the method passing all parameters it received.
---
--- ```lua
--- local t = {}
--- function t.greet(name) return "Greetings, " .. name end
--- print(t.greet)
--- -- => function: 0x7fffc9367cc0
--- local fn = lookupbyname(t, "greet")
--- -- Equivalent to calling `t["greet"]("Alice")`
--- print(fn("Alice"))
--- -- => "Greetings, Alice"
--- -- t.greet() can be overridden and is still looked up by name:
--- function t.greet(name) return "Welcome, " .. name end
--- print(t.greet)
--- -- => function: 0x7fffc9367ef0
--- print(fn("Alice"))
--- -- => "Welcome, Alice"
--- ```
---
--- @param t table # Table object
--- @param name string # Method name
--- @return fun(...: any): any... # Wrapper function
function M.lookupbyname(t, name)
  return function(...)
    return t[name](...)
  end
end

--- @generic Args, T
--- @param class T | { new: (fun(self: T, ...: Args): T) }
--- @return fun(...: Args): T
function M.ctor(class)
  --- @param ... Args
  --- @return T
  return function(...)
    return class:new(...)
  end
end

return M
