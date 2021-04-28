import type { UIEventName, UIEventType } from "./const/events";
import { UIEvent, UIPanelEvent as Shit } from "./const/ui_events";
import { QueryParams, queryString } from "./util";

interface AbilityTooltipOptions {
  entityIndex?: number;
  guide?: string;
  hero?: number;
  flag?: boolean;
  level?: number;
}

/**
 * Event emitted for listeners registered with {@link UIEvents.listen}.
 */
export class UIPanelEvent<K extends Shit> {
  constructor(public type: K, public panel: PanelBase, public args: UIEventType<K>) {}
}

export class UIEvents {
  static listen<K extends Shit>(
    panel: PanelBase,
    event: K,
    listener: (event: UIPanelEvent<K>) => void
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $.RegisterEventHandler(event, panel, (...args: any[]): void => {
      listener(new UIPanelEvent(event, panel, args as UIEventType<K>));
    });
  }

  static dispatch<K extends UIEventName>(event: K, ...args: UIEventType<K>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $.DispatchEvent(event, ...(args as any[]));
  }

  static dispatchAsync<K extends UIEventName>(
    event: K,
    delay: number,
    ...args: UIEventType<K>
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $.DispatchEventAsync(delay, event, ...(args as any[]));
  }

  static dispatchPanel<K extends Shit>(panel: PanelBase, event: K, ...args: UIEventType<K>): void {
    $.DispatchEvent(event, panel, ...args);
  }

  static dispatchPanelAsync<K extends Shit>(
    panel: PanelBase,
    event: K,
    delay: number,
    ...args: UIEventType<K>
  ): void {
    $.DispatchEventAsync(delay, event, panel, ...args);
  }

  static openExternalURL(url: string): void {
    this.dispatch(UIEvent.ExternalBrowserGoToURL, url);
  }

  static playSound(soundEvent: string): void {
    this.dispatch(UIEvent.PlaySoundEffect, soundEvent);
  }

  static showTooltip(panel: PanelBase, id: string, layout: string, params?: QueryParams): void {
    if (params == null) {
      return this.dispatchPanel(panel, Shit.ShowCustomLayoutTooltip, id, layout);
    }

    const query = queryString(params);

    return this.dispatchPanel(panel, Shit.ShowCustomLayoutParametersTooltip, id, layout, query);
  }

  static hideTooltip(panel: PanelBase, id: string): void {
    this.dispatchPanel(panel, Shit.HideCustomLayoutTooltip, id);
  }

  static showTextTooltip(panel: PanelBase, text: string): void {
    this.dispatchPanel(panel, Shit.ShowTextTooltip, text);
  }

  static hideTextTooltip(panel: PanelBase): void {
    this.dispatchPanel(panel, Shit.HideTextTooltip);
  }

  static showAbilityTooltip(
    panel: PanelBase,
    abilityName: string,
    options: AbilityTooltipOptions = {}
  ): void {
    if (typeof options.entityIndex === "number") {
      return this.dispatchPanel(
        panel,
        Shit.ShowAbilityTooltipForEntityIndex,
        abilityName,
        options.entityIndex
      );
    }

    if (typeof options.guide === "string") {
      return this.dispatchPanel(panel, Shit.ShowAbilityTooltipForGuide, abilityName, options.guide);
    }

    if (typeof options.hero === "number") {
      return this.dispatchPanel(
        panel,
        Shit.ShowAbilityTooltipForHero,
        abilityName,
        options.hero,
        !!options.flag
      );
    }

    if (typeof options.level === "number") {
      return this.dispatchPanel(panel, Shit.ShowAbilityTooltipForLevel, abilityName, options.level);
    }

    return this.dispatchPanel(panel, Shit.ShowAbilityTooltip, abilityName);
  }

  static hideAbilityTooltip(panel: PanelBase): void {
    return this.dispatchPanel(panel, Shit.HideAbilityTooltip);
  }

  static showPopup(id: string, layout: string, params?: QueryParams): void {
    if (params == null) {
      return this.dispatch(UIEvent.ShowCustomLayoutPopup, id, layout);
    }

    const query = queryString(params);

    return this.dispatch(UIEvent.ShowCustomLayoutPopupParameters, id, layout, query);
  }

  static closePopup(panel: PanelBase): void {
    this.dispatchPanel(panel, Shit.PopupButtonClicked);
  }
}
