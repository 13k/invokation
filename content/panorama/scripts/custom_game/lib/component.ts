import { mapValues, uniqueId } from "lodash";
import type { Components } from "./const/component";
import { CSSClass, PanelType } from "./const/panorama";
import { CustomEvents } from "./custom_events";
import { Env, ENV } from "./env";
import { InputsTrigger, IO, OutputsBinding } from "./io";
import { LogFn, Logger, LogLevel } from "./logger";
import {
  ApplyPanelOptions,
  createPanel,
  CreatePanelOptions,
  isItemAbility,
  loadPanelLayout,
  prefixer,
  toParams,
} from "./util";

type FindElements = Record<string, string>;
type RegisterInputs = Record<string, string>;
type RegisterOutputs = string[];
type OnEvents = { [Event in invk.Events.EventName]?: string };
type OnUIEvents = {
  [elementName: string]: {
    [eventName in invk.Events.UIEventName]?: string;
  };
};

export interface ComponentOptions {
  elements?: FindElements;
  inputs?: RegisterInputs;
  outputs?: RegisterOutputs;
  customEvents?: OnEvents;
  elementEvents?: OnUIEvents;
  [key: string]: unknown;
}

interface ApplyComponentOptions {
  inputs?: Record<string, unknown>;
  outputs?: Record<string, string>;
}

interface ComponentCreatePanelOptions extends CreatePanelOptions {
  events?: Record<string, string>;
}

interface ComponentApplyPanelOptions extends ApplyPanelOptions {
  events?: Record<string, string>;
}

const LAYOUT_BASE_URI = "file://{resources}/layout/custom_game";

const elemIDing = (s: string): string => prefixer(s, "#");

const componentLayout = (layout: string): string => {
  if (layout.startsWith("file:")) {
    return layout;
  }

  if (layout.startsWith("/")) {
    layout = layout.slice(1);
  }

  return `${LAYOUT_BASE_URI}/${layout}`;
};

const getPanelComponent = <T extends Component>(panel: PanelBase): T | undefined =>
  (panel as any).component;

const setPanelComponent = (panel: PanelBase, component: Component): void => {
  (panel as any).component = component;
};

export abstract class Component {
  id: string;
  env: Env;
  logger: Logger;
  io: IO;
  ctx: Panel;
  elements: Record<string, Panel>;

  constructor(public options: ComponentOptions = {}) {
    this.id = uniqueId(`${this.constructor.name}.`);
    this.env = ENV;
    this.options = {};
    this.io = new IO();
    this.elements = {};
    this.logger = new Logger({
      level: this.env.development ? LogLevel.DEBUG : LogLevel.INFO,
      progname: this.id,
    });

    this.ctx = $.GetContextPanel();
    this.elements = this.findAll(this.options.elements);

    this.setupContextPanel();
    this.registerInputs(this.options.inputs);
    this.registerOutputs(this.options.outputs);
    this.unsubscribeAllEvents();
    this.onEvents(this.options.customEvents);
    this.onUIEvents(this.options.elementEvents);

    this.debug("init", { layout: this.ctx.layoutfile });
  }

  // ----- Internal -----

  private setupContextPanel(): void {
    // this.$ctx.component = this;
    setPanelComponent(this.ctx, this);

    if (this.env.development) {
      this.ctx.AddClass(CSSClass.Development);
    }
  }

  // ----- Logging -----

  log(level: LogLevel, ...args: unknown[]): void {
    this.logger.log(level, ...args);
  }

  debug(...args: unknown[]): void {
    this.log(LogLevel.DEBUG, ...args);
  }

  debugFn(fn: LogFn): void {
    this.logger.debugFn(fn.bind(this));
  }

  info(...args: unknown[]): void {
    this.log(LogLevel.INFO, ...args);
  }

  warn(...args: unknown[]): void {
    this.log(LogLevel.WARNING, ...args);
  }

  error(...args: unknown[]): void {
    this.log(LogLevel.ERROR, ...args);
  }

  // ----- Elements -----

  $(element: string | Panel): Panel {
    if (typeof element === "string") {
      return this.elements[element];
    }

    return element;
  }

  findAll(elements?: FindElements): Record<string, Panel> {
    if (elements == null) return {};

    return mapValues(elements, (elemID) => $(elemIDing(elemID)));
  }

  // ----- I/O -----

  handler(name: string): (...args: unknown[]) => unknown {
    return (this as any)[name].bind(this);
  }

