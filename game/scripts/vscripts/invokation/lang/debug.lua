--- Debugging helpers.
-- @module invokation.lang.debug
local M = {}

--- Toggles function call debugging.
function M.debugcalls()
  if not _G.__debugCalls then
    print("Starting DebugCalls")
    _G.__debugCalls = true

    debug.sethook(function()
      local info = debug.getinfo(2)
      local src = tostring(info.short_src)
      local name = tostring(info.name)
      if name ~= "__index" then
        print("Call: " .. src .. " -- " .. name .. " -- " .. info.currentline)
      end
    end, "c")
  else
    print("Stopped DebugCalls")
    _G.__debugCalls = false
    debug.sethook(nil, "c")
  end
end

return M
