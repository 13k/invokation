"use strict";

(function (global /*, context */) {
  var _ = global.lodash;

  var COMBO_PROPERTIES = global.Const.COMBO_PROPERTIES;

  var module = module || {};
  var exports = (module.exports = module.exports || {});

  var KEY_PARAM_SEP = "__";
  var COMBO_KEY_PREFIX = "invokation_combo";
  var COMBO_KEYS = ["name", "description"];
  var COMBO_PROPERTIES_PREFIX = "invokation_combo_properties";

  var SHOP_GROUP_KEY_PREFIX = "DOTA_";
  var SHOP_CATEGORY_KEY_PREFIX = "DOTA_SUBSHOP_";

  var ABILITY_TOOLTIP_KEY_PREFIX = "DOTA_Tooltip_ability_";

  exports.Key = function (key) {
    if (key[0] !== "#") {
      key = "#" + key;
    }

    return key;
  };

  exports.ShopGroupKey = function (group) {
    return exports.Key(SHOP_GROUP_KEY_PREFIX + _.capitalize(group));
  };

  exports.ShopCategoryKey = function (category) {
    return exports.Key(SHOP_CATEGORY_KEY_PREFIX + _.toUpper(String(category)));
  };

  exports.AbilityTooltipKey = function (ability) {
    return exports.Key(ABILITY_TOOLTIP_KEY_PREFIX + ability);
  };

  exports.ParameterizedKey = function (prefix, params) {
    var key = _.chain([prefix]).concat(params).join(KEY_PARAM_SEP).value();

    return exports.Key(key);
  };

  exports.ComboKey = function (combo, params) {
    params = _.concat([combo.id], params || []);

    return exports.ParameterizedKey(COMBO_KEY_PREFIX, params);
  };

  exports.ComboPropertiesKey = function (property, params) {
    params = _.concat([_.snakeCase(property)], params || []);

    return exports.ParameterizedKey(COMBO_PROPERTIES_PREFIX, params);
  };

  exports.Localize = function (key, panel) {
    key = exports.Key(key);

    if (panel) {
      return $.Localize(key, panel);
    }

    return $.Localize(key);
  };

  exports.LocalizeFallback = function (key, fallbackKey, panel) {
    key = exports.Key(key);

    var l10n = exports.Localize(key, panel);

    return l10n === key ? exports.Localize(fallbackKey, panel) : l10n;
  };

  exports.LocalizeParameterized = function (prefix, params) {
    return exports.Localize(exports.ParameterizedKey(prefix, params));
  };

  exports.LocalizeComboKey = function (combo, params) {
    return exports.Localize(exports.ComboKey(combo, params));
  };

  exports.LocalizeComboKeys = function (combo, keys) {
    keys = keys || COMBO_KEYS;

    if (_.isArray(keys)) {
      var transformKeys = function (keys, key) {
        keys[key] = exports.LocalizeComboKey(combo, key);
      };

      return _.transform(keys, transformKeys, {});
    }

    return exports.LocalizeComboKey(combo, keys);
  };

  exports.LocalizeComboPropertiesKey = function (property, params) {
    return exports.Localize(exports.ComboPropertiesKey(property, params));
  };

  exports.LocalizeComboProperty = function (combo, property) {
    return exports.LocalizeComboPropertiesKey(property, combo[property]);
  };

  exports.LocalizeComboProperties = function (combo) {
    var comboPropertyL10n = _.chain(exports.LocalizeComboProperty)
      .partial(combo)
      .rearg([1, 0])
      .value();

    return _.mapValues(COMBO_PROPERTIES, comboPropertyL10n);
  };

  exports.LocalizeShopGroup = function (group) {
    return exports.Localize(exports.ShopGroupKey(group));
  };

  exports.LocalizeShopCategory = function (category) {
    return exports.Localize(exports.ShopCategoryKey(category));
  };

  exports.LocalizeAbilityTooltip = function (ability, panel) {
    return exports.Localize(exports.AbilityTooltipKey(ability), panel);
  };

  global.L10n = module.exports;
})(GameUI.CustomUIConfig(), this);
