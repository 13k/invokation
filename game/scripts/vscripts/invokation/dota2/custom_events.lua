--- Custom events helpers.
-- @module invokation.dota2.custom_events

local tablex = require("pl.tablex")

local EVENTS = require("invokation.const.custom_events")

local M = {}

tablex.update(M, EVENTS)

local function createHandler(callback)
  return function(playerEntIdx, ...)
    local player = EntIndexToHScript(playerEntIdx)
    return callback(player, ...)
  end
end

--- Register a callback to be called when a particular custom event arrives.
-- @tparam string event
-- @tparam function callback
-- @treturn int Listener id that can be used to unregister later
function M.Subscribe(event, callback)
  return CustomGameEventManager:RegisterListener(event, createHandler(callback))
end

--- Unregister a given listener.
-- @tparam int listenerId
function M.Unsubscribe(listenerId)
  return CustomGameEventManager:UnregisterListener(listenerId)
end

--- Send event to all players.
-- @tparam string event
-- @tparam table payload
function M.SendAll(event, payload)
  return CustomGameEventManager:Send_ServerToAllClients(event, payload or {})
end

--- Send event to player.
-- @tparam string event
-- @tparam CDOTAPlayer player
-- @tparam table payload
function M.SendPlayer(event, player, payload)
  return CustomGameEventManager:Send_ServerToPlayer(player, event, payload or {})
end

--- Send event to team.
-- @tparam string event
-- @tparam int team
-- @tparam table payload
function M.SendTeam(event, team, payload)
  return CustomGameEventManager:Send_ServerToTeam(team, event, payload or {})
end

return M