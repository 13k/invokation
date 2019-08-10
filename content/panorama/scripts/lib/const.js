"use strict";

(function(global /*, context */) {
  var EVENTS = {
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

  var INVOKER = {};

  INVOKER.ABILITY_QUAS = "invoker_quas";
  INVOKER.ABILITY_WEX = "invoker_wex";
  INVOKER.ABILITY_EXORT = "invoker_exort";
  INVOKER.ABILITY_INVOKE = "invoker_invoke";

  INVOKER.ORB_ABILITIES = {};
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_QUAS] = true;
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_WEX] = true;
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_EXORT] = true;

  var NET_TABLES = {
    DEFAULT: "invokation",
  };

  global.Const = {};
  global.Const.EVENTS = EVENTS;
  global.Const.INVOKER = INVOKER;
  global.Const.NET_TABLES = NET_TABLES;
  global.Const.FREESTYLE_COMBO_ID = "freestyle";
})(GameUI.CustomUIConfig(), this);
