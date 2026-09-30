--# selene: allow(global_usage)

_G.S = tostring

--- Alias to [string.format] if values are given, otherwise returns `fmt`
--- @param fmt string
--- @param ... any
--- @return string
function F(fmt, ...)
  if select("#", ...) > 0 then
    return string.format(fmt, ...)
  else
    return fmt
  end
end

--- Single-value [assert] with string formatted message.
--- @generic T
--- @param expr T?
--- @param fmt string
--- @param ... any
--- @return T - ?
function assertf(expr, fmt, ...)
  -- single-value capture
  local value = assert(expr, F(fmt, ...))

  return value
end

--- [error] with string formatted message.
--- @param fmt string
--- @param ... any
function errorf(fmt, ...)
  error(F(fmt, ...), 2)
end

--- [print] with formatted string.
function printf(fmt, ...)
  print(F(fmt, ...))
end
