--# selene: allow(incorrect_standard_library_use)

--- @class T.dota2.CustomGameEventManager : CCustomGameEventManager
CustomGameEventManager = {}

--- @diagnostic disable-next-line: unused
function CustomGameEventManager:RegisterListener(_event, _callback)
  return -1
end

--- @diagnostic disable-next-line: unused
function CustomGameEventManager:UnregisterListener(_listenerId) end
--- @diagnostic disable-next-line: unused
function CustomGameEventManager:Send_ServerToAllClients(_event, _payload) end
--- @diagnostic disable-next-line: unused
function CustomGameEventManager:Send_ServerToPlayer(_player, _event, _payload) end
--- @diagnostic disable-next-line: unused
function CustomGameEventManager:Send_ServerToTeam(_team, _event, _payload) end
