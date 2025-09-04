local inspect = require("inspect")

local M = {}

--- @param name string
function M.dump(name)
  -- selene: allow(global_usage)
  local value = _G

  for segment in name:gmatch("([^.]+)%.?") do
    value = value[segment]
  end

  local ty = type(value)
  local repr = inspect(value)

  print(F("%q (%s): %s", name, ty, repr))

  if ty == "function" then
    local info = debug.getinfo(value)

    print(F("source: %s:%d", info.source, info.linedefined))
  end
end

--- @param pattern string
function M.find(pattern)
  local matches = {}

  -- selene: allow(global_usage)
  for name, _ in pairs(_G) do
    if name:match(pattern) then
      table.insert(matches, name)
    end
  end

  table.sort(matches)

  print(F("Globals matching pattern %q:", pattern))

  for _, match in ipairs(matches) do
    print(F(" * %s", match))
  end

  print("---")
end

return M
