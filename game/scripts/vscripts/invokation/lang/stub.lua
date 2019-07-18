--- Stubs for stdlib modules not present in Dota's Lua VM.
-- @module invokation.lang.stub

if _G.io == nil then
  _G.io = {}
end

if _G.os == nil then
  _G.os = {}
end
