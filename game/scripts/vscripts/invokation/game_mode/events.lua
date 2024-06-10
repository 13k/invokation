--- Events Setup
-- @submodule invokation.GameMode
require("invokation.game_mode.events.internal")
require("invokation.game_mode.events.game_events")
require("invokation.game_mode.events.custom_events")

local CUSTOM_EVENTS = require("invokation.const.custom_events")
local CustomEvents = require("invokation.dota2.custom_events")

--- Events Setup
-- @section events

function GameMode:listenToGameEvent(event, methodName)
  return ListenToGameEvent(event, self:fnHandler(methodName), self)
end

--- @param event string
--- @param methodName string
--- @return CustomGameEventListenerID
function GameMode:subscribeToCustomEvent(event, methodName)
  return CustomEvents.Subscribe(event, self:methodHandler(methodName))
end

function GameMode:registerGameEvents()
  self:listenToGameEvent("dota_ability_channel_finished", "OnAbilityChannelFinished")
  self:listenToGameEvent("dota_item_purchased", "OnItemPurchased")
  self:listenToGameEvent("dota_non_player_used_ability", "OnNonPlayerUsedAbility")
  self:listenToGameEvent("dota_player_begin_cast", "OnAbilityCastBegins")
  self:listenToGameEvent("dota_player_used_ability", "OnAbilityUsed")
  self:listenToGameEvent("entity_hurt", "OnEntityHurt")
  self:listenToGameEvent("entity_killed", "_OnEntityKilled")
  self:listenToGameEvent("game_rules_state_change", "_OnGameRulesStateChange")
  self:listenToGameEvent("npc_spawned", "_OnNPCSpawned")
  self:listenToGameEvent("player_connect_full", "_OnConnectFull")

  self:d("  register game events listeners")
end

function GameMode:registerCustomEvents()
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_PLAYER_QUIT_REQUEST, "OnPlayerQuitRequest")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_COMBOS_RELOAD, "OnCombosReload")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_COMBOS_RELOAD, "OnCombosReload")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_COMBO_START, "OnComboStart")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_COMBO_STOP, "OnComboStop")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_COMBO_RESTART, "OnComboRestart")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_FREESTYLE_HERO_LEVEL_UP, "OnFreestyleHeroLevelUp")

  self:subscribeToCustomEvent(
    CUSTOM_EVENTS.EVENT_COMBAT_LOG_CAPTURE_START,
    "OnCombatLogCaptureStart"
  )

  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_COMBAT_LOG_CAPTURE_STOP, "OnCombatLogCaptureStop")
  self:subscribeToCustomEvent(CUSTOM_EVENTS.EVENT_ITEM_PICKER_QUERY_REQUEST, "OnItemPickerQuery")

  self:d("  register custom events listeners")
end
