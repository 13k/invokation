import "core-js";

import type { CombosCollection } from "./combo/combos_collection";
import * as cev from "./custom_events";
import { CustomNetTable } from "./custom_net_tables";
import type { Table as TableAbilities } from "./custom_net_tables/abilities";
import type { Table as TableHero } from "./custom_net_tables/hero";
import type { Table as TableInvokation } from "./custom_net_tables/invokation";
import type { AbilitiesKeyValues, HeroData, HeroKeyValues } from "./net_table/key_listener";

declare global {
  // ----- Missing types from `@moddota/panorama-types` -----

  // interface CScriptBindingPR_Game {
  //   /** Get the bool value of the specific convar. Asserts if invalid and returns false */
  //   // biome-ignore lint/style/useNamingConvention: builtin type
  //   GetConvarBool(cvar: string): boolean;
  //   /** Get the int value of the specific convar. Asserts if invalid and returns 0 */
  //   // biome-ignore lint/style/useNamingConvention: builtin type
  //   GetConvarInt(cvar: string): number;
  //   /** Get the float value of the specific convar. Asserts if invalid and returns 0.0 */
  //   // biome-ignore lint/style/useNamingConvention: builtin type
  //   GetConvarFloat(cvar: string): number;
  // }

  // ----- Custom events declarations -----

  interface GameEventDeclarations {
    [cev.GameEvent.FacetSelect]: cev.FacetSelect;
    [cev.GameEvent.ViewerRender]: cev.ViewerRender;
    [cev.GameEvent.PopupAbilityPickerSubmit]: cev.PopupAbilityPickerSubmit;
    [cev.GameEvent.PopupItemPickerSubmit]: cev.PopupItemPickerSubmit;
    [cev.GameEvent.PopupTextEntrySubmit]: cev.PopupTextEntrySubmit;
  }

  interface CustomGameEventDeclarations {
    [cev.CustomGameEvent.PlayerHeroInGame]: cev.PlayerHeroInGame;
    [cev.CustomGameEvent.PlayerFacetSelect]: cev.PlayerFacetSelect;
    [cev.CustomGameEvent.PlayerQuitRequest]: cev.PlayerQuitRequest;
    [cev.CustomGameEvent.CombosReload]: cev.CombosReload;
    [cev.CustomGameEvent.ComboStart]: cev.ComboStart;
    [cev.CustomGameEvent.ComboStarted]: cev.ComboStarted;
    [cev.CustomGameEvent.ComboStop]: cev.ComboStop;
    [cev.CustomGameEvent.ComboStopped]: cev.ComboStopped;
    [cev.CustomGameEvent.ComboInProgress]: cev.ComboInProgress;
    [cev.CustomGameEvent.ComboProgress]: cev.ComboProgress;
    [cev.CustomGameEvent.ComboStepError]: cev.ComboStepError;
    [cev.CustomGameEvent.ComboPreFinish]: cev.ComboPreFinish;
    [cev.CustomGameEvent.ComboFinish]: cev.ComboFinished;
    [cev.CustomGameEvent.ComboRestart]: cev.ComboRestart;
    [cev.CustomGameEvent.FreestyleHeroLevelUp]: cev.FreestyleHeroLevelUp;
    [cev.CustomGameEvent.CombatLogAbilityUsed]: cev.CombatLogAbilityUsed;
    [cev.CustomGameEvent.CombatLogClear]: cev.CombatLogClear;
    [cev.CustomGameEvent.CombatLogCaptureStart]: cev.CombatLogCaptureStart;
    [cev.CustomGameEvent.CombatLogCaptureStop]: cev.CombatLogCaptureStop;
    [cev.CustomGameEvent.ItemPickerQueryRequest]: cev.ItemPickerQuery;
    [cev.CustomGameEvent.ItemPickerQueryResponse]: cev.ItemPickerQueryResponse;
  }

  // ----- Custom net tables declarations -----

  interface CustomNetTableDeclarations {
    [CustomNetTable.Invokation]: TableInvokation;
    [CustomNetTable.Hero]: TableHero;
    [CustomNetTable.Abilities]: TableAbilities;
  }

  // ----- Custom UI config declarations -----

  interface CustomUIConfig {
    invk: {
      // biome-ignore lint/style/useNamingConvention: constant
      ABILITIES_KV: AbilitiesKeyValues;
      // biome-ignore lint/style/useNamingConvention: constant
      COMBOS: CombosCollection;
      // biome-ignore lint/style/useNamingConvention: constant
      HERO_DATA: HeroData;
      // biome-ignore lint/style/useNamingConvention: constant
      HERO_KV: HeroKeyValues;

      hero: cev.PlayerHeroInGame | null;
    };
  }
}
