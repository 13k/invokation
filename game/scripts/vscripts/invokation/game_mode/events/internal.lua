--- Internal Game Events Listeners
-- @submodule invokation.GameMode
local S = require("invokation.const.settings")

local WARNF_MISSING_TEAM_COLOR =
  "Attempted to set custom player color for player %d and team %d, but the team color is not configured."

--- Internal Game Events Listeners
-- @section internal_game_events

--- Called when the overall game state has changed.
-- @tparam table payload
function GameMode:_OnGameRulesStateChange(payload)
  if GameMode._reentrantCheck then
    return
  end

  local state = GameRules:State_Get()

  GameMode._reentrantCheck = true
  self:OnGameRulesStateChange(state, payload)
  GameMode._reentrantCheck = false

  if state == DOTA_GAMERULES_STATE_HERO_SELECTION then
    self:PostLoadPrecache()
    self:OnAllPlayersLoaded()

    if S.USE_CUSTOM_TEAM_COLORS_FOR_PLAYERS then
      for i = 0, DOTA_DEFAULT_MAX_TEAM_PLAYERS do
        if PlayerResource:IsValidPlayer(i) then
          local team = PlayerResource:GetTeam(i)
          local color = S.TEAM_COLORS[team]

          if color ~= nil then
            PlayerResource:SetCustomPlayerColor(i, color[1], color[2], color[3])
          else
            self:warnf(WARNF_MISSING_TEAM_COLOR, i, team)
          end
        end
      end
    end
  elseif state == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
    self:OnGameInProgress()
  end
end

--- Called once when the player fully connects and becomes "Ready" during loading.
-- @tparam table payload
-- @tparam int payload.PlayerID Player id
-- @tparam int payload.userid User id
function GameMode:_OnConnectFull(payload)
  self:d("_OnConnectFull", { payload = payload })

  if GameMode._reentrantCheck then
    return
  end

  local player = PlayerResource:GetPlayer(payload.PlayerID)

  GameMode._reentrantCheck = true
  self:OnConnectFull(player, payload.userid)
  GameMode._reentrantCheck = false

  if not self.firstPlayerLoaded then
    self.firstPlayerLoaded = true
    self:OnFirstPlayerLoaded()
  end
end

--- Called when an NPC has spawned somewhere in game, including heroes.
-- @tparam table payload
-- @tparam int payload.entindex Unit entity index
function GameMode:_OnNPCSpawned(payload)
  self:d("_OnNPCSpawned", { payload = payload })

  if GameMode._reentrantCheck then
    return
  end

  local npc = EntIndexToHScript(payload.entindex) --[[@as CDOTA_BaseNPC]]

  if npc and npc:IsRealHero() and not self.firstSpawned then
    self.firstSpawned = true
    self:OnHeroInGame(npc)
  end
end

--- Called when an entity was killed.
-- @tparam table payload
-- @tparam int payload.entindex_killed Victim (unit) entity index
-- @tparam[opt] int payload.entindex_attacker Attacker (unit) entity index
-- @tparam[opt] int payload.entindex_inflictor Inflictor (item, ability, etc) entity index
function GameMode:_OnEntityKilled(payload)
  self:d("_OnEntityKilled", { payload = payload })

  if GameMode._reentrantCheck then
    return
  end

  local killed = EntIndexToHScript(payload.entindex_killed)
  local attacker = nil
  local inflictor = nil

  if payload.entindex_attacker ~= nil then
    attacker = EntIndexToHScript(payload.entindex_attacker)
  end

  if payload.entindex_inflictor ~= nil then
    inflictor = EntIndexToHScript(payload.entindex_inflictor)
  end

  GameMode._reentrantCheck = true
  self:OnEntityKilled(killed, attacker, inflictor)
  GameMode._reentrantCheck = false
end
