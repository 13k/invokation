import { reduce, snakeCase, startCase, toUpper } from "lodash";
import { ShopCategory, ShopGroup } from "./const/shop";

const KEY_PARAM_SEP = "__";
const COMBO_KEY_PREFIX = "invokation_combo";
const COMBO_PROPERTIES_PREFIX = "invokation_combo_properties";

const SHOP_GROUP_KEY_PREFIX = "DOTA_Shop_Category_";
const SHOP_CATEGORY_KEY_PREFIX = "DOTA_SUBSHOP_";

const ABILITY_TOOLTIP_KEY_PREFIX = "DOTA_Tooltip_ability_";

export const shopGroupKey = (group: ShopGroup): string =>
  `${SHOP_GROUP_KEY_PREFIX}${startCase(group)}`;

export const shopCategoryKey = (category: ShopCategory): string =>
  `${SHOP_CATEGORY_KEY_PREFIX}${toUpper(String(category))}`;

export const abilityTooltipKey = (ability: string): string =>
  `${ABILITY_TOOLTIP_KEY_PREFIX}${ability}`;

export const parameterizedKey = (prefix: string, ...params: string[]): string =>
  [prefix, ...params].join(KEY_PARAM_SEP);

export const comboKey = ({ id }: invk.Combo.L10nSlice, ...params: string[]): string =>
  parameterizedKey(COMBO_KEY_PREFIX, String(id), ...params);

export const comboPropertiesKey = (
  property: invk.Combo.L10nProperty,
  ...params: string[]
): string => parameterizedKey(COMBO_PROPERTIES_PREFIX, snakeCase(property), ...params);

export const localizeFallback = (key: string, fallbackKey: string): string => {
  const l10n = $.Localize(key);
  return l10n === key ? $.Localize(fallbackKey) : l10n;
};

export const localizeParameterized = (prefix: string, ...params: string[]): string =>
  $.Localize(parameterizedKey(prefix, ...params));

export const localizeComboKey = (combo: invk.Combo.L10nSlice, ...params: string[]): string =>
  $.Localize(comboKey(combo, ...params));

export const localizeComboPropertiesKey = (
  property: invk.Combo.L10nProperty,
  ...params: string[]
): string => $.Localize(comboPropertiesKey(property, ...params));

export const localizeComboProperty = (
  combo: invk.Combo.L10nSlice,
  property: invk.Combo.L10nProperty
): string => localizeComboPropertiesKey(property, String(combo[property]));

export const localizeComboProperties = (combo: invk.Combo.L10nSlice): invk.Combo.ComboL10n =>
  reduce(
    Object.values(invk.Combo.L10nProperty),
    (l10n: invk.Combo.ComboL10n, property: invk.Combo.L10nProperty): invk.Combo.ComboL10n => {
      l10n[property] = localizeComboProperty(combo, property);
      return l10n;
    },
    {} as invk.Combo.ComboL10n
  );

export const localizeShopGroup = (group: ShopGroup): string => $.Localize(shopGroupKey(group));

export const localizeShopCategory = (category: ShopCategory): string =>
  $.Localize(shopCategoryKey(category));

export const localizeAbilityTooltip = (ability: string, panel: PanelBase): string =>
  $.Localize(abilityTooltipKey(ability), panel);
