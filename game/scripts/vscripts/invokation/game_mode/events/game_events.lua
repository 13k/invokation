--- Game Events Listeners
-- @submodule invokation.GameMode

--- Game Events Listeners
-- @section game_events

local Unit = require("invokation.dota2.Unit")
local Ability = require("invokation.dota2.Ability")
local DamageInstance = require("invokation.dota2.DamageInstance")

local ABILITY_OR_ITEM_NOT_FOUND_ERROR = "Could not find ability or item named '%q' on unit '%s'"

--- The overall game state has changed.
function GameMode:OnGameRulesStateChange(payload)
  local state = GameRules:State_Get()
  self:d("OnGameRulesStateChange", state, payload)
end

--- Called 1 to 2 times as the player connects initially but before they have
-- completely connected.
--
-- @tparam table payload
function GameMode:OnPlayerConnect(payload)
  self:d("OnPlayerConnect", payload)
end

--- Called once when the player fully connects and becomes "Ready" during
-- loading.
-- @tparam CDOTAPlayer player
function GameMode:OnConnectFull(player)
  self:d("OnConnectFull", player:GetPlayerID())
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

--- Cleanup a player when they leave.
-- @tparam table payload
-- @tparam string payload.name
-- @tparam int payload.networkid
-- @tparam string payload.reason
-- @tparam int payload.userid
function GameMode:OnDisconnect(payload)
  self:d("OnDisconnect", payload)
end

--- A player has reconnected to the game.
--
-- This function can be used to repaint player-based particles or change state
-- as necessary.
--
-- @tparam table payload
function GameMode:OnPlayerReconnect(payload)
  self:d("OnPlayerReconnect", payload)
end

--- An NPC has spawned (including heroes).
-- @tparam CDOTA_BaseNPC unit Spawned unit
function GameMode:OnNPCSpawned(unit)
  self:d("OnNPCSpawned", unit:GetName(), unit:GetClassname(), unit:GetOwner() and unit:GetOwner():GetName())
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
  self:d("OnHeroInGame", hero:GetUnitName())
end

--[[--
Called once and only once when the game completely begins (about 0:00 on the
clock).

At this point, gold will begin to go up in ticks if configured, creeps will
spawn, towers will become damageable, etc.

This function is useful for starting any game logic timers/thinkers,
beginning the first round, etc.
]]
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
  self:d("OnEntityHurt", payload)

  local victim = Unit(EntIndexToHScript(payload.entindex_killed))

  local attacker
  if payload.entindex_attacker ~= nil then
    attacker = Unit(EntIndexToHScript(payload.entindex_attacker))
  end

  local inflictor
  if payload.entindex_inflictor ~= nil then
    inflictor = Ability(EntIndexToHScript(payload.entindex_inflictor))
  end

  local damage = DamageInstance(victim, payload.damage, attacker, inflictor)

  self.combos:OnEntityHurt(damage)
end

--- An item was picked up off the ground.
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam string payload.itemname Item name
-- @tparam int payload.ItemEntityIndex Item entity index
-- @tparam[opt] int payload.UnitEntityIndex Unit entity index
-- @tparam[opt] int payload.HeroEntityIndex Hero entity index
function GameMode:OnItemPickedUp(payload)
  self:d("OnItemPickedUp", payload)
end

--- An item was purchased by a player.
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam string payload.itemname Item name
-- @tparam number payload.itemcost Item cost
function GameMode:OnItemPurchased(payload)
  self:d("OnItemPurchased", payload)
end

--- An ability was used by a player (including items).
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam int payload.caster_entindex Caster (unit) entity index
-- @tparam string payload.abilityname Ability name
function GameMode:OnAbilityUsed(payload)
  self:d("OnAbilityUsed", payload)

  local player = PlayerResource:GetPlayer(payload.PlayerID)
  local caster = Unit(EntIndexToHScript(payload.caster_entindex))
  local abilityEnt = caster:FindAbilityOrItem(payload.abilityname)

  if abilityEnt == nil then
    local err = ABILITY_OR_ITEM_NOT_FOUND_ERROR:format(payload.abilityname, caster.name)
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
  self:d("OnNonPlayerUsedAbility", payload)
end

--- A player changed their name.
-- @tparam table payload
-- @tparam string payload.newname New name
-- @tparam string payload.oldName Old name
function GameMode:OnPlayerChangedName(payload)
  self:d("OnPlayerChangedName", payload)
end

--- A player leveled up an ability.
-- @tparam table payload
-- @tparam int payload.player Player entity index
-- @tparam string payload.abilityname Ability name
function GameMode:OnPlayerLearnedAbility(payload)
  self:d("OnPlayerLearnedAbility", payload)
end

--- A channelled ability finished by either completing or being interrupted.
-- @tparam table payload
-- @tparam string payload.abilityname Ability name
-- @tparam int payload.interrupted `1` if ability was interrupted
function GameMode:OnAbilityChannelFinished(payload)
  self:d("OnAbilityChannelFinished", payload)
