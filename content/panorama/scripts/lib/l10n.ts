import { snakeCase, startCase, toUpper, transform } from "lodash";

import type { ComboL10n, L10nSlice } from "./combo";
import { L10nProperty, TraitProperty } from "./combo";
import type { ShopCategory, ShopGroup } from "./dota";

const KEY_PARAM_SEP = "__";
const COMBO_KEY_PREFIX = "invokation_combo";
const COMBO_PROPERTIES_PREFIX = "invokation_combo_properties";

const SHOP_GROUP_KEY_PREFIX = "DOTA_Shop_Category_";
const SHOP_CATEGORY_KEY_PREFIX = "DOTA_SUBSHOP_";

const ABILITY_TOOLTIP_KEY_PREFIX = "DOTA_Tooltip_ability_";

export const L10N_TRAIT_PROPERTIES = {
  [TraitProperty.Specialty]: L10nProperty.Specialty,
  [TraitProperty.Stance]: L10nProperty.Stance,
  [TraitProperty.DamageRating]: L10nProperty.DamageRating,
  [TraitProperty.DifficultyRating]: L10nProperty.DifficultyRating,
};

export function shopGroupKey(group: ShopGroup): string {
  return `${SHOP_GROUP_KEY_PREFIX}${startCase(group)}`;
}

export function shopCategoryKey(category: ShopCategory): string {
  return `${SHOP_CATEGORY_KEY_PREFIX}${toUpper(String(category))}`;
}

export function abilityTooltipKey(ability: string): string {
  return `${ABILITY_TOOLTIP_KEY_PREFIX}${ability}`;
}

export function parameterizedKey(prefix: string, ...params: string[]): string {
  return [prefix, ...params].join(KEY_PARAM_SEP);
}

export function comboKey({ id }: L10nSlice, ...params: string[]): string {
  return parameterizedKey(COMBO_KEY_PREFIX, String(id), ...params);
}

export function comboPropertiesKey(property: L10nProperty, ...params: string[]): string {
  return parameterizedKey(COMBO_PROPERTIES_PREFIX, snakeCase(property), ...params);
}

export function localizeFallback(key: string, fallbackKey: string): string {
  const l10n = $.Localize(key);
  return l10n === key ? $.Localize(fallbackKey) : l10n;
}

export function localizeParameterized(prefix: string, ...params: string[]): string {
  return $.Localize(parameterizedKey(prefix, ...params));
}

export function localizeComboKey(combo: L10nSlice, ...params: string[]): string {
  return $.Localize(comboKey(combo, ...params));
}

export function localizeComboPropertiesKey(property: L10nProperty, ...params: string[]): string {
  return $.Localize(comboPropertiesKey(property, ...params));
}

export function localizeComboProperty(combo: L10nSlice, property: L10nProperty): string {
  return localizeComboPropertiesKey(property, String(combo[property]));
}

export function localizeComboProperties(combo: L10nSlice): ComboL10n {
  return transform(
    Object.values(L10nProperty),
    (l10n: ComboL10n, property: L10nProperty) => {
      l10n[property] = localizeComboProperty(combo, property);
    },
    {} as ComboL10n
  );
}

export function localizeShopGroup(group: ShopGroup): string {
  return $.Localize(shopGroupKey(group));
}

export function localizeShopCategory(category: ShopCategory): string {
  return $.Localize(shopCategoryKey(category));
}

export function localizeAbilityTooltip(ability: string, panel: PanelBase): string {
  return $.Localize(abilityTooltipKey(ability), panel);
}
