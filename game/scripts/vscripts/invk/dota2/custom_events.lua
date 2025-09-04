--- Custom events helpers.
--- @class invk.dota2.custom_events
local M = {}

--- @generic Args
--- @param cb fun(player: CBaseEntity?, ...: Args)
--- @return fun(ent_idx: EntityIndex, ...: Args)
local function create_handler(cb)
  --- @param playerEntIdx EntityIndex
  --- @param ... Args
  return function(playerEntIdx, ...)
    local player = EntIndexToHScript(playerEntIdx)

    cb(player, ...)
  end
end

--- Register a callback to be called when a particular custom event arrives.
--- @generic Args
--- @param event string # Event
--- @param cb fun(player: CBaseEntity?, ...: Args) # Callback
--- @return CustomGameEventListenerID # Listener id that can be used to unregister later
function M.subscribe(event, cb)
  return CustomGameEventManager:RegisterListener(event, create_handler(cb))
end

--- Unregister a given listener.
--- @param id CustomGameEventListenerID
function M.unsubscribe(id)
  return CustomGameEventManager:UnregisterListener(id)
end

--- Send event to all players.
--- @param event string # # Event name
--- @param payload? table # # Payload
function M.send_all(event, payload)
  CustomGameEventManager:Send_ServerToAllClients(event, payload or {})
end

--- Send event to player.
--- @param event string # Event name
--- @param player CDOTAPlayerController # Player
--- @param payload? table # Payload
function M.send_player(event, player, payload)
  CustomGameEventManager:Send_ServerToPlayer(player, event, payload or {})
end

--- Send event to team.
--- @param event string # Event name
--- @param team DOTATeam_t # Team id
--- @param payload? table # Payload
function M.send_team(event, team, payload)
  CustomGameEventManager:Send_ServerToTeam(team, event, payload or {})
end

return M
