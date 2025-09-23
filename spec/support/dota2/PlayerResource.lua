--# selene: allow(incorrect_standard_library_use)

local F = require("support.factory")

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
function PlayerResource:ReplaceHeroWith(_player_id, hero_name, _gold, _xp)
  return F.dota_hero({ name = hero_name })
end

function PlayerResource:ReplaceHeroWithNoTransfer(player_id, hero_name, gold, xp)
  return self:ReplaceHeroWith(player_id, hero_name, gold, xp)
end
