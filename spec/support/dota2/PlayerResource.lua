PlayerResource = {}

function PlayerResource:GetSteamAccountID(player_id)
  return player_id
end

function PlayerResource:GetSteamID(player_id)
  return player_id
end

function PlayerResource:ReplaceHeroWith(_player_id, _hero_name, _gold, _xp) end
function PlayerResource:ReplaceHeroWithNoTransfer(_player_id, _hero_name, _gold, _xp) end
