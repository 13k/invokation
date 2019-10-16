"use strict";

(function(global /*, context */) {
  var _ = global.lodash;

  var INVOKER = global.Const.INVOKER;
  var TALENTS = global.Const.TALENTS;

  var ITEM_NAME_PATTERN = /^item_\w+$/;

  var module = module || {};
  var exports = (module.exports = module.exports || {});

  exports.IsLuaArray = function(obj) {
    return (
      _.isPlainObject(obj) &&
      _.chain(obj)
        .keys()
        .find(function(key) {
          return parseInt(key);
        })
        .value() != null
    );
  };

  // should support Lua arrays with non-integer keys,
  // like the common construct (5.1) `{n=select("#", ...), ...}` or (>=5.2) `table.pack(...)`
  exports.LuaArray = function(obj) {
    if (!exports.IsLuaArray(obj)) {
      return obj;
    }

    return _.reduce(
      obj,
      function(list, value, key) {
        var idx = parseInt(key);

        if (_.isInteger(idx)) {
          list[idx - 1] = value;
        }

        return list;
      },
      []
    );
  };

  exports.LuaArrayDeep = function(obj, options) {
    options = options || {};

    var recurse = _.chain(exports.LuaArrayDeep)
      .partialRight(options)
      .unary()
      .value();

    if (exports.IsLuaArray(obj)) {
      return _.map(exports.LuaArray(obj), recurse);
    }

    if (_.isArray(obj)) {
      return _.map(obj, recurse);
    }

    if (_.isPlainObject(obj)) {
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
    }

    return obj;
  };

  exports.LuaIndexArray = function(obj) {
    return _.map(exports.LuaArray(obj), _.partial(_.add, -1));
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

  exports.CreateAbilityOrItemImage = function(parent, id, abilityName) {
    if (exports.IsItemAbility(abilityName)) {
      return exports.CreateItemImage(parent, id, abilityName);
    }

    return exports.CreateAbilityImage(parent, id, abilityName);
  };

  exports.ElementParams = function(params) {
    if (_.isPlainObject(params)) {
      params = _.chain(params)
        .transform(function(pairs, value, key) {
          pairs.push(String(key) + "=" + String(value));
        }, [])
        .join("&")
        .value();
    }

    return params;
  };

  exports.TalentConstKey = function(level, side) {
    return "L" + _.toString(level) + "_" + _.toUpper(side);
  };

  exports.TalentConstValue = function(level, side) {
    return TALENTS[exports.TalentConstKey(level, side)];
  };

  exports.IsTalentSelected = function(level, side, selected) {
    return (exports.TalentConstValue(level, side) & selected) > 0;
  };

  exports.TalentArrayIndexToLevel = function(i) {
    return (Math.floor(i / 2) + 2) * 5;
  };

  exports.TalentArrayIndexToSide = function(i) {
    return i % 2 === 0 ? "right" : "left";
  };

  global.Util = module.exports;
})(GameUI.CustomUIConfig(), this);
