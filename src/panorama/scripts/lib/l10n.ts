/// <reference path="./vendor/lodash.js" />
/// <reference path="combo.ts" />
/// <reference path="util.ts" />

namespace invk {
  export namespace L10n {
    const {
      Combo: { Property },
      Util: { prefixer },
    } = invk;

    export enum Key {
      ViewerDescriptionFallback = "invokation_viewer_description_lorem",
      ViewerStepDescriptionFallback = "invokation_viewer_step_description_lorem",
      PickerDefaultOption = "invokation_picker_filter_option_all",
      HudVisibilityPrefix = "invokation_combo_hud_visibility",
      SplashPrefix = "invokation_combo_splash",
      TagSelectOptionTextEntry = "invokation_tag_select_option_text_entry",
      TagSelectPopupTextEntryTitle = "invokation_tag_select_popup_text_entry_title",
    }

    export enum KeyPrefix {
      Combo = "invokation_combo",
      ComboProperties = "invokation_combo_properties",
      ShopGroup = "DOTA_",
      ShopCategory = "DOTA_SUBSHOP_",
      AbilityTooltip = "DOTA_Tooltip_ability_",
    }

    const KEY_PARAM_SEP = "__";

    export function key(k: string): string {
      return prefixer(k, "#");
    }

    export function pKey(...parts: string[]): string {
      return key(parts.join(KEY_PARAM_SEP));
    }

    export function shopGroupKey(group: string): string {
      return key(`${KeyPrefix.ShopGroup}${_.capitalize(group)}`);
    }

    export function shopCategoryKey(category: string): string {
      return key(`${KeyPrefix.ShopCategory}${_.toUpper(category)}`);
    }

    export function abilityTooltipKey(ability: string): string {
      return key(`${KeyPrefix.AbilityTooltip}${ability}`);
    }

    export function comboKey<K extends keyof Combo.ComboL10n>(
      id: Combo.ID,
      attr: K | Combo.StepID
    ): string {
      return pKey(KeyPrefix.Combo, id, _.snakeCase(_.toString(attr)));
    }

    export function comboPropKey<K extends keyof Combo.Properties>(
      prop: K,
      value: Combo.Properties[K]
    ): string {
      return pKey(KeyPrefix.ComboProperties, _.snakeCase(prop), _.toString(value));
    }

    export function l(
      k: string,
      { fk, panel }: { fk?: string | undefined; panel?: Panel } = {}
    ): string {
      const loc = (k: string) => (panel ? $.Localize(k, panel) : $.Localize(k));

      k = key(k);

      let text = loc(k);

      if (fk && text === k) {
        fk = key(fk);
        text = loc(fk);
      }

      return text;
    }

    export function lp(...parts: string[]): string {
      return l(pKey(...parts));
    }

    export function comboAttrName<K extends keyof Combo.ComboL10n>(
      id: Combo.ID,
      attr: K | Combo.StepID,
      fk?: string
    ): string {
      return l(comboKey(id, attr), { fk });
    }

    export function comboPropValue<K extends keyof Combo.Properties>(
      prop: K,
      value: Combo.Properties[K]
    ): string {
      return l(comboPropKey(prop, value));
    }

    export function comboProp<K extends keyof Combo.Properties>(
      combo: Combo.Properties,
      prop: K
    ): string {
      return comboPropValue(prop, combo[prop]);
    }

    export function comboProps(combo: Combo.Properties): Combo.PropertiesL10n {
      return _.transform(
        Property,
        (props, p) => (props[p] = comboProp(combo, p)),
        {} as Combo.PropertiesL10n
      );
    }

    export function shopGroup(group: string): string {
      return l(shopGroupKey(group));
    }

    export function shopCategory(category: string): string {
      return l(shopCategoryKey(category));
    }

    export function abilityTooltip(ability: string, panel: Panel): string {
      return l(abilityTooltipKey(ability), { panel });
    }
  }
}
