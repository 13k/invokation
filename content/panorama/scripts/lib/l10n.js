"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var Prefixer = global.Util.Prefixer;

  var COMBO_PROPERTIES = global.Const.COMBO_PROPERTIES;

  var module = module || {};
  var exports = (module.exports = module.exports || {});

  var KEY_PREFIX = "#";
  var KEY_PARAM_SEP = "__";
  var COMBO_KEY_PREFIX = "invokation_combo";
  var COMBO_KEYS = ["name", "description"];
  var COMBO_PROPERTIES_PREFIX = "invokation_combo_properties";

  var SHOP_GROUP_KEY_PREFIX = "DOTA_";
  var SHOP_CATEGORY_KEY_PREFIX = "DOTA_SUBSHOP_";

  var keyPrefixer = _.partialRight(Prefixer, KEY_PREFIX);
  var keyUnprefixer = _.partialRight(_.trimStart, KEY_PREFIX);

  exports.ShopGroupKey = function(group) {
    return keyPrefixer(SHOP_GROUP_KEY_PREFIX + _.capitalize(group));
  };

  exports.ShopCategoryKey = function(category) {
    return keyPrefixer(SHOP_CATEGORY_KEY_PREFIX + String(category).toUpperCase());
  };

  exports.ParameterizedKey = function(prefix, params) {
    prefix = keyPrefixer(prefix);

    return _.chain([prefix])
      .concat(params)
      .join(KEY_PARAM_SEP)
      .value();
  };

  exports.ComboKey = function(combo, params) {
    params = _.concat([combo.id], params || []);
    return exports.ParameterizedKey(COMBO_KEY_PREFIX, params);
  };

  exports.ComboPropertiesKey = function(property, params) {
    params = _.concat([_.snakeCase(property)], params || []);
    return exports.ParameterizedKey(COMBO_PROPERTIES_PREFIX, params);
  };

  exports.LocalizeFallback = function(key, fallbackKey) {
    key = keyPrefixer(key);
    fallbackKey = keyPrefixer(fallbackKey);

    var id = keyUnprefixer(key);
    var l10n = $.Localize(key);

    if (l10n === id) {
      l10n = $.Localize(fallbackKey);
    }

    return l10n;
  };

  exports.LocalizeParameterized = function(prefix, params) {
    return $.Localize(exports.ParameterizedKey(prefix, params));
  };

  exports.LocalizeComboKey = function(combo, params) {
    return $.Localize(exports.ComboKey(combo, params));
  };

  exports.LocalizeComboKeys = function(combo, keys) {
    keys = keys || COMBO_KEYS;

    if (_.isArray(keys)) {
      var transformKeys = function(keys, key) {
        keys[key] = exports.LocalizeComboKey(combo, key);
      };

      return _.transform(keys, transformKeys, {});
    }

    return exports.LocalizeComboKey(combo, keys);
  };

  exports.LocalizeComboPropertiesKey = function(property, params) {
    return $.Localize(exports.ComboPropertiesKey(property, params));
  };

  exports.LocalizeComboProperty = function(combo, property) {
    return exports.LocalizeComboPropertiesKey(property, combo[property]);
  };

  exports.LocalizeComboProperties = function(combo) {
    var comboPropertyL10n = _.chain(exports.LocalizeComboProperty)
      .partial(combo)
      .rearg([1, 0])
      .value();

    return _.mapValues(COMBO_PROPERTIES, comboPropertyL10n);
  };

  exports.LocalizeShopGroup = function(group) {
    return $.Localize(exports.ShopGroupKey(group));
  };

  exports.LocalizeShopCategory = function(category) {
    return $.Localize(exports.ShopCategoryKey(category));
  };

  global.L10n = module.exports;
})(GameUI.CustomUIConfig(), this);
