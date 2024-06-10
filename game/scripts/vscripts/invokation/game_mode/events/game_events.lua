--- Game Events Listeners
-- @submodule invokation.GameMode
local Ability = require("invokation.dota2.Ability")
local CustomEvents = require("invokation.dota2.custom_events")
local DamageInstance = require("invokation.dota2.DamageInstance")
local Unit = require("invokation.dota2.Unit")

local ERRF_ABILITY_OR_ITEM_NOT_FOUND = "Could not find ability or item named '%q' on unit '%s'"

--- Game Events Listeners
-- @section game_events

--- The overall game state has changeds.
-- @tparam string state
-- @tparam table payload
function GameMode:OnGameRulesStateChange(state, payload)
  self:d("OnGameRulesStateChange", { state = state, payload = payload })
end

--- Called once when the player fully connects and becomes "Ready" during
-- loading.
-- @tparam CDOTAPlayer player
function GameMode:OnConnectFull(player, user_id)
  self:d("OnConnectFull", { player = player:GetPlayerID() })

  self.users[user_id] = player
  self.players[player:GetPlayerID()] = player
end

--- Called once and only once as soon as the first player (almost certain to be
-- the server in local lobbies) loads in.
--
-- It can be used to initialize state that isn't initializeable in @{Activate}
-- but needs to be done before everyone loads in.
function GameMode:OnFirstPlayerLoaded()
  self:d("OnFirstPlayerLoaded")
end

--- Called once and only once after all players have loaded into the game,
-- right as the hero selection time begins.
--
-- It can be used to initialize non-hero player state or adjust the hero
-- selection (i.e. force random etc)
function GameMode:OnAllPlayersLoaded()
  self:d("OnAllPlayersLoaded")
end

--- Called once and only once for every player when they spawn into the game
-- for the first time.
--
-- It is also called if the player's hero is replaced with a new hero for any
-- reason. This function is useful for initializing heroes, such as adding
-- levels, changing the starting gold, removing/adding abilities, adding
-- physics, etc.
--
-- @tparam CDOTA_BaseNPC_Hero hero
function GameMode:OnHeroInGame(hero)
  self:d("OnHeroInGame", { hero = hero:GetUnitName() })

  local player_id = hero:GetPlayerID()
  local player = PlayerResource:GetPlayer(player_id)
  local payload = {
    id = hero:GetHeroID(),
    name = hero:GetUnitName(),
    variant = hero:GetHeroFacetID(),
  }

  CustomEvents.SendPlayer(CustomEvents.EVENT_PLAYER_HERO_IN_GAME, player, payload)
end

--- Called once and only once when the game completely begins (about 0:00 on the clock).
function GameMode:OnGameInProgress()
  self:d("OnGameInProgress")
end

--- An entity has been hurt.
-- @tparam table payload
-- @tparam number payload.damage Damage amount
-- @tparam int payload.entindex_killed Victim (unit) entity index
-- @tparam[opt] int payload.entindex_attacker Attacker (unit) entity index
-- @tparam[opt] int payload.entindex_inflictor Inflictor (item, ability, etc) entity index
function GameMode:OnEntityHurt(payload)
  self:d("OnEntityHurt", { payload = payload })

  local victim = Unit(EntIndexToHScript(payload.entindex_killed))

  local attacker
  if payload.entindex_attacker ~= nil then
    attacker = Unit(EntIndexToHScript(payload.entindex_attacker))
  end

  local inflictor
  -- FIXME: This is a hack to fix an issue when an entity is killed with `ForceKill`,
  -- FIXME: which will trigger this event. I'm not sure which enum `damagebits` is using,
  -- FIXME: but regular damage seems to always set it to 0 while `ForceKill` sets it to 4096
  if payload.entindex_inflictor ~= nil and payload.damagebits == 0 then
    inflictor = Ability(EntIndexToHScript(payload.entindex_inflictor))
  end

  local damage = DamageInstance(victim, payload.damage, attacker, inflictor)

  self.combos:OnEntityHurt(damage)
end

--- An item was purchased by a player.
-- @tparam table payload
-- @tparam int payload.PlayerID Player id
-- @tparam string payload.itemname Item name
-- @tparam number payload.itemcost Item cost
function GameMode:OnItemPurchased(payload)
  self:d("OnItemPurchased", { payload = payload })

  local player = PlayerResource:GetPlayer(payload.PlayerID)

  self.combos:OnItemPurchased(player, { item = payload.itemname, cost = payload.itemcost })
end

--- Called whenever an ability begins its PhaseStart phase (but before it is actually cast).
-- @tparam table payload
-- @tparam int payload.PlayerID Player id
-- @tparam string payload.abilityname Ability name
function GameMode:OnAbilityCastBegins(payload)
  self:d("OnAbilityCastBegins", { payload = payload })
end

--- An ability was used by a player (including items).
-- @tparam table payload
-- @tparam int payload.PlayerID Player id
-- @tparam int payload.caster_entindex Caster (unit) entity index
-- @tparam string payload.abilityname Ability name
function GameMode:OnAbilityUsed(payload)
  self:d("OnAbilityUsed", { payload = payload })

  local player = PlayerResource:GetPlayer(payload.PlayerID)
  local caster = Unit(EntIndexToHScript(payload.caster_entindex))
  local abilityEnt = caster:FindAbilityOrItem(payload.abilityname)

  if abilityEnt == nil then
    local err = ERRF_ABILITY_OR_ITEM_NOT_FOUND:format(payload.abilityname, caster.name)
    error(err)
  end

  local ability = Ability(abilityEnt)

  self.combos:OnAbilityUsed(player, caster, ability)
end

--- A non-player entity (necro-book, chen creep, etc) used an ability.
-- @tparam table payload
-- @tparam int payload.caster_entindex Caster (unit) entity index
-- @tparam string payload.abilityname Ability name
function GameMode:OnNonPlayerUsedAbility(payload)
  self:d("OnNonPlayerUsedAbility", { payload = payload })
end

--- A channelled ability finished by either completing or being interrupted.
-- @tparam table payload
-- @tparam string payload.abilityname Ability name
-- @tparam int payload.interrupted `1` if ability was interrupted
function GameMode:OnAbilityChannelFinished(payload)
  self:d("OnAbilityChannelFinished", { payload = payload })
end

--- An entity died.
-- @tparam CDOTA_BaseNPC killed Killed unit
-- @tparam[opt] CDOTA_BaseNPC attacker Attacker unit
-- @tparam[opt] CDOTABaseAbility inflictor Inflictor ability
function GameMode:OnEntityKilled(killed, attacker, inflictor)
  self:d("OnEntityKilled", {
    killed = killed:GetName(),
    attacker = attacker and attacker:GetName(),
    inflictor = inflictor and inflictor:GetName(),
  })
end