  bindHandlers(handlers: Record<string, string>): Record<string, (...args: unknown[]) => unknown> {
    return mapValues(handlers, (handlerName) => this.handler(handlerName));
  }

  registerInputs(inputs?: RegisterInputs): void {
    if (inputs == null) return;

    const boundInputs = mapValues(inputs, (listenerName) => this.handler(listenerName));

    this.io.registerInputs(boundInputs);
  }

  inputs(inputs?: InputsTrigger): void {
    if (inputs == null) return;

    this.io.inputs(inputs);
  }

  registerOutputs(outputs?: RegisterOutputs): void {
    this.io.registerOutputs(outputs);
  }

  onOutputs(outputs?: OutputsBinding): void {
    if (outputs == null) return;

    this.io.onOutputs(outputs);
  }

  // ----- Events -----

  onEvent<K extends invk.Events.EventName>(event: K, listenerName: string): GameEventListenerID {
    const listener = this.handler(listenerName);
    const listenerID = CustomEvents.subscribe(this.id, event, listener);

    this.debugFn(() => ["subscribe", listenerID]);

    return listenerID;
  }

  onEvents(events?: OnEvents): void {
    if (events == null) return;

    Object.entries(events).forEach(([event, listenerName]) => {
      if (listenerName != null) {
        this.onEvent(event as invk.Events.EventName, listenerName);
      }
    });
  }

  unsubscribeEvents(...args: GameEventListenerID[]): void {
    CustomEvents.unsubscribe(this.id, ...args);
  }

  unsubscribeAllEvents(): void {
    const subscriptions = CustomEvents.unsubscribeSiblings(this.id);

    this.debugFn(() => (subscriptions ? ["unsubscribeAll", subscriptions] : null));
  }

  onUIEvent(element: string, event: invk.UIEvents.Name, listenerName: string): void {
    const listener = this.handler(listenerName);

    $.RegisterEventHandler(event, this.$(element), listener);
  }

  onUIEvents(events?: OnUIEvents): void {
    if (events == null) return;

    Object.entries(events).forEach(([element, elemEvents]) => {
      Object.entries(elemEvents).forEach(([event, listenerName]) => {
        if (listenerName != null) {
          const evValue = invk.UIEvents.Name[event as keyof typeof invk.UIEvents.Name];
          this.onUIEvent(element, evValue, listenerName);
        }
      });
    });
  }

  dispatchUIEvent(element: string | Panel, event: invk.UIEvents.Name, ...args: unknown[]): void {
    const panel = this.$(element);

    $.DispatchEvent(event, panel, ...args);
  }

  // ----- Element utils -----

  private applyComponentOptions<T extends Component>(
    component: T,
    options: ApplyComponentOptions = {}
  ): void {
    if (options.outputs) {
      // handlers are own functions
      const outputs = this.bindHandlers(options.outputs);

      component.onOutputs(outputs);
    }

    component.inputs(options.inputs);
  }

  private createElement<K extends keyof PanoramaPanelNameMap>(
    type: K,
    parent: PanelBase,
    id: string,
    options: ComponentCreatePanelOptions = {}
  ): PanoramaPanelNameMap[K] {
    const createPanelOptions: CreatePanelOptions = { ...options };

    if (options.events) {
      createPanelOptions.events = this.bindHandlers(options.events);
    }

    return createPanel(type, parent, id, createPanelOptions);
  }

  createPanel(parent: PanelBase, id: string, options: ComponentCreatePanelOptions = {}): Panel {
    return this.createElement(PanelType.Panel, parent, id, options);
  }

  createComponent<Layout extends keyof Components>(
    parent: PanelBase,
    id: string,
    layout: Layout,
    options: ComponentCreatePanelOptions & ApplyComponentOptions = {}
  ): Panel {
    const panel = this.createPanel(parent, id, { layout: componentLayout(layout), ...options });
    const component = getPanelComponent<Components[Layout]>(panel);

    if (component != null) {
      this.applyComponentOptions(component, options);
    }

    return panel;
  }

  loadComponent<T extends Panel, Layout extends keyof Components>(
    panel: T,
    layout: Layout,
    options: ComponentApplyPanelOptions & ApplyComponentOptions = {}
  ): T {
    const layoutUrl = componentLayout(layout);
    const applyPanelOptions: ApplyPanelOptions = { ...options };

    if (options.events) {
      applyPanelOptions.events = this.bindHandlers(options.events);
    }

    loadPanelLayout(panel, layoutUrl, applyPanelOptions);

    const component = getPanelComponent<Components[Layout]>(panel);

    if (component != null) {
      this.applyComponentOptions(component, options);
    }

    return panel;
  }

