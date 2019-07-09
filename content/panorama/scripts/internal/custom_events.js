"use strict";

var EVENT_PICKER_SHOW = "invokation_picker_show";

var EVENT_VIEWER_RENDER = "invokation_viewer_render";

var EVENT_COMBOS_RELOAD = "invokation_combos_reload";
var EVENT_COMBO_START = "invokation_combo_start";
var EVENT_COMBO_STARTED = "invokation_combo_started";
var EVENT_COMBO_STOP = "invokation_combo_stop";
var EVENT_COMBO_STOPPED = "invokation_combo_stopped";
var EVENT_COMBO_RESTART = "invokation_combo_restart";
var EVENT_COMBO_PROGRESS = "invokation_combo_progress";
var EVENT_COMBO_STEP_ERROR = "invokation_combo_step_error";
var EVENT_COMBO_FINISHED = "invokation_combo_finished";

var EVENT_COMBAT_LOG_ABILITY_USED = "invokation_combat_log_ability_used";
var EVENT_COMBAT_LOG_CLEAR = "invokation_combat_log_clear";
var EVENT_COMBAT_LOG_CAPTURE_START = "invokation_combat_log_capture_start";
var EVENT_COMBAT_LOG_CAPTURE_STOP = "invokation_combat_log_capture_stop";

var CustomEvents = {
  Subscribe: function(name, fn) {
    return GameEvents.Subscribe(name, fn);
  },

  Unsubscribe: function(subscriptionId) {
    return GameEvents.Unsubscribe(subscriptionId);
  },

  SendServer: function(name, payload) {
    return GameEvents.SendCustomGameEventToServer(name, payload || {});
  },

  SendAll: function(name, payload) {
    return GameEvents.SendCustomGameEventToAllClients(name, payload || {});
  },

  SendPlayer: function(playerIndex, name, payload) {
    return GameEvents.SendCustomGameEventToClient(
      name,
      playerIndex,
      payload || {}
    );
  },

  SendClientSide: function(name, payload) {
    return GameEvents.SendEventClientSide(name, payload || {});
  },
};
