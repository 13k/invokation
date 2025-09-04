--# selene: allow(global_usage)

_G.F = string.format
_G.S = tostring

--- Single-value [assert] with string formatted message.
--- @generic T
--- @param expr T?
--- @param fmt string
--- @param ... any
--- @return T - ?
function assertf(expr, fmt, ...)
  -- pin single-value return
  local value = assert(expr, F(fmt, ...))

  return value
end

--- [error] with string formatted message.
--- @param fmt string
--- @param ... any
function errorf(fmt, ...)
  error(F(fmt, ...), 2)
end
