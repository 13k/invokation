import "core-js";

// game events
import type {
  GameEvent,
  PopupAbilityPickerSubmit,
  PopupItemPickerSubmit,
  PopupTextEntrySubmit,
  ViewerRender,
} from "./custom_events";

// custom events
import type {
  CombatLogAbilityUsed,
  CombatLogCaptureStart,
  CombatLogCaptureStop,
  CombatLogClear,
  ComboFinished,
  ComboInProgress,
  ComboPreFinish,
  ComboProgress,
  ComboRestart,
  CombosReload,
  ComboStart,
  ComboStarted,
  ComboStepError,
  ComboStop,
  ComboStopped,
  CustomGameEvent,
  FreestyleHeroLevelUp,
  ItemPickerQuery,
  ItemPickerQueryResponse,
  PlayerHeroInGame,
  PlayerQuitRequest,
} from "./custom_events";

import type { CustomNetTable } from "./custom_net_tables";
import type { Table as TableAbilities } from "./custom_net_tables/abilities";
import type { Table as TableHero } from "./custom_net_tables/hero";
import type { Table as TableInvokation } from "./custom_net_tables/invokation";

import type { CombosCollection } from "./combo/combos_collection";
import type { AbilitiesKeyValues, HeroData, HeroKeyValues } from "./net_table/key_listener";

declare global {
  // ----- Custom events declarations -----

  interface GameEventDeclarations {
    [GameEvent.ViewerRender]: ViewerRender;
    [GameEvent.PopupAbilityPickerSubmit]: PopupAbilityPickerSubmit;
    [GameEvent.PopupItemPickerSubmit]: PopupItemPickerSubmit;
    [GameEvent.PopupTextEntrySubmit]: PopupTextEntrySubmit;
  }

  interface CustomGameEventDeclarations {
    [CustomGameEvent.PlayerHeroInGame]: PlayerHeroInGame;
    [CustomGameEvent.PlayerQuitRequest]: PlayerQuitRequest;
    [CustomGameEvent.CombosReload]: CombosReload;
    [CustomGameEvent.ComboStart]: ComboStart;
    [CustomGameEvent.ComboStarted]: ComboStarted;
    [CustomGameEvent.ComboStop]: ComboStop;
    [CustomGameEvent.ComboStopped]: ComboStopped;
    [CustomGameEvent.ComboInProgress]: ComboInProgress;
    [CustomGameEvent.ComboProgress]: ComboProgress;
    [CustomGameEvent.ComboStepError]: ComboStepError;
    [CustomGameEvent.ComboPreFinish]: ComboPreFinish;
    [CustomGameEvent.ComboFinish]: ComboFinished;
    [CustomGameEvent.ComboRestart]: ComboRestart;
    [CustomGameEvent.FreestyleHeroLevelUp]: FreestyleHeroLevelUp;
    [CustomGameEvent.CombatLogAbilityUsed]: CombatLogAbilityUsed;
    [CustomGameEvent.CombatLogClear]: CombatLogClear;
    [CustomGameEvent.CombatLogCaptureStart]: CombatLogCaptureStart;
    [CustomGameEvent.CombatLogCaptureStop]: CombatLogCaptureStop;
    [CustomGameEvent.ItemPickerQueryRequest]: ItemPickerQuery;
    [CustomGameEvent.ItemPickerQueryResponse]: ItemPickerQueryResponse;
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

      hero: PlayerHeroInGame | null;
    };
  }
}
