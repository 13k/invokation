-- selene: allow(incorrect_standard_library_use)
CustomGameEventManager = {}

function CustomGameEventManager:RegisterListener(_event, _callback) end
function CustomGameEventManager:UnregisterListener(_listenerId) end
function CustomGameEventManager:Send_ServerToAllClients(_event, _payload) end
function CustomGameEventManager:Send_ServerToPlayer(_player, _event, _payload) end
function CustomGameEventManager:Send_ServerToTeam(_team, _event, _payload) end