  createSnippet(
    parent: PanelBase,
    id: string,
    snippet: string,
    options: ComponentCreatePanelOptions = {}
  ): Panel {
    return this.createPanel(parent, id, { ...options, snippet });
  }

  createLabel(
    parent: PanelBase,
    id: string,
    text: string,
    options: ComponentCreatePanelOptions = {}
  ): LabelPanel {
    return this.createElement(PanelType.Label, parent, id, { ...options, props: { text } });
  }

  createAbilityImage(
    parent: PanelBase,
    id: string,
    abilityname: string,
    options: ComponentCreatePanelOptions = {}
  ): AbilityImage {
    options = { ...options, props: { abilityname } };

    return this.createElement(PanelType.AbilityImage, parent, id, options);
  }

  createItemImage(
    parent: PanelBase,
    id: string,
    itemname: string,
    options: ComponentCreatePanelOptions = {}
  ): ItemImage {
    options = { ...options, props: { itemname } };

    return this.createElement(PanelType.ItemImage, parent, id, options);
  }

  createAbilityOrItemImage(
    parent: PanelBase,
    id: string,
    name: string,
    options: ComponentCreatePanelOptions = {}
  ): ItemImage | AbilityImage {
    return isItemAbility(name)
      ? this.createItemImage(parent, id, name, options)
      : this.createAbilityImage(parent, id, name, options);
  }

  openExternalURL(element: string | Panel, url: string): void {
    this.dispatchUIEvent(element, invk.UIEvents.Name.OpenExternalBrowser, url);
  }

  playSound(soundEvent: string): void {
    return $.DispatchEvent(UI_EVENTS.PLAY_SOUND, soundEvent);
  }

  showTooltip(element, id, layout, params) {
    layout = componentLayout(layout);

    let args = _.chain([element]);

    if (params) {
      args = args.concat(UI_EVENTS.SHOW_TOOLTIP_PARAMS);
    } else {
      args = args.concat(UI_EVENTS.SHOW_TOOLTIP);
    }

    args = args.concat(id, layout);

    if (params) {
      args = args.concat(toParams(params));
    }

    return this.dispatch.apply(this, args.value());
  }

  hideTooltip(element, id) {
    return this.dispatch(element, UI_EVENTS.HIDE_TOOLTIP, id);
  }

  showTextTooltip(element, text) {
    return this.dispatch(element, UI_EVENTS.SHOW_TEXT_TOOLTIP, text);
  }

  hideTextTooltip(element) {
    return this.dispatch(element, UI_EVENTS.HIDE_TEXT_TOOLTIP);
  }

  showAbilityTooltip(element, abilityName, params) {
    params = params || {};

    let args = _.chain([element]);

    if (_.isInteger(params.entityIndex)) {
      args = args.concat(
        UI_EVENTS.SHOW_ABILITY_TOOLTIP_ENTITY_INDEX,
        abilityName,
        params.entityIndex
      );
    } else if (_.isString(params.guide)) {
      args = args.concat(UI_EVENTS.SHOW_ABILITY_TOOLTIP_GUIDE, abilityName, params.guide);
    } else if (_.isInteger(params.hero)) {
      args = args.concat(
        UI_EVENTS.SHOW_ABILITY_TOOLTIP_HERO,
        abilityName,
        params.hero,
        params.flag
      );
    } else if (_.isInteger(params.level)) {
      args = args.concat(UI_EVENTS.SHOW_ABILITY_TOOLTIP_LEVEL, abilityName, params.level);
    } else {
      args = args.concat(UI_EVENTS.SHOW_ABILITY_TOOLTIP, abilityName);
    }

    return this.dispatch.apply(this, args.value());
  }

  hideAbilityTooltip(element) {
    return this.dispatch(element, UI_EVENTS.HIDE_ABILITY_TOOLTIP);
  }

  showPopup(element, popupId, layout, params) {
    layout = componentLayout(layout);

    let args = _.chain([element]);

    if (params) {
      args = args.concat(UI_EVENTS.SHOW_POPUP_PARAMS);
    } else {
      args = args.concat(UI_EVENTS.SHOW_POPUP);
    }

    args = args.concat(popupId, layout);

    if (params) {
      args = args.concat(toParams(params));
    }

    return this.dispatch.apply(this, args.value());
  }

  closePopup(element) {
    return this.dispatch(element, UI_EVENTS.POPUP_BUTTON_CLICKED);
  }
}
