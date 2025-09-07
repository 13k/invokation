local class = require("middleclass")

local CUSTOM_EVENTS = require("invk.const.custom_events")
local Env = require("invk.game_mode.env")
local Logger = require("invk.logger")
local Player = require("invk.dota2.player")
local custom_ev = require("invk.dota2.custom_events")
local func = require("invk.lang.function")

--- @class invk.game_mode.CustomEvents : middleclass.Class, invk.log.Mixin
--- @field game invk.GameMode
--- @field logger? invk.Logger
local M = class("invk.game_mode.CustomEvents")

M:include(Logger.Mixin)

--- @class invk.game_mode.CustomEventsOptions
--- @field logger? invk.Logger

--- @param game invk.GameMode
--- @param options? invk.game_mode.CustomEventsOptions
function M:initialize(game, options)
  self.game = game

  local opts = options or {}

  if opts.logger then
    self.logger = opts.logger:child("custom_events")
  end
end

function M:register()
  self:d("register listeners")

  self:subscribe(CUSTOM_EVENTS.EVENT_PLAYER_HERO_FACET_REQUEST, "on_player_hero_facet_request")
  self:subscribe(CUSTOM_EVENTS.EVENT_PLAYER_QUIT_REQUEST, "on_player_quit_request")
  self:subscribe(CUSTOM_EVENTS.EVENT_COMBOS_RELOAD, "on_combos_reload")
  self:subscribe(CUSTOM_EVENTS.EVENT_COMBO_START, "on_combo_start")
  self:subscribe(CUSTOM_EVENTS.EVENT_COMBO_STOP, "on_combo_stop")
  self:subscribe(CUSTOM_EVENTS.EVENT_COMBO_RESTART, "on_combo_restart")
  self:subscribe(CUSTOM_EVENTS.EVENT_FREESTYLE_HERO_LEVEL_UP, "on_freestyle_hero_level_up")
  self:subscribe(CUSTOM_EVENTS.EVENT_COMBAT_LOG_CAPTURE_START, "on_combat_log_capture_start")
  self:subscribe(CUSTOM_EVENTS.EVENT_COMBAT_LOG_CAPTURE_STOP, "on_combat_log_capture_stop")
  self:subscribe(CUSTOM_EVENTS.EVENT_ITEM_PICKER_QUERY_REQUEST, "on_item_picker_query")
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

--- @param method_name string
--- @return fun(...: any): any...
function M:method_handler(method_name)
  return func.bind(self:fn_handler(method_name), self)
end

--- @param event string
--- @param method_name string
--- @return CustomGameEventListenerID
function M:subscribe(event, method_name)
  return custom_ev.subscribe(event, self:method_handler(method_name))
end

--- Handles hero facet selection events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.PlayerHeroFacetRequest
function M:on_player_hero_facet_request(player, payload)
  self:d("on_player_hero_facet_request", { player = player:GetPlayerID(), payload = payload })

  if self.game.combos:has_active_combo(player) then
    --- @type invk.custom_events.PlayerHeroFacetResponse
    local response = {
      error = "Cannot change facet during active combo",
    }

    custom_ev.send_player(CUSTOM_EVENTS.EVENT_PLAYER_HERO_FACET_RESPONSE, player, response)

    return
  end

  local game = self.game
  local pplayer = Player:new(player)

  pplayer:replace_hero_variant(payload.variant, nil, function(hero)
    local player_hero = game:update_player_hero(hero)

    --- @type invk.custom_events.PlayerHeroFacetResponse
    local response = {
      hero = player_hero,
    }

    custom_ev.send_player(CUSTOM_EVENTS.EVENT_PLAYER_HERO_FACET_RESPONSE, player, response)
  end)
end

--- Handles player quit request events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.PlayerQuitRequest
function M:on_player_quit_request(player, payload)
  self:d("on_player_quit_request", { player = player:GetPlayerID(), payload = payload })

  SendToServerConsole("disconnect")
end

--- Handles combos reload events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.CombosReloadPayload
function M:on_combos_reload(player, payload)
  self:d("on_combos_reload", { player = player:GetPlayerID(), payload = payload })

  self.game.combos:load()
end

--- Handles combo start events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ComboStartPayload
function M:on_combo_start(player, payload)
  self:d("on_combo_start", { player = player:GetPlayerID(), payload = payload })

  local combo = self.game.combos:create(payload.id)

  self.game.combos:on_start(player, combo)
end

--- Handles combo stop events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ComboStopPayload
function M:on_combo_stop(player, payload)
  self:d("on_combo_stop", { player = player:GetPlayerID(), payload = payload })

  self.game.combos:on_stop(player)
end

--- Handles combo restart events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ComboRestartPayload
function M:on_combo_restart(player, payload)
  self:d("on_combo_restart", { player = player:GetPlayerID(), payload = payload })

  self.game.combos:on_restart(player, {
    hard_reset = payload.hardReset == 1,
  })
end

--- Handles freestyle hero level up events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.FreestyleHeroLevelUpPayload
function M:on_freestyle_hero_level_up(player, payload)
  self:d("on_freestyle_hero_level_up", { player = player:GetPlayerID(), payload = payload })

  self.game.combos:freestyle_hero_level_up(player, {
    level = payload.level,
    max_level = payload.maxLevel == 1,
  })
end

--- Handles combat log capture start events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.CombatLogCaptureStartPayload
function M:on_combat_log_capture_start(player, payload)
  self:d("on_combat_log_capture_start", { player = player:GetPlayerID(), payload = payload })

  self.game.combos:start_capturing_abilities(player)
end

--- Handles combat log capture stop events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.CombatLogCaptureStopPayload
function M:on_combat_log_capture_stop(player, payload)
  self:d("on_combat_log_capture_stop", { player = player:GetPlayerID(), payload = payload })

  self.game.combos:stop_capturing_abilities(player)
end

--- Handles item picker query events.
--- @param player CDOTAPlayerController
--- @param payload invk.custom_events.ItemPickerQueryPayload
function M:on_item_picker_query(player, payload)
  self:d("on_item_picker_query", { player = player:GetPlayerID(), payload = payload })

  local items = self.game.items_kv:search(payload.query)

  --- @type invk.custom_events.ItemPickerQueryResponsePayload
  local response = { items = items }

  custom_ev.send_player(CUSTOM_EVENTS.EVENT_ITEM_PICKER_QUERY_RESPONSE, player, response)
end

return M
