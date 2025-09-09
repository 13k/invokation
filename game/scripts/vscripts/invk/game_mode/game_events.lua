local class = require("middleclass")
local inspect = require("inspect")

local Ability = require("invk.dota2.ability")
local CUSTOM_EVENTS = require("invk.const.custom_events")
local DamageInstance = require("invk.dota2.damage_instance")
local Env = require("invk.game_mode.env")
local Logger = require("invk.logger")
local Unit = require("invk.dota2.unit")
local custom_ev = require("invk.dota2.custom_events")
local func = require("invk.lang.function")

--- @class invk.game_mode.GameEvents : middleclass.Class, invk.log.Mixin
--- @field game invk.GameMode
--- @field logger? invk.Logger
--- @field private _first_player_loaded boolean
local M = class("invk.game_mode.GameEvents")

M:include(Logger.Mixin)

--- @class invk.game_mode.GameEventsOptions
--- @field logger? invk.Logger

--- @param game invk.GameMode
--- @param options? invk.game_mode.GameEventsOptions
function M:initialize(game, options)
  self.game = game
  self._first_player_loaded = false

  local opts = options or {}

  if opts.logger then
    self.logger = opts.logger:child("game_events")
  end
end

function M:register()
  self:d("register listeners")

  self:listen("dota_item_purchased", "_on_dota_item_purchased")
  self:listen("dota_player_used_ability", "_on_dota_player_used_ability")
  self:listen("entity_hurt", "_on_entity_hurt")
  self:listen("game_rules_state_change", "_on_game_rules_state_change")
  self:listen("npc_spawned", "_on_npc_spawned")
  self:listen("player_connect_full", "_on_player_connect_full")
end

--- @param fn_name string
--- @return fun(...: any): any...
function M:fn_handler(fn_name)
  assertf(type(self[fn_name]) == "function", "%s.%s is not a function", self.class.name, fn_name)

  if self.game.env == Env.DEVELOPMENT then
    return func.lookupbyname(self, fn_name)
  end

  return self[fn_name]
end

--- @param event string
--- @param method_name string
--- @return EventListenerID
function M:listen(event, method_name)
  return ListenToGameEvent(event, self:fn_handler(method_name), self)
end

