/// <reference path="combo.ts" />
/// <reference path="util.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace l10n {
    import ComboID = invk.combo.ComboID;
    import ComboL10n = invk.combo.ComboL10n;
    import Properties = invk.combo.Properties;
    import PropertiesL10n = invk.combo.PropertiesL10n;
    import Property = invk.combo.Property;
    import StepID = invk.combo.StepID;
    import prefixOnce = invk.util.prefixOnce;
    import snakeCase = invk.util.snakeCase;

    const L = $.Localize;

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
      AbilityTooltip = "DOTA_Tooltip_ability_",
    }

    const KEY_PARAM_SEP = "__";

    export function toKey(name: string): string {
      return prefixOnce(name, "#");
    }

    export function pKey(...parts: string[]): string {
      return toKey(parts.join(KEY_PARAM_SEP));
    }

    export function abilityTooltipKey(ability: string): string {
      return toKey(KeyPrefix.AbilityTooltip + ability);
    }

    export function comboKey<K extends keyof ComboL10n>(id: ComboID, attr: K | StepID): string {
      return pKey(KeyPrefix.Combo, id, snakeCase(attr.toString()));
    }

    export function comboPropKey<K extends keyof Properties>(
      prop: K,
      value: Properties[K],
    ): string {
      return pKey(KeyPrefix.ComboProperties, snakeCase(prop), value.toString());
    }

    export interface LocalizeOptions {
      fk?: string | undefined;
      panel?: Panel | undefined;
    }

    export function l(keyName: string, { fk, panel }: LocalizeOptions = {}): string {
      const loc = (key: string): string => (panel ? L(key, panel) : L(key));
      const key = toKey(keyName);
      let text = loc(keyName);

      if (fk && text === key) {
        fk = toKey(fk);
        text = loc(fk);
      }

      return text;
    }

    export function lp(...parts: string[]): string {
      return l(pKey(...parts));
    }

    export function comboAttrName<K extends keyof ComboL10n>(
      id: ComboID,
      attr: K | StepID,
      fk?: string,
    ): string {
      return l(comboKey(id, attr), { fk });
    }

    export function comboPropValue<K extends keyof Properties>(
      prop: K,
      value: Properties[K],
    ): string {
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

    export function abilityTooltip(ability: string, panel?: Panel): string {
      return l(abilityTooltipKey(ability), { panel });
    }
  }
}
