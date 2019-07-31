"use strict";

(function(C) {
  var module = {};

  module.LuaListTableToArray = function(table) {
    var result = [];

    for (var key in table) {
      var i = parseInt(key);

      if (i) {
        result[i] = table[key];
      }
    }

    result = result.filter(function(elem) {
      return elem !== undefined && elem != null;
    });

    return result;
  };

  module.StringLexicalCompare = function(left, right) {
    if (left < right) {
      return -1;
    }

    if (left > right) {
      return 1;
    }

    return 0;
  };

  module.IsOrbAbility = function(abilityName) {
    return abilityName in C.Const.INVOKER.ORB_ABILITIES;
  };

  module.IsInvocationAbility = function(abilityName) {
    return module.IsOrbAbility(abilityName) || abilityName == C.Const.INVOKER.ABILITY_INVOKE;
  };

  var ITEM_NAME_PATTERN = /^item_\w+$/;

  module.IsItemAbility = function(abilityName) {
    return !!abilityName.match(ITEM_NAME_PATTERN);
  };

  C.Util = module;
})(GameUI.CustomUIConfig());
