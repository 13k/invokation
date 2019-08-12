"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var INVOKER = global.Const.INVOKER;

  var ITEM_NAME_PATTERN = /^item_\w+$/;

  var module = module || {};
  var exports = (module.exports = module.exports || {});

  exports.IsLuaList = function(obj) {
    return (
      _.isPlainObject(obj) &&
      _.chain(obj)
        .keys()
        .find(parseInt)
        .value() != null
    );
  };

  // should support Lua lists with non-integer keys,
  // like the common construct (5.1) `{n=select("#", ...), ...}` or (>=5.2) `table.pack(...)`
  exports.LuaList = function(obj) {
    if (!exports.IsLuaList(obj)) {
      return obj;
    }

    var list = [];

    _.forOwn(obj, function(value, key) {
      var idx = parseInt(key);

      if (idx != null) {
        list[idx] = value;
      }
    });

    return _.compact(list);
  };

  exports.LuaListDeep = function(obj, options) {
    if (!_.isPlainObject(obj)) {
      return obj;
    }

    var recurse = _.chain(exports.LuaListDeep)
      .partialRight(options)
      .unary()
      .value();

    if (exports.IsLuaList(obj)) {
      return _.map(exports.LuaList(obj), recurse);
    }

    options = options || {};

    if (options.inplace) {
      return _.transform(
        obj,
        function(result, value, key) {
          result[key] = recurse(value);
        },
        obj
      );
    }

    return _.mapValues(obj, recurse);
  };

  exports.Prefixer = function(string, prefix) {
    if (!_.startsWith(string, prefix)) {
      string = prefix + string;
    }

    return string;
  };

  exports.FlattenObjectWith = function(object, path, fn) {
    path = path || [];
    fn = fn || _.identity;

    var transform = function(result, value, key) {
      var subPath = _.concat(path, [key]);
      var fullKey = _.join(subPath, ".");

      if (_.isPlainObject(value)) {
        _.assign(result, exports.FlattenObjectWith(value, subPath, fn));
      } else {
        result[fullKey] = fn(value);
      }
    };

    return _.transform(object, transform, {});
  };

  exports.IsOrbAbility = function(abilityName) {
    return abilityName in INVOKER.ORB_ABILITIES;
  };

  exports.IsInvocationAbility = function(abilityName) {
    return exports.IsOrbAbility(abilityName) || abilityName == INVOKER.ABILITY_INVOKE;
  };

  exports.IsItemAbility = function(abilityName) {
    return !!abilityName.match(ITEM_NAME_PATTERN);
  };

  // TODO: handle errors
  exports.CreatePanelWithLayout = function(parent, id, layout) {
    var panel = $.CreatePanel("Panel", parent, id);
    panel.BLoadLayout(layout, false, false);
    return panel;
  };

  // TODO: handle errors
  exports.CreatePanelWithLayoutSnippet = function(parent, id, snippet) {
    var panel = $.CreatePanel("Panel", parent, id);
    panel.BLoadLayoutSnippet(snippet);
    return panel;
  };

  // TODO: handle errors
  exports.CreateAbilityImage = function(parent, id, abilityName) {
    var image = $.CreatePanel("DOTAAbilityImage", parent, id);
    image.abilityname = abilityName;
    return image;
  };

  // TODO: handle errors
  exports.CreateItemImage = function(parent, id, itemName) {
    var image = $.CreatePanel("DOTAItemImage", parent, id);
    image.itemname = itemName;
    return image;
  };

  global.Util = module.exports;
})(GameUI.CustomUIConfig(), this);
