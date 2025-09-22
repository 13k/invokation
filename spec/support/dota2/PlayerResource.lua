--# selene: allow(incorrect_standard_library_use)

--- @class T.dota2.PlayerResource : CDOTA_PlayerResource
PlayerResource = {}

--- @diagnostic disable-next-line: unused
function PlayerResource:GetSteamAccountID(player_id)
  return player_id
end

--- @diagnostic disable-next-line: unused
function PlayerResource:GetSteamID(player_id)
  return player_id --[[@as Uint64]]
end

--- @diagnostic disable-next-line: unused
function PlayerResource:ReplaceHeroWith(_player_id, _hero_name, _gold, _xp) end

--- @diagnostic disable-next-line: unused
function PlayerResource:ReplaceHeroWithNoTransfer(_player_id, _hero_name, _gold, _xp) end