--- @param event string
--- @param id PlayerID | { PlayerID: PlayerID }
--- @return CDOTAPlayerController
local function assert_player(event, id)
  local fmt = "event %q: invalid player ID %d"
  --- @type any[]
  local values = { event }

  if type(id) == "table" then
    fmt = fmt .. " in payload %s"
    values[#values + 1] = id.PlayerID
    values[#values + 1] = inspect(id)
    id = id.PlayerID
  else
    values[#values + 1] = id
  end

  local player = assertf(PlayerResource:GetPlayer(id), fmt, table.unpack(values))

  return player
end

local ERRF_ABILITY_OR_ITEM_NOT_FOUND = "Could not find ability or item named %q on unit %q"

--- An item was purchased by a player.
--- @param payload dota2.events.dota_item_purchased
function M:_on_dota_item_purchased(payload)
  self:d("_on_dota_item_purchased", { payload = payload })

  local player = assert_player("dota_item_purchased", payload)

  self.game.combos:on_item_purchased(player, {
    item = payload.itemname,
    cost = payload.itemcost,
  })
end

--- An ability was used by a player (including items).
--- @param payload dota2.events.dota_player_used_ability
function M:_on_dota_player_used_ability(payload)
  self:d("_on_dota_player_used_ability", { payload = payload })

  local player = assert_player("dota_player_used_ability", payload)
  local caster = Unit:new(EntIndexToHScript(payload.caster_entindex))
  local ability_ent = caster:find_ability_or_item(payload.abilityname)

  if ability_ent == nil then
    errorf(ERRF_ABILITY_OR_ITEM_NOT_FOUND, payload.abilityname, caster.name)
  end

  local ability = Ability:new(ability_ent)

  self.game.combos:on_ability_used(player, caster, ability)
end

--- An entity has been hurt.
--- @param payload dota2.events.entity_hurt
function M:_on_entity_hurt(payload)
  self:d("_on_entity_hurt", { payload = payload })

  --- @type invk.dota2.Unit
  local attacker
  --- @type invk.dota2.Ability
  local inflictor
  local victim = Unit:new(EntIndexToHScript(payload.entindex_killed))

  if payload.entindex_attacker ~= nil then
    attacker = Unit:new(EntIndexToHScript(payload.entindex_attacker))
  end

  -- FIXME: This is a hack to fix an issue when an entity is killed with `ForceKill`,
  -- FIXME: which will trigger this event. I'm not sure which enum `damagebits` is using,
  -- FIXME: but regular damage seems to always set it to 0 while `ForceKill` sets it to 4096
  if payload.entindex_inflictor ~= nil and payload.damagebits == 0 then
    inflictor = Ability:new(EntIndexToHScript(payload.entindex_inflictor))
  end

  local damage = DamageInstance:new(victim, payload.damage, attacker, inflictor)

  self.game.combos:on_entity_hurt(damage)
end

--- Called when the overall game state has changed.
--- @param payload dota2.events.game_rules_state_change
function M:_on_game_rules_state_change(payload)
  self:d("_on_game_rules_state_change", { payload = payload })

  -- if self._reentrant then
  --   return
  -- end

  local state = GameRules:State_Get()

  -- self._reentrant = true
  self:on_game_rules_state_change(state, payload)
  -- self._reentrant = false

  if state == DOTA_GAMERULES_STATE_HERO_SELECTION then
    self.game:post_load_precache()
    self:on_all_players_loaded()
    self.game:set_team_colors()
  elseif state == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
    self:on_game_in_progress()
  end
end

--- The overall game state has changed.
--- @param state DOTA_GameState
--- @param payload dota2.events.game_rules_state_change
function M:on_game_rules_state_change(state, payload)
  self:d("on_game_rules_state_change", { state = state, payload = payload })
end

--- Called once and only once after all players have loaded into the game,
--- right as the hero selection time begins.
function M:on_all_players_loaded()
  self:d("on_all_players_loaded")
end

--- Called once and only once when the game completely begins (about 0:00 on the clock).
function M:on_game_in_progress()
  self:d("on_game_in_progress")
end

--- Called when an NPC has spawned somewhere in game, including heroes.
--- @param payload dota2.events.npc_spawned
function M:_on_npc_spawned(payload)
  -- if self._reentrant then
  --   return
  -- end

  local npc = EntIndexToHScript(payload.entindex) --[[@as CDOTA_BaseNPC?]]

  self:d("_on_npc_spawned", {
    payload = payload,
    unit = npc and npc:GetUnitName() or "<unknown>",
  })

  if payload.is_respawn == 0 and npc ~= nil and npc:IsRealHero() then
    self:on_hero_in_game(npc)
  end
end

--- Called once and only once for every player when they spawn into the game
--- for the first time.
---
--- It is also called if the player's hero is replaced with a new hero for any
--- reason. This function is useful for initializing heroes, such as adding
--- levels, changing the starting gold, removing/adding abilities, adding
--- physics, etc.
---
--- @param hero CDOTA_BaseNPC_Hero
function M:on_hero_in_game(hero)
  self:d("on_hero_in_game", { hero = hero:GetUnitName() })

  local player = hero:GetPlayerOwner()

  if player == nil then
    return
  end

  --- @type invk.custom_events.PlayerHeroInGame
  local payload = {
    id = hero:GetHeroID(),
    name = hero:GetUnitName(),
    facet_id = hero:GetHeroFacetID(),
  }

  custom_ev.send_player(CUSTOM_EVENTS.EVENT_PLAYER_HERO_IN_GAME, player, payload)
end

--- Called once when the player fully connects and becomes "Ready" during loading.
--- @param payload dota2.events.player_connect_full
function M:_on_player_connect_full(payload)
  self:d("_on_player_connect_full", { payload = payload })

  -- if self._reentrant then
  --   return
  -- end

  local player = assert_player("player_connect_full", payload)

  -- self._reentrant = true
  self:on_connect_full(payload.userid, player)
  -- self._reentrant = false

  if not self._first_player_loaded then
    self._first_player_loaded = true
    self:on_first_player_loaded()
  end
end

--- Called once when the player fully connects and becomes "ready" during loading.
--- @param user_id integer
--- @param player CDOTAPlayerController
function M:on_connect_full(user_id, player)
  self:d("on_connect_full", { player = player:GetPlayerID() })

  self.game:add_player_user(user_id, player)
end

--- Called once and only once as soon as the first player (almost certain to be
--- the server in local lobbies) loads in.
---
--- It can be used to initialize state that isn't initializeable in [invk.GameMode:Activate]
--- but needs to be done before everyone loads in.
function M:on_first_player_loaded()
  self:d("on_first_player_loaded")
end

return M
