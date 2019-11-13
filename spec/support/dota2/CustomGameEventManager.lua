CustomGameEventManager = {}

function CustomGameEventManager:RegisterListener(event, callback)
end

function CustomGameEventManager:UnregisterListener(listenerId)
end

function CustomGameEventManager:Send_ServerToAllClients(event, payload)
end

function CustomGameEventManager:Send_ServerToPlayer(player, event, payload)
end

function CustomGameEventManager:Send_ServerToTeam(team, event, payload)
end
