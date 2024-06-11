import { Cache } from "./cache";
import type { ComboId, Metrics } from "./combo";
import type { KeyValues } from "./kv";
import { Logger } from "./logger";

export type CustomEvent = keyof GameEventDeclarations | keyof CustomGameEventDeclarations;

type ListenerPayload<K extends CustomEvent, F = object> = NetworkedData<
  GameEvents.InferGameEventType<K, F>
>;

export type CustomEventListener<K extends CustomEvent> = (payload: ListenerPayload<K>) => void;

declare global {
  // biome-ignore lint/style/useNamingConvention: external type
  interface CustomUIConfig {
    // biome-ignore lint/style/useNamingConvention: constant
    CUSTOM_EVENTS_SUBSCRIPTIONS: Cache<GameEventListenerID>;
  }
}

const SUBSCRIPTIONS = (() => {
  GameUI.CustomUIConfig().CUSTOM_EVENTS_SUBSCRIPTIONS ??= new Cache();

  return GameUI.CustomUIConfig().CUSTOM_EVENTS_SUBSCRIPTIONS;
})();

const LOG = new Logger({ name: "CustomEvents" });

export function subscribe<K extends CustomEvent>(
  key: string,
  name: K,
  listener: CustomEventListener<K>,
): GameEventListenerID {
  const cacheKey = `${key}.${name}`;
  const id = GameEvents.Subscribe(name, listener);

  LOG.debug("subscribe", { name, id });
  SUBSCRIPTIONS.add(cacheKey, id);

  return id;
}

export function unsubscribe(id: GameEventListenerID): string[] {
  GameEvents.Unsubscribe(id);

  LOG.debug("unsubscribe", { id });

  const keys = SUBSCRIPTIONS.find(id);

  for (const key of keys) {
    SUBSCRIPTIONS.remove(key, id);
  }

  return keys;
}

export function unsubscribeAll(ids: GameEventListenerID[]): string[] {
  return ids.flatMap(unsubscribe);
}

export function unsubscribeAllSiblings(
  key: string,
): Map<string, GameEventListenerID[]> | undefined {
  const siblings = SUBSCRIPTIONS.siblings(key);

  return siblings.reduce(
    (result, key) => {
      const ids = SUBSCRIPTIONS.get(key);

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

  LOG.debug("sendServer", { name, payload });
}

export function sendAll<K extends CustomGameEvent>(
  name: K,
  payload: CustomGameEventDeclarations[K],
): void {
  GameEvents.SendCustomGameEventToAllClients(
    name,
    payload as GameEvents.InferCustomGameEventType<K, never>,
  );

  LOG.debug("sendAll", { name, payload });
}

export function sendPlayer<K extends CustomGameEvent>(
  playerId: PlayerID,
  name: K,
  payload: CustomGameEventDeclarations[K],
): void {
  GameEvents.SendCustomGameEventToClient(
    name,
    playerId,
    payload as GameEvents.InferCustomGameEventType<K, never>,
  );

  LOG.debug("sendPlayer", { playerId, name, payload });
}

export function sendClientSide<K extends GameEvent>(
  name: K,
  payload: GameEventDeclarations[K],
): void {
  GameEvents.SendEventClientSide(name, payload);

  LOG.debug("sendClientSide", { name, payload });
}

// ----- Custom events definitions -----

export enum GameEvent {
  // combo viewer
  ViewerRender = "invk_viewer_render",
  // popups
  PopupTextEntrySubmit = "invk_popup_text_entry_submit",
  PopupItemPickerSubmit = "invk_popup_item_picker_submit",
  PopupAbilityPickerSubmit = "invk_popup_ability_picker_submit",
}

export enum CustomGameEvent {
  // player
  PlayerHeroInGame = "invk_player_hero_in_game",
  PlayerQuitRequest = "invk_player_quit_request",
  // combos
  CombosReload = "invk_combos_reload",
  ComboStart = "invk_combo_start",
  ComboStarted = "invk_combo_started",
  ComboStop = "invk_combo_stop",
  ComboStopped = "invk_combo_stopped",
  ComboInProgress = "invk_combo_in_progress",
  ComboProgress = "invk_combo_progress",
  ComboStepError = "invk_combo_step_error",
  ComboPreFinish = "invk_combo_pre_finish",
  ComboFinish = "invk_combo_finished",
  ComboRestart = "invk_combo_restart",
  // freestyle
  FreestyleHeroLevelUp = "invk_freestyle_hero_level_up",
  // combat log
  CombatLogAbilityUsed = "invk_combat_log_ability_used",
  CombatLogClear = "invk_combat_log_clear",
  CombatLogCaptureStart = "invk_combat_log_capture_start",
  CombatLogCaptureStop = "invk_combat_log_capture_stop",
  // item picker
  ItemPickerQueryRequest = "invk_item_picker_query_request",
  ItemPickerQueryResponse = "invk_item_picker_query_response",
}

export interface ViewerRender {
  id: ComboId;
}

export interface PlayerHeroInGame {
  id: number;
  name: string;
  variant: number;
}

export type PlayerQuitRequest = Record<string, never>;

export type CombosReload = Record<string, never>;

export interface ComboStart {
  id: ComboId;
}

export interface ComboStarted {
  id: ComboId;
  next: number[];
}

export type ComboStop = Record<string, never>;

export interface ComboStopped {
  id: ComboId;
}

export interface ComboInProgress {
  id: ComboId;
}

export interface ComboProgress {
  id: ComboId;
  next: number[];
  metrics: Metrics;
}

export interface ComboStepError {
  id: ComboId;
  ability: string;
  expected: number[];
}

export interface ComboPreFinish {
  id: ComboId;
  metrics: Metrics;
  wait: number;
}

export interface ComboFinished {
  id: ComboId;
  metrics: Metrics;
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
