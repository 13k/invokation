"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var INVOKER = global.Const.INVOKER;

  var ITEM_NAME_PATTERN = /^item_\w+$/;

  var module = {};

  module.LuaListTableToArray = function(table) {
    return _.chain(table)
      .map(function(v, k) {
        return parseInt(k) && v;
      })
      .compact()
      .value();
  };

  module.StringLexicalCompare = function(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
  };

  module.Prefixer = function(string, prefix) {
    if (!_.startsWith(string, prefix)) {
      string = prefix + string;
    }

    return string;
  };

  module.IsOrbAbility = function(abilityName) {
    return abilityName in INVOKER.ORB_ABILITIES;
  };

  module.IsInvocationAbility = function(abilityName) {
    return module.IsOrbAbility(abilityName) || abilityName == INVOKER.ABILITY_INVOKE;
  };

  module.IsItemAbility = function(abilityName) {
    return !!abilityName.match(ITEM_NAME_PATTERN);
  };

  // TODO: handle errors
  module.CreatePanelWithLayout = function(parent, id, layout) {
    var panel = $.CreatePanel("Panel", parent, id);
    panel.BLoadLayout(layout, false, false);
    return panel;
  };

  // TODO: handle errors
  module.CreatePanelWithLayoutSnippet = function(parent, id, snippet) {
    var panel = $.CreatePanel("Panel", parent, id);
    panel.BLoadLayoutSnippet(snippet);
    return panel;
  };

  // TODO: handle errors
  module.CreateAbilityImage = function(parent, id, abilityName) {
    var image = $.CreatePanel("DOTAAbilityImage", parent, id);
    image.abilityname = abilityName;
    return image;
  };

  // TODO: handle errors
  module.CreateItemImage = function(parent, id, itemName) {
    var image = $.CreatePanel("DOTAItemImage", parent, id);
    image.itemname = itemName;
    return image;
  };

  global.Util = module;
})(GameUI.CustomUIConfig(), this);
