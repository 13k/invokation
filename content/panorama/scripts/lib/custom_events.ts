import type { ID as ComboID, Metrics as ComboMetrics } from "./combo";

declare global {
  interface CustomGameEventDeclarations {
    [Name.COMBOS_RELOAD]: CombosReload;
    [Name.COMBO_START]: ComboStart;
    [Name.COMBO_STARTED]: ComboStarted;
    [Name.COMBO_STOP]: ComboStop;
    [Name.COMBO_STOPPED]: ComboStopped;
    [Name.COMBO_IN_PROGRESS]: ComboInProgress;
    [Name.COMBO_PROGRESS]: ComboProgress;
    [Name.COMBO_STEP_ERROR]: ComboStepError;
    [Name.COMBO_PRE_FINISH]: ComboPreFinish;
    [Name.COMBO_FINISHED]: ComboFinished;
    [Name.COMBO_RESTART]: ComboRestart;
    [Name.FREESTYLE_HERO_LEVEL_UP]: FreestyleHeroLevelUp;
    [Name.COMBAT_LOG_ABILITY_USED]: CombatLogAbilityUsed;
    [Name.COMBAT_LOG_CLEAR]: CombatLogClear;
    [Name.COMBAT_LOG_CAPTURE_START]: CombatLogCaptureStart;
    [Name.COMBAT_LOG_CAPTURE_STOP]: CombatLogCaptureStop;
    [Name.ITEM_PICKER_QUERY]: ItemPickerQuery;
    [Name.ITEM_PICKER_QUERY_RESPONSE]: ItemPickerQueryResponse;
  }

  interface GameEventDeclarations {
    [Name.VIEWER_RENDER]: ViewerRender;
    [Name.POPUP_ABILITY_PICKER_SUBMIT]: PopupAbilityPickerSubmit;
    [Name.POPUP_ITEM_PICKER_SUBMIT]: PopupItemPickerSubmit;
    [Name.POPUP_TEXT_ENTRY_SUBMIT]: PopupTextEntrySubmit;
  }
}

enum Name {
  // combo viewer
  VIEWER_RENDER = "invokation_viewer_render",
  // combos
  COMBOS_RELOAD = "invokation_combos_reload",
  COMBO_START = "invokation_combo_start",
  COMBO_STARTED = "invokation_combo_started",
  COMBO_STOP = "invokation_combo_stop",
  COMBO_STOPPED = "invokation_combo_stopped",
  COMBO_IN_PROGRESS = "invokation_combo_in_progress",
  COMBO_PROGRESS = "invokation_combo_progress",
  COMBO_STEP_ERROR = "invokation_combo_step_error",
  COMBO_PRE_FINISH = "invokation_combo_pre_finish",
  COMBO_FINISHED = "invokation_combo_finished",
  COMBO_RESTART = "invokation_combo_restart",
  // freestyle
  FREESTYLE_HERO_LEVEL_UP = "invokation_freestyle_hero_level_up",
  // combat log
  COMBAT_LOG_ABILITY_USED = "invokation_combat_log_ability_used",
  COMBAT_LOG_CLEAR = "invokation_combat_log_clear",
  COMBAT_LOG_CAPTURE_START = "invokation_combat_log_capture_start",
  COMBAT_LOG_CAPTURE_STOP = "invokation_combat_log_capture_stop",
  // item picker
  ITEM_PICKER_QUERY = "invokation_item_picker_query",
  ITEM_PICKER_QUERY_RESPONSE = "invokation_item_picker_query_response",
  // popups
  POPUP_TEXT_ENTRY_SUBMIT = "invokation_popup_text_entry_submit",
  POPUP_ITEM_PICKER_SUBMIT = "invokation_popup_item_picker_submit",
  POPUP_ABILITY_PICKER_SUBMIT = "invokation_popup_ability_picker_submit",
}

export interface ViewerRender {
  id: ComboID;
}

export type CombosReload = Record<string, never>;

export interface ComboStart {
  id: ComboID;
}

export interface ComboStarted {
  id: ComboID;
  next: number[];
}

export type ComboStop = Record<string, never>;

export interface ComboStopped {
  id: ComboID;
}

export interface ComboInProgress {
  id: ComboID;
}

export interface ComboProgress {
  id: ComboID;
  next: number[];
  metrics: ComboMetrics;
}

export type ComboStepError = Record<string, never>;
export type ComboPreFinish = Record<string, never>;

export interface ComboFinished {
  id: ComboID;
  metrics: ComboMetrics;
}

export interface ComboRestart {
  hardReset: boolean;
}

export interface FreestyleHeroLevelUp {
  maxLevel: boolean;
}

export interface CombatLogAbilityUsed {
  ability: string;
}

export type CombatLogClear = Record<string, never>;
export type CombatLogCaptureStart = Record<string, never>;
export type CombatLogCaptureStop = Record<string, never>;

export interface ItemPickerQuery {
  query: string;
}

export interface ItemPickerQueryResponse {
  items: string[];
}

export interface PopupTextEntrySubmit {
  channel: string;
  text: string;
}

export interface PopupItemPickerSubmit {
  channel: string;
  item: string;
}

export interface PopupAbilityPickerSubmit {
  channel: string;
  ability: string;
}

const {
  lodash: _,

  Cache,
} = CustomUIConfig;

const subscriptions = new Cache<GameEventListenerID>();

const module = {
  Name,

  subscribe<K extends keyof CustomGameEventDeclarations | keyof GameEventDeclarations>(
    key: string,
    name: K,
    listener: (event: NetworkedData<GameEvents.InferGameEventType<K, object>>) => void
  ): GameEventListenerID {
    key = `${key}.${name}`;

    const id = GameEvents.Subscribe(name, listener);

    subscriptions.add(key, id);

    return id;
  },

  unsubscribe(id: GameEventListenerID): string[] {
    GameEvents.Unsubscribe(id);

    const keys = subscriptions.find(id);

    keys.forEach((key) => subscriptions.remove(key, id));

    return keys;
  },

  unsubscribeAll(ids: GameEventListenerID[]): string[] {
    return _.flatMap(ids, module.unsubscribe);
  },

  unsubscribeAllSiblings(key: string): Record<string, GameEventListenerID[]> | undefined {
    const siblings = subscriptions.siblings(key);

    return _.transform(
      siblings,
      (result, key) => {
        const ids = subscriptions.get(key);

        if (ids) {
          module.unsubscribeAll(ids);

          result[key] = ids;
        }
      },
      {} as Record<string, GameEventListenerID[]>
    );
  },

  sendServer<K extends keyof CustomGameEventDeclarations>(
    name: K,
    payload: GameEvents.InferCustomGameEventType<K, never>
  ): void {
    GameEvents.SendCustomGameEventToServer(name, payload);
  },

  sendAll<K extends keyof CustomGameEventDeclarations>(
    name: K,
    payload: GameEvents.InferCustomGameEventType<K, never>
  ): void {
    GameEvents.SendCustomGameEventToAllClients(name, payload);
  },

  sendPlayer<K extends keyof CustomGameEventDeclarations>(
    playerID: PlayerID,
    name: K,
    payload: GameEvents.InferCustomGameEventType<K, never>
  ): void {
    GameEvents.SendCustomGameEventToClient(name, playerID, payload);
  },

  sendClientSide<K extends keyof GameEventDeclarations>(
    name: K,
    payload: GameEventDeclarations[K]
  ): void {
    GameEvents.SendEventClientSide(name, payload);
  },
};

export type CustomEvents = typeof module;
export type { Name };

CustomUIConfig.CustomEvents = module;
