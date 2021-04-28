/**
 * Event emitted for listeners registered with {@link PanelEvents.listen}.
 */
export class PanelEvent<T> {
  constructor(public type: globalThis.PanelEvent, public panel: T, public args: unknown[]) {}
}

export type PanelEventListener<T> = (ev: PanelEvent<T>) => void;

export class PanelEvents {
  static listen<T extends PanelBase>(
    panel: T,
    event: globalThis.PanelEvent,
    listener: PanelEventListener<T>
  ): void {
    panel.SetPanelEvent(event, (...args: unknown[]) =>
      listener(new PanelEvent(event, panel, args))
    );
  }
}
