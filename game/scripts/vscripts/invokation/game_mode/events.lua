--- Events Setup
-- @submodule invokation.GameMode
--- Events Setup
-- @section events
require("invokation.game_mode.events.internal")
require("invokation.game_mode.events.game_events")
require("invokation.game_mode.events.custom_events")

local CustomEvents = require("invokation.dota2.custom_events")

function GameMode:listenToGameEvent(event, methodName)
  return ListenToGameEvent(event, self:fnHandler(methodName), self)
end

function GameMode:subscribeToCustomEvent(event, methodName)
  return CustomEvents.Subscribe(CustomEvents[event], self:methodHandler(methodName))
end

function GameMode:registerGameEvents()
  self:listenToGameEvent("dota_ability_channel_finished", "OnAbilityChannelFinished")
  self:listenToGameEvent("dota_illusions_created", "OnIllusionsCreated")
  self:listenToGameEvent("dota_item_combined", "OnItemCombined")
  self:listenToGameEvent("dota_item_picked_up", "OnItemPickedUp")
  self:listenToGameEvent("dota_item_purchased", "OnItemPurchased")
  self:listenToGameEvent("dota_non_player_used_ability", "OnNonPlayerUsedAbility")
  self:listenToGameEvent("dota_npc_goal_reached", "OnNPCGoalReached")
  self:listenToGameEvent("dota_player_begin_cast", "OnAbilityCastBegins")
  self:listenToGameEvent("dota_player_gained_level", "OnPlayerLevelUp")
  self:listenToGameEvent("dota_player_learned_ability", "OnPlayerLearnedAbility")
  self:listenToGameEvent("dota_player_pick_hero", "OnPlayerPickHero")
  self:listenToGameEvent("dota_player_selected_custom_team", "OnPlayerSelectedCustomTeam")
  self:listenToGameEvent("dota_player_take_tower_damage", "OnPlayerTakeTowerDamage")
  self:listenToGameEvent("dota_player_used_ability", "OnAbilityUsed")
  self:listenToGameEvent("dota_rune_activated_server", "OnRuneActivated")
  self:listenToGameEvent("dota_team_kill_credit", "OnTeamKillCredit")
  self:listenToGameEvent("dota_tower_kill", "OnTowerKill")
  self:listenToGameEvent("entity_hurt", "OnEntityHurt")
  self:listenToGameEvent("entity_killed", "_OnEntityKilled")
  self:listenToGameEvent("game_rules_state_change", "_OnGameRulesStateChange")
  self:listenToGameEvent("last_hit", "OnLastHit")
  self:listenToGameEvent("npc_spawned", "_OnNPCSpawned")
  self:listenToGameEvent("player_changename", "OnPlayerChangedName")
  self:listenToGameEvent("player_chat", "OnPlayerChat")
  self:listenToGameEvent("player_connect_full", "_OnConnectFull")
  self:listenToGameEvent("player_connect", "OnPlayerConnect")
  self:listenToGameEvent("player_disconnect", "OnDisconnect")
  self:listenToGameEvent("player_reconnected", "OnPlayerReconnect")
  self:listenToGameEvent("tree_cut", "OnTreeCut")

  -- self:listenToGameEvent("dota_combatlog", "OnCombatLogEvent")
  -- self:listenToGameEvent("dota_match_done", "OnDotaMatchDone")
  -- self:listenToGameEvent("dota_player_killed", "OnPlayerKilled")
  -- self:listenToGameEvent("dota_tutorial_shop_toggled", "OnShopToggled")
  -- self:listenToGameEvent("dota_unit_event", "OnDotaUnitEvent")
  -- self:listenToGameEvent("nommed_tree", "OnPlayerAteTree")
  -- self:listenToGameEvent("player_completed_game", "OnPlayerCompletedGame")
  -- self:listenToGameEvent("player_spawn", "OnPlayerSpawn")
  -- self:listenToGameEvent("player_team", "OnPlayerTeam")

  self:d("  register game events listeners")
end

function GameMode:registerCustomEvents()
  self:subscribeToCustomEvent("EVENT_COMBOS_RELOAD", "OnCombosReload")
  self:subscribeToCustomEvent("EVENT_COMBO_START", "OnComboStart")
  self:subscribeToCustomEvent("EVENT_COMBO_STOP", "OnComboStop")
  self:subscribeToCustomEvent("EVENT_COMBO_RESTART", "OnComboRestart")
  self:subscribeToCustomEvent("EVENT_FREESTYLE_HERO_LEVEL_UP", "OnFreestyleHeroLevelUp")
  self:subscribeToCustomEvent("EVENT_COMBAT_LOG_CAPTURE_START", "OnCombatLogCaptureStart")
  self:subscribeToCustomEvent("EVENT_COMBAT_LOG_CAPTURE_STOP", "OnCombatLogCaptureStop")
  self:subscribeToCustomEvent("EVENT_ITEM_PICKER_QUERY", "OnItemPickerQuery")

  self:d("  register custom events listeners")
end
