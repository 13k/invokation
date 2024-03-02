/// <reference path="cache.ts" />
/// <reference path="kv.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace custom_events {
    import Cache = invk.cache.Cache;
    import KeyValues = invk.kv.KeyValues;

    export type Event = keyof GameEventDeclarations | keyof CustomGameEventDeclarations;

    type ListenerPayload<K extends Event, F = object> = NetworkedData<
      GameEvents.InferGameEventType<K, F>
    >;

    export type Listener<K extends Event> = (payload: ListenerPayload<K>) => void;

    const subscriptions = new Cache<GameEventListenerID>();

    export function subscribe<K extends Event>(
      key: string,
      name: K,
      listener: Listener<K>,
    ): GameEventListenerID {
      const cacheKey = `${key}.${name}`;
      const id = GameEvents.Subscribe(name, listener);

      subscriptions.add(cacheKey, id);

      return id;
    }

    export function unsubscribe(id: GameEventListenerID): string[] {
      GameEvents.Unsubscribe(id);

      const keys = subscriptions.find(id);

      for (const key of keys) {
        subscriptions.remove(key, id);
      }

      return keys;
    }

    export function unsubscribeAll(ids: GameEventListenerID[]): string[] {
      return ids.flatMap(unsubscribe);
    }

    export function unsubscribeAllSiblings(
      key: string,
    ): Map<string, GameEventListenerID[]> | undefined {
      const siblings = subscriptions.siblings(key);

      return siblings.reduce(
        (result, key) => {
          const ids = subscriptions.get(key);

          if (ids != null && ids.length > 0) {
            unsubscribeAll(ids);

            result.set(key, ids);
          }

          return result;
        },
        new Map() as Map<string, GameEventListenerID[]>,
      );
    }

    export function sendServer<K extends CustomGameEvent>(
      name: K,
      payload: CustomGameEventDeclarations[K],
    ): void {
      GameEvents.SendCustomGameEventToServer(
        name,
        payload as GameEvents.InferCustomGameEventType<K, never>,
      );
    }

    export function sendAll<K extends CustomGameEvent>(
      name: K,
      payload: CustomGameEventDeclarations[K],
    ): void {
      GameEvents.SendCustomGameEventToAllClients(
        name,
        payload as GameEvents.InferCustomGameEventType<K, never>,
      );
    }

    export function sendPlayer<K extends CustomGameEvent>(
      playerID: PlayerID,
      name: K,
      payload: CustomGameEventDeclarations[K],
    ): void {
      GameEvents.SendCustomGameEventToClient(
        name,
        playerID,
        payload as GameEvents.InferCustomGameEventType<K, never>,
      );
    }

    export function sendClientSide<K extends GameEvent>(
      name: K,
      payload: GameEventDeclarations[K],
    ): void {
      GameEvents.SendEventClientSide(name, payload);
    }

    // ----- Custom events definitions -----

    export enum GameEvent {
      // combo viewer
      VIEWER_RENDER = "invokation_viewer_render",
      // popups
      POPUP_TEXT_ENTRY_SUBMIT = "invokation_popup_text_entry_submit",
      POPUP_ITEM_PICKER_SUBMIT = "invokation_popup_item_picker_submit",
      POPUP_ABILITY_PICKER_SUBMIT = "invokation_popup_ability_picker_submit",
    }

    export enum CustomGameEvent {
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
    }

    export interface ViewerRender {
      id: combo.ComboID;
    }

    export type CombosReload = Record<string, never>;

    export interface ComboStart {
      id: combo.ComboID;
    }

    export interface ComboStarted {
      id: combo.ComboID;
      next: number[];
    }

    export type ComboStop = Record<string, never>;

    export interface ComboStopped {
      id: combo.ComboID;
    }

    export interface ComboInProgress {
      id: combo.ComboID;
    }

    export interface ComboProgress {
      id: combo.ComboID;
      next: number[];
      metrics: combo.Metrics;
    }

    export interface ComboStepError {
      id: combo.ComboID;
      ability: string;
      expected: number[];
    }

    export interface ComboPreFinish {
      id: combo.ComboID;
      metrics: combo.Metrics;
      wait: number;
    }

    export interface ComboFinished {
      id: combo.ComboID;
      metrics: combo.Metrics;
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
      items: Record<string, KeyValues>;
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
  }
}

import custom_events = invk.custom_events;
import GameEvent = invk.custom_events.GameEvent;
import CustomGameEvent = invk.custom_events.CustomGameEvent;

// ----- Custom events declarations -----

interface GameEventDeclarations {
  [GameEvent.VIEWER_RENDER]: custom_events.ViewerRender;
  [GameEvent.POPUP_ABILITY_PICKER_SUBMIT]: custom_events.PopupAbilityPickerSubmit;
  [GameEvent.POPUP_ITEM_PICKER_SUBMIT]: custom_events.PopupItemPickerSubmit;
  [GameEvent.POPUP_TEXT_ENTRY_SUBMIT]: custom_events.PopupTextEntrySubmit;
}

interface CustomGameEventDeclarations {
  [CustomGameEvent.COMBOS_RELOAD]: custom_events.CombosReload;
  [CustomGameEvent.COMBO_START]: custom_events.ComboStart;
  [CustomGameEvent.COMBO_STARTED]: custom_events.ComboStarted;
  [CustomGameEvent.COMBO_STOP]: custom_events.ComboStop;
  [CustomGameEvent.COMBO_STOPPED]: custom_events.ComboStopped;
  [CustomGameEvent.COMBO_IN_PROGRESS]: custom_events.ComboInProgress;
  [CustomGameEvent.COMBO_PROGRESS]: custom_events.ComboProgress;
  [CustomGameEvent.COMBO_STEP_ERROR]: custom_events.ComboStepError;
  [CustomGameEvent.COMBO_PRE_FINISH]: custom_events.ComboPreFinish;
  [CustomGameEvent.COMBO_FINISHED]: custom_events.ComboFinished;
  [CustomGameEvent.COMBO_RESTART]: custom_events.ComboRestart;
  [CustomGameEvent.FREESTYLE_HERO_LEVEL_UP]: custom_events.FreestyleHeroLevelUp;
  [CustomGameEvent.COMBAT_LOG_ABILITY_USED]: custom_events.CombatLogAbilityUsed;
  [CustomGameEvent.COMBAT_LOG_CLEAR]: custom_events.CombatLogClear;
  [CustomGameEvent.COMBAT_LOG_CAPTURE_START]: custom_events.CombatLogCaptureStart;
  [CustomGameEvent.COMBAT_LOG_CAPTURE_STOP]: custom_events.CombatLogCaptureStop;
  [CustomGameEvent.ITEM_PICKER_QUERY]: custom_events.ItemPickerQuery;
  [CustomGameEvent.ITEM_PICKER_QUERY_RESPONSE]: custom_events.ItemPickerQueryResponse;
}
