import snakeCase from "lodash-es/snakeCase";

import type { ComboId, ComboL10n, Properties, PropertiesL10n, StepId } from "./combo";
import { Property } from "./combo";
import { prefixOnce } from "./util/prefixOnce";

const L = $.Localize;

export enum Key {
  ViewerDescriptionFallback = "invk_viewer_description_lorem",
  ViewerStepDescriptionFallback = "invk_viewer_step_description_lorem",
  PickerDefaultOption = "invk_picker_filter_option_all",
  HudVisibilityPrefix = "invk_combo_hud_visibility",
  SplashPrefix = "invk_combo_splash",
  TagSelectOptionTextEntry = "invk_tag_select_option_text_entry",
  TagSelectPopupTextEntryTitle = "invk_tag_select_popup_text_entry_title",
}

export enum KeyPrefix {
  Combo = "invk_combo",
  ComboProperties = "invk_combo_properties",
  AbilityTooltip = "DOTA_Tooltip_ability_",
}

const KEY_PARAM_SEP = "__";

export function toKey(name: string): string {
  return prefixOnce(name, "#");
}

export function pKey(...parts: string[]): string {
  return toKey(parts.join(KEY_PARAM_SEP));
}

export interface AbilityTooltipKeyOptions {
  facet?: string | undefined;
}

export function abilityTooltipKey(ability: string, options?: AbilityTooltipKeyOptions): string {
  let key = KeyPrefix.AbilityTooltip + ability;
  const facet = options?.facet;

  if (facet != null) {
    key += `_facet_${facet}`;
  }

  return toKey(key);
}

export function comboKey<K extends keyof ComboL10n>(id: ComboId, attr: K | StepId): string {
  return pKey(KeyPrefix.Combo, id, snakeCase(attr.toString()));
}

export function comboPropKey<K extends keyof Properties>(prop: K, value: Properties[K]): string {
  return pKey(KeyPrefix.ComboProperties, snakeCase(prop), value.toString());
}

export interface LocalizeOptions {
  // fallback key
  fk?: string | undefined;
  panel?: Panel | undefined;
}

function localize(key: string, panel?: Panel): string {
  return panel != null ? L(key, panel) : L(key);
}

export function l(keyName: string, options?: LocalizeOptions): string {
  const key = toKey(keyName);
  let text = localize(key);

  if (options?.fk != null && text === key) {
    const fKey = toKey(options.fk);
    text = localize(fKey);
  }

  return text;
}

export function lp(...parts: string[]): string {
  return l(pKey(...parts));
}

export interface AbilityTooltipOptions {
  facet?: string | undefined;
  panel?: Panel | undefined;
}

export function abilityTooltip(ability: string, options?: AbilityTooltipOptions): string {
  const key = abilityTooltipKey(ability, { facet: options?.facet });

  return l(key, { panel: options?.panel });
}

export function comboAttrName<K extends keyof ComboL10n>(
  id: ComboId,
  attr: K | StepId,
  fk?: string,
): string {
  return l(comboKey(id, attr), { fk });
}

export function comboPropValue<K extends keyof Properties>(prop: K, value: Properties[K]): string {
  return l(comboPropKey(prop, value));
}

export function comboProp<K extends keyof Properties>(combo: Properties, prop: K): string {
  return comboPropValue(prop, combo[prop]);
}

export function comboProps(combo: Properties): PropertiesL10n {
  return Object.values(Property).reduce((props, prop) => {
    props[prop] = comboProp(combo, prop);
    return props;
  }, {} as PropertiesL10n);
}
