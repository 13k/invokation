import type { ComboID, ProgressMetrics } from "../combo";
import type { UIEventDeclarations } from "./ui_events";

export enum CustomEvent {
  // combo picker
  PICKER_TOGGLE = "invokation_picker_toggle",
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

// --------------------------------------------------
// Global augmentation
// --------------------------------------------------

declare global {
  interface CustomGameEventDeclarations {
    [CustomEvent.PICKER_TOGGLE]: PickerToggleEvent;
    [CustomEvent.VIEWER_RENDER]: ViewerRenderEvent;
    [CustomEvent.COMBOS_RELOAD]: CombosReloadEvent;
    [CustomEvent.COMBO_START]: ComboStartEvent;
    [CustomEvent.COMBO_STARTED]: ComboStartedEvent;
    [CustomEvent.COMBO_STOP]: ComboStopEvent;
    [CustomEvent.COMBO_STOPPED]: ComboStoppedEvent;
    [CustomEvent.COMBO_IN_PROGRESS]: ComboInProgressEvent;
    [CustomEvent.COMBO_PROGRESS]: ComboProgressEvent;
    [CustomEvent.COMBO_STEP_ERROR]: ComboStepErrorEvent;
    [CustomEvent.COMBO_PRE_FINISH]: ComboPreFinishEvent;
    [CustomEvent.COMBO_FINISHED]: ComboFinishedEvent;
    [CustomEvent.COMBO_RESTART]: ComboRestartEvent;
    [CustomEvent.FREESTYLE_HERO_LEVEL_UP]: FreestyleHeroLevelUpEvent;
    [CustomEvent.COMBAT_LOG_ABILITY_USED]: CombatLogAbilityUsedEvent;
    [CustomEvent.COMBAT_LOG_CLEAR]: CombatLogClearEvent;
    [CustomEvent.COMBAT_LOG_CAPTURE_START]: CombatLogCaptureStartEvent;
    [CustomEvent.COMBAT_LOG_CAPTURE_STOP]: CombatLogCaptureStopEvent;
    [CustomEvent.ITEM_PICKER_QUERY]: ItemPickerQueryEvent;
    [CustomEvent.ITEM_PICKER_QUERY_RESPONSE]: ItemPickerQueryResponseEvent;
    [CustomEvent.POPUP_TEXT_ENTRY_SUBMIT]: PopupTextEntrySubmitEvent;
    [CustomEvent.POPUP_ITEM_PICKER_SUBMIT]: PopupItemPickerSubmitEvent;
    [CustomEvent.POPUP_ABILITY_PICKER_SUBMIT]: PopupAbilityPickerSubmitEvent;
  }

  interface CDOTA_PanoramaScript_GameEvents {
    SendCustomGameEventToServer<T extends CustomEventName>(
      pEventName: T,
      eventData?: CustomEventType<T>
    ): void;

    SendCustomGameEventToAllClients<T extends CustomEventName>(
      pEventName: T,
      eventData?: CustomEventType<T>
    ): void;

    SendCustomGameEventToClient<T extends CustomEventName>(
      pEventName: T,
      playerIndex: PlayerID,
      eventData?: CustomEventType<T>
    ): void;

    SendEventClientSide<T extends EventName>(pEventName: T, eventData?: EventType<T>): void;
  }
}

// --------------------------------------------------
// Helper types
// --------------------------------------------------

export type GameEventName = keyof GameEventDeclarations;
export type GameEventType<T extends GameEventName> = GameEventDeclarations[T];
export type GameEventListener<T extends GameEventName> = (
  event: NetworkedData<GameEventType<T>>
) => void;

export type CustomEventName = keyof CustomGameEventDeclarations;
export type CustomEventType<T extends CustomEventName> = CustomGameEventDeclarations[T];
export type CustomEventNetworkedData<T extends CustomEventName> = NetworkedData<CustomEventType<T>>;
export type CustomEventListener<T extends CustomEventName> = (
  event: CustomEventNetworkedData<T>
) => void;

export type EventName = GameEventName | CustomEventName;
// eslint-disable-next-line @typescript-eslint/ban-types
export type EventType<T extends EventName> = GameEvents.InferGameEventType<T, object>;
export type EventNetworkedData<T extends EventName> = NetworkedData<EventType<T>>;
export type EventListener<T extends EventName> = (event: EventNetworkedData<T>) => void;

export type UIEventName = keyof UIEventDeclarations;
export type UIEventType<T extends UIEventName> = UIEventDeclarations[T];
export type UIEventListener<T extends UIEventName> = (event: UIEventType<T>) => void;

// --------------------------------------------------
// Custom events
// --------------------------------------------------

export type PickerToggleEvent = never;

export interface ViewerRenderEvent {
  id: ComboID;
}

export type CombosReloadEvent = never;

export interface ComboStartEvent {
  id: ComboID;
}

export interface ComboStartedEvent {
  id: ComboID;
  next: ComboID[];
}

export type ComboStopEvent = never;

export interface ComboStoppedEvent {
  id: ComboID;
}

export interface ComboInProgressEvent {
  id: ComboID;
}

export interface ComboProgressEvent {
  id: ComboID;
  next: ComboID[];
  metrics: ProgressMetrics;
}

export interface ComboStepErrorEvent {
  id: ComboID;
  expected: ComboID[];
  ability: string;
}

export interface ComboPreFinishEvent {
  id: ComboID;
  metrics: ProgressMetrics;
  wait: number;
}

export interface ComboFinishedEvent {
  id: ComboID;
  metrics: ProgressMetrics;
}

export interface ComboRestartEvent {
  hardReset: boolean;
}

export interface FreestyleHeroLevelUpEvent {
  maxLevel: boolean;
}

export interface CombatLogAbilityUsedEvent {
  ability: string;
}

export type CombatLogClearEvent = never;
export type CombatLogCaptureStartEvent = never;
export type CombatLogCaptureStopEvent = never;

export interface ItemPickerQueryEvent {
  query: string;
}

export interface ItemPickerQueryResponseEvent {
  items: string[];
}

export interface PopupTextEntrySubmitEvent {
  channel: string;
  text: string;
}

export interface PopupItemPickerSubmitEvent {
  channel: string;
  item: string;
}

export interface PopupAbilityPickerSubmitEvent {
  channel: string;
  ability: string;
}
