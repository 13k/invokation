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

  static add(path: string, id: GameEventListenerID): GameEventListenerID {
    this.get(path).push(id);

    return id;
  }

  static subscribe<T extends invk.Events.EventName>(
    path: string,
    event: T,
    listener: invk.Events.EventListener<T>
  ): GameEventListenerID {
    return this.add(`${path}.${event}`, GameEvents.Subscribe(event, listener));
  }

  // TODO: remove ids from paths
  static unsubscribe(path: string, ...ids: GameEventListenerID[]): void {
    ids.forEach(GameEvents.Unsubscribe);
  }

  // TODO: implement
  static unsubscribeSiblings(path: string): GameEventListenerID[] {
    return [];
  }

  static sendServer(
    event: invk.Events.CustomEventName,
    payload?: invk.Events.CustomEventType<typeof event>
  ): void {
    GameEvents.SendCustomGameEventToServer(event, payload || {});
  }

  static sendAll(
    event: invk.Events.CustomEventName,
    payload?: invk.Events.CustomEventType<typeof event>
  ): void {
    GameEvents.SendCustomGameEventToAllClients(event, payload || {});
  }

  static sendPlayer(
    playerIndex: PlayerID,
    event: invk.Events.CustomEventName,
    payload?: invk.Events.CustomEventType<typeof event>
  ): void {
    GameEvents.SendCustomGameEventToClient(event, playerIndex, payload || {});
  }

  static sendClientSide(
    event: invk.Events.EventName,
    payload?: invk.Events.EventType<typeof event>
  ): void {
    GameEvents.SendEventClientSide(event, payload || {});
  }
}
