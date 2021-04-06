"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;
  const { COMBO_PROPERTIES } = global.Const;

  const KEY_PARAM_SEP = "__";
  const COMBO_KEY_PREFIX = "invokation_combo";
  const COMBO_KEYS = ["name", "description"];
  const COMBO_PROPERTIES_PREFIX = "invokation_combo_properties";

  const SHOP_GROUP_KEY_PREFIX = "DOTA_";
  const SHOP_CATEGORY_KEY_PREFIX = "DOTA_SUBSHOP_";

  const ABILITY_TOOLTIP_KEY_PREFIX = "DOTA_Tooltip_ability_";

  const L10n = {};

  L10n.ShopGroupKey = (group) => `${SHOP_GROUP_KEY_PREFIX}${_.capitalize(group)}`;
  L10n.ShopCategoryKey = (category) => `${SHOP_CATEGORY_KEY_PREFIX}${_.toUpper(String(category))}`;
  L10n.AbilityTooltipKey = (ability) => `${ABILITY_TOOLTIP_KEY_PREFIX}${ability}`;

  L10n.ParameterizedKey = (prefix, params) =>
    _.chain([prefix]).concat(params).join(KEY_PARAM_SEP).value();

  L10n.ComboKey = (combo, params) =>
    L10n.ParameterizedKey(COMBO_KEY_PREFIX, _.concat([combo.id], params || []));

  L10n.ComboPropertiesKey = (property, params) =>
    L10n.ParameterizedKey(COMBO_PROPERTIES_PREFIX, _.concat([_.snakeCase(property)], params || []));

  L10n.LocalizeFallback = (key, fallbackKey) => {
    const l10n = $.Localize(key);
    return l10n === key ? $.Localize(fallbackKey) : l10n;
  };

  L10n.LocalizeParameterized = (prefix, params) =>
    $.Localize(L10n.ParameterizedKey(prefix, params));

  L10n.LocalizeComboKey = (combo, params) => $.Localize(L10n.ComboKey(combo, params));

  L10n.LocalizeComboKeys = (combo, keys) => {
    keys = keys || COMBO_KEYS;

    if (_.isArray(keys)) {
      return _.transform(
        keys,
        (keys, key) => {
          keys[key] = L10n.LocalizeComboKey(combo, key);
        },
        {}
      );
    }

    return L10n.LocalizeComboKey(combo, keys);
  };

  L10n.LocalizeComboPropertiesKey = (property, params) =>
    $.Localize(L10n.ComboPropertiesKey(property, params));

  L10n.LocalizeComboProperty = (combo, property) =>
    L10n.LocalizeComboPropertiesKey(property, combo[property]);

  L10n.LocalizeComboProperties = (combo) => {
    const comboPropertyL10n = _.chain(L10n.LocalizeComboProperty)
      .partial(combo)
      .rearg([1, 0])
      .value();

    return _.mapValues(COMBO_PROPERTIES, comboPropertyL10n);
  };

  L10n.LocalizeShopGroup = (group) => $.Localize(L10n.ShopGroupKey(group));
  L10n.LocalizeShopCategory = (category) => $.Localize(L10n.ShopCategoryKey(category));
  L10n.LocalizeAbilityTooltip = (ability, panel) =>
    $.Localize(L10n.AbilityTooltipKey(ability), panel);

  global.L10n = L10n;
})(GameUI.CustomUIConfig(), this);
