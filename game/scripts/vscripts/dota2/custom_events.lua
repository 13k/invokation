local M = {}

local tablex = require("pl.tablex")
local events = require("const.custom_events")

tablex.update(M, events)

--[[
  Register a callback to be called when a particular custom event arrives.
  Returns a listener ID that can be used to unregister later.

  (string eventName, func handler)
]]
function M.Subscribe(eventName, handler)
  return CustomGameEventManager:RegisterListener(eventName, handler)
end

--[[
  Unregister a given listener.

  (int listenerID)
]]
function M.Unsubscribe(listenerID)
  return CustomGameEventManager:UnregisterListener(listenerID)
end

--[[
  (Entity playerEnt, string eventName, table payload)
]]
function M.SendPlayer(playerEnt, eventName, payload)
  return CustomGameEventManager:Send_ServerToPlayer(playerEnt, eventName, payload or {})
end

--[[
  (string eventName, table payload)
]]
function M.SendAll(eventName, payload)
  return CustomGameEventManager:Send_ServerToAllClients(eventName, payload or {})
end

--[[
  (int teamNumber, string eventName, table payload)
]]
function M.SendTeam(teamNumber, eventName, payload)
  return CustomGameEventManager:Send_ServerToTeam(teamNumber, eventName, payload or {})
end

return M
