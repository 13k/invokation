import "core-js";

import type { CombosCollection } from "./combo/combos_collection";
import type * as cevt from "./custom_events";
import type { CustomGameEvent, GameEvent } from "./custom_events";
import type { CustomNetTable } from "./custom_net_tables";
import type { Table as TableAbilities } from "./custom_net_tables/abilities";
import type { Table as TableHero } from "./custom_net_tables/hero";
import type { Table as TableInvokation } from "./custom_net_tables/invokation";
import type { AbilitiesKeyValues, HeroData, HeroKeyValues } from "./net_table/key_listener";

declare global {
  // ----- Custom events declarations -----

  interface GameEventDeclarations {
    [GameEvent.ViewerRender]: cevt.ViewerRender;
    [GameEvent.PopupAbilityPickerSubmit]: cevt.PopupAbilityPickerSubmit;
    [GameEvent.PopupItemPickerSubmit]: cevt.PopupItemPickerSubmit;
    [GameEvent.PopupTextEntrySubmit]: cevt.PopupTextEntrySubmit;
  }

  interface CustomGameEventDeclarations {
    [CustomGameEvent.PlayerHeroInGame]: cevt.PlayerHeroInGame;
    [CustomGameEvent.CombosReload]: cevt.CombosReload;
    [CustomGameEvent.ComboStart]: cevt.ComboStart;
    [CustomGameEvent.ComboStarted]: cevt.ComboStarted;
    [CustomGameEvent.ComboStop]: cevt.ComboStop;
    [CustomGameEvent.ComboStopped]: cevt.ComboStopped;
    [CustomGameEvent.ComboInProgress]: cevt.ComboInProgress;
    [CustomGameEvent.ComboProgress]: cevt.ComboProgress;
    [CustomGameEvent.ComboStepError]: cevt.ComboStepError;
    [CustomGameEvent.ComboPreFinish]: cevt.ComboPreFinish;
    [CustomGameEvent.ComboFinish]: cevt.ComboFinished;
    [CustomGameEvent.ComboRestart]: cevt.ComboRestart;
    [CustomGameEvent.FreestyleHeroLevelUp]: cevt.FreestyleHeroLevelUp;
    [CustomGameEvent.CombatLogAbilityUsed]: cevt.CombatLogAbilityUsed;
    [CustomGameEvent.CombatLogClear]: cevt.CombatLogClear;
    [CustomGameEvent.CombatLogCaptureStart]: cevt.CombatLogCaptureStart;
    [CustomGameEvent.CombatLogCaptureStop]: cevt.CombatLogCaptureStop;
    [CustomGameEvent.ItemPickerQueryRequest]: cevt.ItemPickerQuery;
    [CustomGameEvent.ItemPickerQueryResponse]: cevt.ItemPickerQueryResponse;
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

      hero: cevt.PlayerHeroInGame | null;
    };
  }
}
