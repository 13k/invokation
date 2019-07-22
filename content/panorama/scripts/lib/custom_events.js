"use strict";

(function(C) {
  C.EVENTS = {
    // combo viewer
    VIEWER_RENDER: "invokation_viewer_render",
    // combos
    COMBOS_RELOAD: "invokation_combos_reload",
    COMBO_START: "invokation_combo_start",
    COMBO_STARTED: "invokation_combo_started",
    COMBO_STOP: "invokation_combo_stop",
    COMBO_STOPPED: "invokation_combo_stopped",
    COMBO_RESTART: "invokation_combo_restart",
    COMBO_PROGRESS: "invokation_combo_progress",
    COMBO_STEP_ERROR: "invokation_combo_step_error",
    COMBO_FINISHED: "invokation_combo_finished",
    // combat log
    COMBAT_LOG_ABILITY_USED: "invokation_combat_log_ability_used",
    COMBAT_LOG_CLEAR: "invokation_combat_log_clear",
    COMBAT_LOG_CAPTURE_START: "invokation_combat_log_capture_start",
    COMBAT_LOG_CAPTURE_STOP: "invokation_combat_log_capture_stop",
  };

  var module = {};

  module.Subscribe = function(name, fn) {
    return GameEvents.Subscribe(name, fn);
  };

  module.Unsubscribe = function(subscriptionId) {
    return GameEvents.Unsubscribe(subscriptionId);
  };

  module.SendServer = function(name, payload) {
    return GameEvents.SendCustomGameEventToServer(name, payload || {});
  };

  module.SendAll = function(name, payload) {
    return GameEvents.SendCustomGameEventToAllClients(name, payload || {});
  };

  module.SendPlayer = function(playerIndex, name, payload) {
    return GameEvents.SendCustomGameEventToClient(
      name,
      playerIndex,
      payload || {}
    );
  };

  module.SendClientSide = function(name, payload) {
    return GameEvents.SendEventClientSide(name, payload || {});
  };

  C.CustomEvents = module;
})(GameUI.CustomUIConfig());
