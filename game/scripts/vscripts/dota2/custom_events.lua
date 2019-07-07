local M = {}

local tablex = require("pl.tablex")
local events = require("const.custom_events")

tablex.update(M, events)

local function createHandler(handler)
  return function(playerEntIdx, ...)
    local player = EntIndexToHScript(playerEntIdx)
    return handler(player, ...)
  end
end

--[[
  Register a callback to be called when a particular custom event arrives.
  Returns a listener ID that can be used to unregister later.

  (string eventName, func handler)
]]
function M.Subscribe(eventName, handler)
  return CustomGameEventManager:RegisterListener(eventName, createHandler(handler))
end

--[[
  Unregister a given listener.

  (int listenerId)
]]
function M.Unsubscribe(listenerId)
  return CustomGameEventManager:UnregisterListener(listenerId)
end

--[[
  (Entity player, string event, table payload)
]]
function M.SendPlayer(player, event, payload)
  return CustomGameEventManager:Send_ServerToPlayer(player, event, payload or {})
end

--[[
  (string event, table payload)
]]
function M.SendAll(event, payload)
  return CustomGameEventManager:Send_ServerToAllClients(event, payload or {})
end

--[[
  (int team, string event, table payload)
]]
function M.SendTeam(team, event, payload)
  return CustomGameEventManager:Send_ServerToTeam(team, event, payload or {})
end

return M
