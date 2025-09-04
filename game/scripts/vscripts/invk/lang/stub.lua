--- Stubs for stdlib modules not present in Dota's Lua VM.

-- selene: allow(global_usage)
if _G.io == nil then
  _G.io = {}
end

-- selene: allow(global_usage)
if _G.os == nil then
  _G.os = {}
end