end

--- A player leveled up.
-- @tparam table payload
-- @tparam int payload.player Player entity index
-- @tparam int payload.level Level
function GameMode:OnPlayerLevelUp(payload)
  self:d("OnPlayerLevelUp", payload)
end

--- A player last hit a creep, a tower, or a hero.
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam int payload.EntKilled Entity index of the unit that was killed
-- @tparam int payload.FirstBlood `1` if last hit was a first blood
-- @tparam int payload.HeroKill `1` if last hit was a hero kill
-- @tparam int payload.TowerKill `1` if last hit was a tower kill
function GameMode:OnLastHit(payload)
  self:d("OnLastHit", payload)
end

--- A tree was cut down by tango, quelling blade, etc.
-- @tparam table payload
-- @tparam number payload.tree_x X component of tree's coordinate
-- @tparam number payload.tree_y Y component of tree's coordinate
function GameMode:OnTreeCut(payload)
  self:d("OnTreeCut", payload)
end

--- A rune was activated by a player.
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam int payload.rune Rune ID (`DOTA_RUNE_*` constants)
function GameMode:OnRuneActivated(payload)
  self:d("OnRuneActivated", payload)
end

--- A player took damage from a tower.
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam number payload.damage Damage amount
function GameMode:OnPlayerTakeTowerDamage(payload)
  self:d("OnPlayerTakeTowerDamage", payload)
end

--- A player picked a hero.
-- @tparam table payload
-- @tparam int payload.player Player entity index
-- @tparam int payload.heroindex Hero entity index
-- @tparam string payload.hero Hero class
function GameMode:OnPlayerPickHero(payload)
  self:d("OnPlayerPickHero", payload)
end

--- A player killed another player in a multi-team context.
-- @tparam table payload
-- @tparam int payload.killer_userid Killer player ID
-- @tparam int payload.victim_userid Victim player ID
-- @tparam int payload.herokills Number of kills?
-- @tparam int payload.teamnumber Team number
function GameMode:OnTeamKillCredit(payload)
  self:d("OnTeamKillCredit", payload)
end

--- An entity died.
-- @tparam CDOTA_BaseNPC killed Killed unit
-- @tparam[opt] CDOTA_BaseNPC attacker Attacker unit
-- @tparam[opt] CDOTABaseAbility inflictor Inflictor ability
function GameMode:OnEntityKilled(killed, attacker, inflictor)
  self:d(
    "OnEntityKilled",
    killed:GetName(),
    attacker and attacker:GetName(),
    inflictor and inflictor:GetName()
  )
end

--- Called whenever illusions are created and tells you which was/is the original entity.
-- @tparam table payload
-- @tparam int payload.original_entindex Original unit entity index
function GameMode:OnIllusionsCreated(payload)
  self:d("OnIllusionsCreated", payload)
end

--- Called whenever an item is combined to create a new item.
-- @tparam table payload
-- @tparam string payload.itemname Item name
-- @tparam number payload.itemcost Item cost
-- @tparam[opt] int payload.PlayerID Player ID
function GameMode:OnItemCombined(payload)
  self:d("OnItemCombined", payload)
end

--- Called whenever an ability begins its PhaseStart phase (but before it is actually cast).
-- @tparam table payload
-- @tparam int payload.PlayerID Player ID
-- @tparam string payload.abilityname Ability name
function GameMode:OnAbilityCastBegins(payload)
  self:d("OnAbilityCastBegins", payload)
end

--- Called whenever a tower is killed.
-- @tparam table payload
-- @tparam int payload.killer_userid Player ID
-- @tparam int payload.gold Gold gained amount
-- @tparam int payload.teamnumber Team number
function GameMode:OnTowerKill(payload)
  self:d("OnTowerKill", payload)
end

--- Called whenever a player changes their custom team selection during Game Setup.
-- @tparam table payload
-- @tparam int payload.player_id Player ID
-- @tparam int payload.success `1` if change was successful
-- @tparam int payload.team_id Team number
function GameMode:OnPlayerSelectedCustomTeam(payload)
  self:d("OnPlayerSelectedCustomTeam", payload)
end

--- Called whenever an NPC reaches its goal position/target.
-- @tparam table payload
-- @tparam int payload.npc_entindex Moving unit entity index
-- @tparam int payload.goal_entindex Goal entity index
-- @tparam int payload.next_goal_entindex Next goal entity index
function GameMode:OnNPCGoalReached(payload)
  self:d("OnNPCGoalReached", payload)
end

--- Called whenever any player sends a chat message.
-- @tparam table payload
-- @tparam int payload.playerid Player ID
-- @tparam int payload.userid User ID
-- @tparam string payload.text Message
-- @tparam int payload.teamonly `1` if message was sent to allies only
function GameMode:OnPlayerChat(payload)
  self:d("OnPlayerChat", payload)
end
