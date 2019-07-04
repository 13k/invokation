require("game_mode.events.internal")
require("game_mode.events.game_events")
require("game_mode.events.custom_events")

local lfunc = require("lang.function")
local CustomEvents = require("dota2.custom_events")

function GameMode:registerListeners()
  ListenToGameEvent("dota_player_gained_level", lfunc.lookupbyname(GameMode, "OnPlayerLevelUp"), self)
  ListenToGameEvent("dota_ability_channel_finished", lfunc.lookupbyname(GameMode, "OnAbilityChannelFinished"), self)
  ListenToGameEvent("dota_player_learned_ability", lfunc.lookupbyname(GameMode, "OnPlayerLearnedAbility"), self)
  ListenToGameEvent("entity_killed", lfunc.lookupbyname(GameMode, "_OnEntityKilled"), self)
  ListenToGameEvent("player_connect_full", lfunc.lookupbyname(GameMode, "_OnConnectFull"), self)
  ListenToGameEvent("player_disconnect", lfunc.lookupbyname(GameMode, "OnDisconnect"), self)
  ListenToGameEvent("dota_item_purchased", lfunc.lookupbyname(GameMode, "OnItemPurchased"), self)
  ListenToGameEvent("dota_item_picked_up", lfunc.lookupbyname(GameMode, "OnItemPickedUp"), self)
  ListenToGameEvent("last_hit", lfunc.lookupbyname(GameMode, "OnLastHit"), self)
  ListenToGameEvent("dota_non_player_used_ability", lfunc.lookupbyname(GameMode, "OnNonPlayerUsedAbility"), self)
  ListenToGameEvent("player_changename", lfunc.lookupbyname(GameMode, "OnPlayerChangedName"), self)
  ListenToGameEvent("dota_rune_activated_server", lfunc.lookupbyname(GameMode, "OnRuneActivated"), self)
  ListenToGameEvent("dota_player_take_tower_damage", lfunc.lookupbyname(GameMode, "OnPlayerTakeTowerDamage"), self)
  ListenToGameEvent("tree_cut", lfunc.lookupbyname(GameMode, "OnTreeCut"), self)
  ListenToGameEvent("entity_hurt", lfunc.lookupbyname(GameMode, "OnEntityHurt"), self)
  ListenToGameEvent("player_connect", lfunc.lookupbyname(GameMode, "PlayerConnect"), self)
  ListenToGameEvent("dota_player_used_ability", lfunc.lookupbyname(GameMode, "OnAbilityUsed"), self)
  ListenToGameEvent("game_rules_state_change", lfunc.lookupbyname(GameMode, "_OnGameRulesStateChange"), self)
  ListenToGameEvent("npc_spawned", lfunc.lookupbyname(GameMode, "_OnNPCSpawned"), self)
  ListenToGameEvent("dota_player_pick_hero", lfunc.lookupbyname(GameMode, "OnPlayerPickHero"), self)
  ListenToGameEvent("dota_team_kill_credit", lfunc.lookupbyname(GameMode, "OnTeamKillCredit"), self)
  ListenToGameEvent("player_reconnected", lfunc.lookupbyname(GameMode, "OnPlayerReconnect"), self)

  ListenToGameEvent("dota_illusions_created", lfunc.lookupbyname(GameMode, "OnIllusionsCreated"), self)
  ListenToGameEvent("dota_item_combined", lfunc.lookupbyname(GameMode, "OnItemCombined"), self)
  ListenToGameEvent("dota_player_begin_cast", lfunc.lookupbyname(GameMode, "OnAbilityCastBegins"), self)
  ListenToGameEvent("dota_tower_kill", lfunc.lookupbyname(GameMode, "OnTowerKill"), self)
  ListenToGameEvent(
    "dota_player_selected_custom_team",
    lfunc.lookupbyname(GameMode, "OnPlayerSelectedCustomTeam"),
    self
  )
  ListenToGameEvent("dota_npc_goal_reached", lfunc.lookupbyname(GameMode, "OnNPCGoalReached"), self)

  ListenToGameEvent("player_chat", lfunc.lookupbyname(GameMode, "OnPlayerChat"), self)

  --ListenToGameEvent('dota_tutorial_shop_toggled', lfunc.lookupbyname(GameMode, 'OnShopToggled'), self)
  --ListenToGameEvent('player_spawn', lfunc.lookupbyname(GameMode, 'OnPlayerSpawn'), self)
  --ListenToGameEvent('dota_unit_event', lfunc.lookupbyname(GameMode, 'OnDotaUnitEvent'), self)
  --ListenToGameEvent('nommed_tree', lfunc.lookupbyname(GameMode, 'OnPlayerAteTree'), self)
  --ListenToGameEvent('player_completed_game', lfunc.lookupbyname(GameMode, 'OnPlayerCompletedGame'), self)
  --ListenToGameEvent('dota_match_done', lfunc.lookupbyname(GameMode, 'OnDotaMatchDone'), self)
  --ListenToGameEvent('dota_combatlog', lfunc.lookupbyname(GameMode, 'OnCombatLogEvent'), self)
  --ListenToGameEvent('dota_player_killed', lfunc.lookupbyname(GameMode, 'OnPlayerKilled'), self)
  --ListenToGameEvent('player_team', lfunc.lookupbyname(GameMode, 'OnPlayerTeam'), self)

  self:d("  register game event listeners")
end

function GameMode:registerCustomListeners()
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBOS_RELOAD, lfunc.bindbyname(self.combos, "Load"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBO_START, lfunc.bindbyname(self, "OnComboStart"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBO_STOP, lfunc.bindbyname(self, "OnComboStop"))

  CustomEvents.Subscribe(CustomEvents.EVENT_COMBAT_LOG_CAPTURE_START, lfunc.bindbyname(self, "OnCombatLogCaptureStart"))
  CustomEvents.Subscribe(CustomEvents.EVENT_COMBAT_LOG_CAPTURE_STOP, lfunc.bindbyname(self, "OnCombatLogCaptureStop"))

  self:d("  register custom event listeners")
end
