"use strict";

(function(global /*, context */) {
  var INVOKER = {};

  INVOKER.ABILITY_QUAS = "invoker_quas";
  INVOKER.ABILITY_WEX = "invoker_wex";
  INVOKER.ABILITY_EXORT = "invoker_exort";
  INVOKER.ABILITY_INVOKE = "invoker_invoke";

  INVOKER.ORB_ABILITIES = {};
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_QUAS] = true;
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_WEX] = true;
  INVOKER.ORB_ABILITIES[INVOKER.ABILITY_EXORT] = true;

  global.Const = global.Const || {};
  global.Const.INVOKER = INVOKER;
})(GameUI.CustomUIConfig(), this);
