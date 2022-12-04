import type * as Combo from "./combo";

const {
  lodash: _,

  Const: { COMBO_PROPERTIES },
  Util: { prefixer },
} = CustomUIConfig;

enum KeyPrefix {
  Combo = "invokation_combo",
  ComboProperties = "invokation_combo_properties",
  ShopGroup = "DOTA_",
  ShopCategory = "DOTA_SUBSHOP_",
  AbilityTooltip = "DOTA_Tooltip_ability_",
}

enum Key {
  ViewerDescriptionFallback = "invokation_viewer_description_lorem",
  ViewerStepDescriptionFallback = "invokation_viewer_step_description_lorem",
  PickerDefaultOption = "invokation_picker_filter_option_all",
  HudVisibilityPrefix = "invokation_combo_hud_visibility",
  SplashPrefix = "invokation_combo_splash",
  TagSelectOptionTextEntry = "invokation_tag_select_option_text_entry",
  TagSelectPopupTextEntryTitle = "invokation_tag_select_popup_text_entry_title",
}

const KEY_PARAM_SEP = "__";

const module = {
  Key,

  key: (key: string): string => prefixer(key, "#"),
  pKey: (...parts: string[]): string => module.key(parts.join(KEY_PARAM_SEP)),

  shopGroupKey: (group: string): string =>
    module.key(`${KeyPrefix.ShopGroup}${_.capitalize(group)}`),

  shopCategoryKey: (category: string): string =>
    module.key(`${KeyPrefix.ShopCategory}${_.toUpper(category)}`),

  abilityTooltipKey: (ability: string): string =>
    module.key(`${KeyPrefix.AbilityTooltip}${ability}`),

  comboKey: <K extends keyof Combo.ComboL10n>(id: Combo.ID, attr: K | Combo.StepID): string =>
    module.pKey(KeyPrefix.Combo, id, _.snakeCase(_.toString(attr))),

  comboPropKey: <K extends keyof Combo.Properties>(prop: K, value: Combo.Properties[K]): string =>
    module.pKey(KeyPrefix.ComboProperties, _.snakeCase(prop), _.toString(value)),

  l(key: string, { fbKey, panel }: { fbKey?: string; panel?: Panel } = {}): string {
    const localize = (k: string) => (panel ? $.Localize(k, panel) : $.Localize(k));

    key = module.key(key);
    let text = localize(key);

    if (fbKey && text === key) {
      fbKey = module.key(fbKey);
      text = localize(fbKey);
    }

    return text;
  },

  lp: (...parts: string[]): string => module.l(module.pKey(...parts)),

  comboAttrName: <K extends keyof Combo.ComboL10n>(
    id: Combo.ID,
    attr: K | Combo.StepID,
    fbKey?: string
  ): string => module.l(module.comboKey(id, attr), { fbKey }),

  comboPropValue: <K extends keyof Combo.Properties>(prop: K, value: Combo.Properties[K]): string =>
    module.l(module.comboPropKey(prop, value)),

  comboProp: <K extends keyof Combo.Properties>(combo: Combo.Properties, prop: K): string =>
    module.comboPropValue(prop, combo[prop]),

  comboProps: (combo: Combo.Properties): Combo.PropertiesL10n =>
    _.mapValues(COMBO_PROPERTIES, (_v, prop) =>
      module.comboProp(combo, prop as keyof Combo.Properties)
    ),

  shopGroup: (group: string): string => module.l(module.shopGroupKey(group)),
  shopCategory: (category: string): string => module.l(module.shopCategoryKey(category)),

  abilityTooltip: (ability: string, panel: Panel): string =>
    module.l(module.abilityTooltipKey(ability), { panel }),
};

export type L10n = typeof module;
export type { Key };

CustomUIConfig.L10n = module;
