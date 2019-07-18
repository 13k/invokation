--- Events Setup
-- @submodule invokation.GameMode

--- Events Setup
-- @section events

require("invokation.game_mode.events.internal")
require("invokation.game_mode.events.game_events")
require("invokation.game_mode.events.custom_events")

local lfn = require("invokation.lang.function")
local CustomEvents = require("invokation.dota2.custom_events")

function GameMode:registerListeners()
  ListenToGameEvent("dota_ability_channel_finished", lfn.lookupbyname(GameMode, "OnAbilityChannelFinished"), self)
  ListenToGameEvent("dota_illusions_created", lfn.lookupbyname(GameMode, "OnIllusionsCreated"), self)
  ListenToGameEvent("dota_item_combined", lfn.lookupbyname(GameMode, "OnItemCombined"), self)
  ListenToGameEvent("dota_item_picked_up", lfn.lookupbyname(GameMode, "OnItemPickedUp"), self)
  ListenToGameEvent("dota_item_purchased", lfn.lookupbyname(GameMode, "OnItemPurchased"), self)
  ListenToGameEvent("dota_non_player_used_ability", lfn.lookupbyname(GameMode, "OnNonPlayerUsedAbility"), self)
  ListenToGameEvent("dota_npc_goal_reached", lfn.lookupbyname(GameMode, "OnNPCGoalReached"), self)
  ListenToGameEvent("dota_player_begin_cast", lfn.lookupbyname(GameMode, "OnAbilityCastBegins"), self)
  ListenToGameEvent("dota_player_gained_level", lfn.lookupbyname(GameMode, "OnPlayerLevelUp"), self)
  ListenToGameEvent("dota_player_learned_ability", lfn.lookupbyname(GameMode, "OnPlayerLearnedAbility"), self)
  ListenToGameEvent("dota_player_pick_hero", lfn.lookupbyname(GameMode, "OnPlayerPickHero"), self)
  ListenToGameEvent("dota_player_selected_custom_team", lfn.lookupbyname(GameMode, "OnPlayerSelectedCustomTeam"), self)
  ListenToGameEvent("dota_player_take_tower_damage", lfn.lookupbyname(GameMode, "OnPlayerTakeTowerDamage"), self)
  ListenToGameEvent("dota_player_used_ability", lfn.lookupbyname(GameMode, "OnAbilityUsed"), self)
  ListenToGameEvent("dota_rune_activated_server", lfn.lookupbyname(GameMode, "OnRuneActivated"), self)
  ListenToGameEvent("dota_team_kill_credit", lfn.lookupbyname(GameMode, "OnTeamKillCredit"), self)
  ListenToGameEvent("dota_tower_kill", lfn.lookupbyname(GameMode, "OnTowerKill"), self)
  ListenToGameEvent("entity_hurt", lfn.lookupbyname(GameMode, "OnEntityHurt"), self)
  ListenToGameEvent("entity_killed", lfn.lookupbyname(GameMode, "_OnEntityKilled"), self)
  ListenToGameEvent("game_rules_state_change", lfn.lookupbyname(GameMode, "_OnGameRulesStateChange"), self)
  ListenToGameEvent("last_hit", lfn.lookupbyname(GameMode, "OnLastHit"), self)
  ListenToGameEvent("npc_spawned", lfn.lookupbyname(GameMode, "_OnNPCSpawned"), self)
  ListenToGameEvent("player_changename", lfn.lookupbyname(GameMode, "OnPlayerChangedName"), self)
  ListenToGameEvent("player_chat", lfn.lookupbyname(GameMode, "OnPlayerChat"), self)
  ListenToGameEvent("player_connect_full", lfn.lookupbyname(GameMode, "_OnConnectFull"), self)
  ListenToGameEvent("player_connect", lfn.lookupbyname(GameMode, "OnPlayerConnect"), self)
  ListenToGameEvent("player_disconnect", lfn.lookupbyname(GameMode, "OnDisconnect"), self)
  ListenToGameEvent("player_reconnected", lfn.lookupbyname(GameMode, "OnPlayerReconnect"), self)
  ListenToGameEvent("tree_cut", lfn.lookupbyname(GameMode, "OnTreeCut"), self)
  --ListenToGameEvent("dota_combatlog", lfn.lookupbyname(GameMode, "OnCombatLogEvent"), self)
  --ListenToGameEvent("dota_match_done", lfn.lookupbyname(GameMode, "OnDotaMatchDone"), self)
  --ListenToGameEvent("dota_player_killed", lfn.lookupbyname(GameMode, "OnPlayerKilled"), self)
  --ListenToGameEvent("dota_tutorial_shop_toggled", lfn.lookupbyname(GameMode, "OnShopToggled"), self)
  --ListenToGameEvent("dota_unit_event", lfn.lookupbyname(GameMode, "OnDotaUnitEvent"), self)
  --ListenToGameEvent("nommed_tree", lfn.lookupbyname(GameMode, "OnPlayerAteTree"), self)
  --ListenToGameEvent("player_completed_game", lfn.lookupbyname(GameMode, "OnPlayerCompletedGame"), self)
  --ListenToGameEvent("player_spawn", lfn.lookupbyname(GameMode, "OnPlayerSpawn"), self)
  --ListenToGameEvent("player_team", lfn.lookupbyname(GameMode, "OnPlayerTeam"), self)

  self:d("  register game event listeners")
end

function GameMode:registerCustomListeners()
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBOS_RELOAD, lfn.bindbyname(self.combos, "Load"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBO_START, lfn.bindbyname(self, "OnComboStart"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBO_STOP, lfn.bindbyname(self, "OnComboStop"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBO_RESTART, lfn.bindbyname(self, "OnComboRestart"))

  CustomEvents.Subscribe(CustomEvents.EVENT_COMBAT_LOG_CAPTURE_START, lfn.bindbyname(self, "OnCombatLogCaptureStart"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBAT_LOG_CAPTURE_STOP, lfn.bindbyname(self, "OnCombatLogCaptureStop"))

  self:d("  register custom event listeners")
end
