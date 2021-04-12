export class PanelEvent {
  constructor(public type: globalThis.PanelEvent, public panel: Panel, public payload?: unknown) {}
}

export type PanelEventListener = (ev: PanelEvent) => void;
