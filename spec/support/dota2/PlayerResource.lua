-- selene: allow(incorrect_standard_library_use)
PlayerResource = {}

function PlayerResource:GetSteamAccountID(playerId)
  return playerId
end

function PlayerResource:GetSteamID(playerId)
  return playerId
end

function PlayerResource:ReplaceHeroWith(_playerId, _heroName, _gold, _xp) end
