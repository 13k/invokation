local M = { definitions = {} }

local ERRF_NOT_DEFINED = "Factory %q not defined"

function M.define(name, definition)
  M.definitions[name] = definition
end

function M.create(name, ...)
  local factory = M.definitions[name]

  if factory == nil then
    error(ERRF_NOT_DEFINED:format(name))
  end

  return factory(...)
end

return M
