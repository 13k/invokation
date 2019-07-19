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

  var ORB_ABILITIES = {
    invoker_quas: true,
    invoker_wex: true,
    invoker_exort: true,
  };

  module.IsOrbAbility = function(abilityName) {
    return abilityName in ORB_ABILITIES;
  };

  var ITEM_NAME_PATTERN = /^item_[a-z_]+$/;

  module.IsItemAbility = function(abilityName) {
    return !!abilityName.match(ITEM_NAME_PATTERN);
  };

  C.Util = module;
})(GameUI.CustomUIConfig());
