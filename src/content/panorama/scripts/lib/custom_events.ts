/// <reference path="./cache.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace CustomEvents {
    const {
      Cache: { Cache },
    } = invk;

    export type CustomEventName = keyof CustomGameEventDeclarations | keyof GameEventDeclarations;
    export type Payload<K extends CustomEventName> = NetworkedData<
      GameEvents.InferGameEventType<K, object>
    >;

    const subscriptions = new Cache<GameEventListenerID>();

    export function subscribe<K extends CustomEventName>(
      key: string,
      name: K,
      listener: (event: Payload<K>) => void,
    ): GameEventListenerID {
      key = `${key}.${name}`;

      const id = GameEvents.Subscribe(name, listener);

      subscriptions.add(key, id);

      return id;
    }

    export function unsubscribe(id: GameEventListenerID): string[] {
      GameEvents.Unsubscribe(id);

      const keys = subscriptions.find(id);

      keys.forEach((key) => subscriptions.remove(key, id));

      return keys;
    }

    export function unsubscribeAll(ids: GameEventListenerID[]): string[] {
      return _.flatMap(ids, unsubscribe);
    }

    export function unsubscribeAllSiblings(
      key: string,
    ): Record<string, GameEventListenerID[]> | undefined {
      const siblings = subscriptions.siblings(key);

      return _.transform(
        siblings,
        (result, key) => {
          const ids = subscriptions.get(key);

          if (ids && !_.isEmpty(ids)) {
            unsubscribeAll(ids);
            result[key] = ids;
          }
        },
        {} as Record<string, GameEventListenerID[]>,
      );
    }

    export function sendServer<K extends keyof CustomGameEventDeclarations>(
      name: K,
      payload: GameEvents.InferCustomGameEventType<K, never>,
    ): void {
      GameEvents.SendCustomGameEventToServer(name, payload);
    }

    export function sendAll<K extends keyof CustomGameEventDeclarations>(
      name: K,
      payload: GameEvents.InferCustomGameEventType<K, never>,
    ): void {
      GameEvents.SendCustomGameEventToAllClients(name, payload);
    }

    export function sendPlayer<K extends keyof CustomGameEventDeclarations>(
      playerID: PlayerID,
      name: K,
      payload: GameEvents.InferCustomGameEventType<K, never>,
    ): void {
      GameEvents.SendCustomGameEventToClient(name, playerID, payload);
    }

    export function sendClientSide<K extends keyof GameEventDeclarations>(
      name: K,
      payload: GameEventDeclarations[K],
    ): void {
      GameEvents.SendEventClientSide(name, payload);
    }

    // --- Event definitions ---

    export enum Name {
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
      id: Combo.ID;
    }

    export type CombosReload = Record<string, never>;

    export interface ComboStart {
      id: Combo.ID;
    }

    export interface ComboStarted {
      id: Combo.ID;
      next: number[];
    }

    export type ComboStop = Record<string, never>;

    export interface ComboStopped {
      id: Combo.ID;
    }

    export interface ComboInProgress {
      id: Combo.ID;
    }

    export interface ComboProgress {
      id: Combo.ID;
      next: number[];
      metrics: Combo.Metrics;
    }

    export interface ComboStepError {
      id: Combo.ID;
      ability: string;
      expected: number[];
    }

    export interface ComboPreFinish {
      id: Combo.ID;
      metrics: Combo.Metrics;
      wait: number;
    }

    export interface ComboFinished {
      id: Combo.ID;
      metrics: Combo.Metrics;
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
      items: Record<string, Dota2.KeyValues>;
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
