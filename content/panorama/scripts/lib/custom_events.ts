import { mapValues, pull } from "lodash";

import type {
  CustomEventName,
  CustomEventType,
  EventListener,
  EventName,
  EventType,
} from "./const/events";
import { DeepMap } from "./deep_map";

export class CustomEvents {
  static subs: DeepMap<GameEventListenerID[]> = new DeepMap();

  static get(path: string): GameEventListenerID[] {
    const bag = this.subs.get(path);

    if (bag != null) {
      return bag;
    }

    return this.subs.set(path, []);
  }

  static add(path: string, listenerID: GameEventListenerID): GameEventListenerID {
    this.get(path).push(listenerID);

    return listenerID;
  }

  static remove(path: string, listenerID: GameEventListenerID): GameEventListenerID {
    pull(this.get(path), listenerID);

    return listenerID;
  }

  static subscribe<T extends EventName>(
    path: string,
    event: T,
    listener: EventListener<T>
  ): GameEventListenerID {
    return this.add(`${path}.${event}`, GameEvents.Subscribe(event, listener));
  }

  static unsubscribe(path: string, ...listenerIDs: GameEventListenerID[]): GameEventListenerID[] {
    return listenerIDs.map((listenerID) => {
      GameEvents.Unsubscribe(listenerID);

      return this.remove(path, listenerID);
    });
  }

  static unsubscribeSiblings(path: string): { [path: string]: GameEventListenerID[] } {
    const siblingSubs = this.subs.getSiblings(path);

    return mapValues(siblingSubs, (subs, subPath) => this.unsubscribe(subPath, ...subs));
  }

  static sendServer(event: CustomEventName, payload?: CustomEventType<typeof event>): void {
    GameEvents.SendCustomGameEventToServer(event, payload);
  }

  static sendAll(event: CustomEventName, payload?: CustomEventType<typeof event>): void {
    GameEvents.SendCustomGameEventToAllClients(event, payload);
  }

  static sendPlayer(
    playerIndex: PlayerID,
    event: CustomEventName,
    payload?: CustomEventType<typeof event>
  ): void {
    GameEvents.SendCustomGameEventToClient(event, playerIndex, payload);
  }

  static sendClientSide(event: EventName, payload?: EventType<typeof event>): void {
    GameEvents.SendEventClientSide(event, payload);
  }
}
