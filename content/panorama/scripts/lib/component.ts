import type { Callbacks as TCallbacks } from "./callbacks";
import type { Name as CustomEventName } from "./custom_events";
import type { Env as TEnv } from "./env";
import type { Components, ID as LayoutID, PopupParams, TooltipParams } from "./layout";
import type * as TLogger from "./logger";
import type { AbilityTooltipParams, UIEvent as TUIEvent } from "./panorama";

export type Elements = Record<string, Panel>;

interface Data<C extends Component<E>, E extends Elements> {
  component: C;
}

interface DataPanel<C extends Component<E>, E extends Elements> extends Panel {
  Data<T = Data<C, E>>(): T;
}

type LData<K extends keyof Components> = Data<Components[K], Components[K]["elements"]>;

export type LayoutContext = Record<string, unknown>;

export interface Options<E> {
  elements?: ElementsOption<E>;
  inputs?: RegisterInputsOption;
  customEvents?: CustomEventsOption;
  elementEvents?: ElementEventsOption;
}

export type HandlerOption = string | HandlerFn;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerFn = (...args: any[]) => void;

export type FindElementOption<E> = (keyof E & string) | `#${string}` | Panel;
export type ElementsArrayOption<E> = (keyof E & string)[];
export type ElementsMappingOption<E> = Record<keyof E, string>;
export type ElementsOption<E> = ElementsArrayOption<E> | ElementsMappingOption<E>;

export type RegisterInputsOption = Record<string, HandlerOption>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TriggerInputsOption = Record<string, any>;
export type RegisterOutputsOption = Record<string, HandlerOption>;

export type CustomEventsOption = {
  [K in keyof typeof CustomEventName]?: HandlerOption;
};

export interface ElementEventsOption {
  [id: string]: {
    [K in keyof typeof TUIEvent]?: HandlerOption;
  };
}

const {
  lodash: _,

  Callbacks,
  CustomEvents,
  Layout,
  Logger,
  Panorama: { UIEvent, serializeParams, createPanel },
  Util: { prefixer, pascalCase },

  ENV,
} = CustomUIConfig;

enum CssClass {
  Development = "Development",
}

const elemMappingID = <E>(id: keyof E & string): string => pascalCase(id);
const elemMappingOption = <E>(elements: ElementsArrayOption<E>): ElementsMappingOption<E> =>
  _.transform(
    elements,
    (map, id) => {
      map[id] = elemMappingID<E>(id);
    },
    {} as ElementsMappingOption<E>
  );

// TODO: parameterize inputs (forward to Callbacks)
// TODO: parameterize outputs (forward to Callbacks)
// TODO: parameterize custom events
class Component<E extends Elements> {
  id: string;
  env: TEnv;
  panel: DataPanel<this, E>;
  elements: E;
  inputs: TCallbacks;
  outputs: TCallbacks;
  logger: TLogger.Logger;

  constructor(options: Options<E> = {}) {
    this.id = _.uniqueId(`${this.constructor.name}.`);
    this.env = ENV;

    this.panel = $.GetContextPanel();
    this.elements = this.findElements(options.elements);

    this.inputs = new Callbacks();
    this.outputs = new Callbacks();

    this.logger = new Logger({
      level: this.env.development ? Logger.Level.Debug : Logger.Level.Info,
      name: this.id,
    });

    this.setup();
    this.registerInputs(options.inputs);
    this.unsubscribeAllSiblings();
    this.subscribeAll(options.customEvents);
    this.listenAll(options.elementEvents);
  }

  /******************************
   * Internal
   ******************************/

  get data(): Data<this, E> {
    return this.panel.Data<Data<this, E>>();
  }

  setup() {
    this.data.component = this;

    if (this.env.development) {
      this.panel.AddClass(CssClass.Development);
    }
  }

  handler(fn: HandlerOption): HandlerFn {
    if (_.isString(fn)) {
      fn = _.bindKey(this, fn);
    }

    return fn;
  }

  eventName<K extends keyof typeof CustomEventName>(event: K): typeof CustomEventName[K] {
    return CustomEvents.Name[event];
  }

  /******************************
   * Logging
   ******************************/

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(level: TLogger.Level, ...args: any[]): void {
    this.logger.log(level, ...args);
  }

  logFn(level: TLogger.Level, fn: TLogger.LazyFn): void {
    this.logger.logFn(level, fn);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...args: any[]): void {
    this.log(Logger.Level.Debug, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...args: any[]): void {
    this.log(Logger.Level.Info, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...args: any[]): void {
    this.log(Logger.Level.Warning, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args: any[]): void {
    this.log(Logger.Level.Error, ...args);
  }

  debugFn(fn: TLogger.LazyFn): void {
    this.logFn(Logger.Level.Debug, fn.bind(this));
  }

  /******************************
   * I/O
   ******************************/

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runOutput(name: string, payload: any): void {
    this.outputs.run(name, payload);
  }

  Output(name: string, fn: HandlerOption): void {
    this.outputs.on(name, this.handler(fn));
  }

  Outputs(outputs: RegisterOutputsOption): void {
    _.each(outputs, (fn, name) => this.Output(name, fn));
  }

  registerInput(name: string, fn: HandlerOption): void {
    this.inputs.on(name, this.handler(fn));
  }

  registerInputs(inputs?: RegisterInputsOption): void {
    if (!inputs) return;

    _.each(inputs, (fn, name) => this.registerInput(name, fn));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input(name: string, payload: any = {}): void {
    this.inputs.run(name, payload);
  }

  Inputs(inputs: TriggerInputsOption): void {
    _.each(inputs, (payload, name) => this.Input(name, payload));
  }

  /******************************
   * Custom events
   ******************************/

  subscribe<K extends keyof typeof CustomEventName>(
    event: K,
    fnOpt: HandlerOption
  ): GameEventListenerID {
    return CustomEvents.subscribe(this.id, this.eventName(event), this.handler(fnOpt));
  }

  subscribeAll(events?: CustomEventsOption): void {
    if (!events) return;

    _.each(events, (fnOpt, event) =>
      fnOpt ? this.subscribe(event as keyof typeof CustomEventName, fnOpt) : null
    );
  }

  unsubscribe(id: GameEventListenerID): void {
    CustomEvents.unsubscribe(id);
  }

  unsubscribeAllSiblings(): void {
    const subscriptions = CustomEvents.unsubscribeAllSiblings(this.id);

    this.debugFn(() => (subscriptions ? ["unsubscribeAll", subscriptions] : null));
  }

  sendServer<K extends keyof CustomGameEventDeclarations>(
    name: K,
    payload: GameEvents.InferCustomGameEventType<K, never>
  ): void {
    CustomEvents.sendServer(name, payload);
  }

  sendAll<K extends keyof CustomGameEventDeclarations>(
    name: K,
    payload: GameEvents.InferCustomGameEventType<K, never>
  ): void {
    CustomEvents.sendAll(name, payload);
  }

  sendPlayer<K extends keyof CustomGameEventDeclarations>(
    playerID: PlayerID,
    name: K,
    payload: GameEvents.InferCustomGameEventType<K, never>
  ): void {
    CustomEvents.sendPlayer(playerID, name, payload);
  }

  sendClientSide<K extends keyof GameEventDeclarations>(
    name: K,
    payload: GameEventDeclarations[K]
  ): void {
    CustomEvents.sendClientSide(name, payload);
  }

  /******************************
   * Game UI
   ******************************/

  hudError(message: string, soundEvent: string): void {
    GameUI.SendCustomHUDError(message, soundEvent);
  }

  setUI<K extends keyof typeof DotaDefaultUIElement_t>(
    elementType: K | DotaDefaultUIElement_t,
    state: boolean
  ): void {
    if (_.isString(elementType)) {
      elementType = DotaDefaultUIElement_t[elementType];
    }

    GameUI.SetDefaultUIEnabled(elementType, state);
  }

  showUI<K extends keyof typeof DotaDefaultUIElement_t>(
    elementType: K | DotaDefaultUIElement_t
  ): void {
    this.setUI(elementType, true);
  }

  hideUI<K extends keyof typeof DotaDefaultUIElement_t>(
    elementType: K | DotaDefaultUIElement_t
  ): void {
    this.setUI(elementType, false);
  }

  showActionPanelUI(): void {
    this.showUI("DOTA_DEFAULT_UI_ACTION_PANEL");
  }

  hideActionPanelUI(): void {
    this.hideUI("DOTA_DEFAULT_UI_ACTION_PANEL");
  }

  showInventoryShopUI(): void {
    this.showUI("DOTA_DEFAULT_UI_INVENTORY_SHOP");
  }

  hideInventoryShopUI(): void {
    this.hideUI("DOTA_DEFAULT_UI_INVENTORY_SHOP");
  }

  /******************************
   * Element utils
   ******************************/

  // element("#elementID") -> $("#elementID")
  // element("element") -> this.elements["element"]
  // element(Panel) -> Panel
  element<K extends keyof E>(element: FindElementOption<E>): E[K] | Panel {
    if (!_.isString(element)) {
      return element;
    }

    if (_.startsWith(element, "#")) {
      return $(element);
    }

    return this.elements[element];
  }

  // findElements([ "elem1", "Elem2", ... ])
  //   -> { myElem1: $("#elem1"), myElem2: $("#Elem2"), ... }
  // findElements({ name1: "elem1", name2: "Elmen2", ... })
  //   -> { name1: $("#elem1"), name2: $("#Elem2"), ... }
  findElements(elements?: ElementsOption<E>): E {
    if (!elements) return {} as E;

    const find = <K extends keyof E>(id: K & string): E[K] => $(prefixer(id, "#")) as E[K];
    const mapping = Array.isArray(elements) ? elemMappingOption(elements) : elements;

    return _.transform(
      mapping,
      (result, id: string, name: keyof E) => {
        result[name] = find(id);
      },
      {} as E
    );
  }

  attrStr<T>(attr: string, defaultValue: string): T {
    return this.panel.GetAttributeString(attr, defaultValue) as T;
  }

  attrInt<T>(attr: string, defaultValue: number): T {
    return this.panel.GetAttributeInt(attr, defaultValue) as T;
  }

  create<K extends LayoutID & keyof Components>(
    layoutID: K,
    elemID: string,
    parent: Panel = this.panel
  ): Components[K] {
    const panel = createPanel(parent, elemID, Layout.Path(layoutID));

    const { component } = panel.Data<LData<K>>();

    return component;
  }

  load<K extends LayoutID & keyof Components>(
    panel: Panel,
    layoutID: K,
    override = false,
    partial = false
  ): Components[K] {
    panel.BLoadLayout(Layout.Path(layoutID), override, partial);

    const { component } = panel.Data<LData<K>>();

    return component;
  }

  /******************************
   * UI events
   ******************************/

  listen(element: FindElementOption<E>, event: string, fn: HandlerOption): void {
    $.RegisterEventHandler(event, this.element(element), this.handler(fn));
  }

  listenAll(events?: ElementEventsOption): void {
    if (!events) return;

    const specs = _.flatMap(events, (elemEvents, element) =>
      _.map(elemEvents, (handler, event) => ({ element, event, handler }))
    );

    _.each(specs, (spec) => spec.handler && this.listen(spec.element, spec.event, spec.handler));
  }

  dispatch(element: FindElementOption<E>, event: string, ...args: unknown[]): void {
    $.DispatchEvent(event, this.element(element), ...args);
  }

  openExternalURL(element: FindElementOption<E>, url: string): void {
    this.dispatch(element, UIEvent.EXTERNAL_BROWSER_GO_TO_URL, url);
  }

  playSound(soundEvent: string): void {
    $.DispatchEvent(UIEvent.PLAY_SOUND, soundEvent);
  }

  showTooltip<K extends LayoutID & keyof TooltipParams>(
    parent: FindElementOption<E>,
    layoutID: K,
    id: string,
    params?: TooltipParams[K]
  ): void {
    const layout = Layout.Path(layoutID);

    if (!params) {
      this.dispatch(parent, UIEvent.SHOW_TOOLTIP, id, layout);
      return;
    }

    this.dispatch(parent, UIEvent.SHOW_TOOLTIP_PARAMS, id, layout, serializeParams(params));
  }

  hideTooltip(parent: FindElementOption<E>, id: string): void {
    this.dispatch(parent, UIEvent.HIDE_TOOLTIP, id);
  }

  showTextTooltip(parent: FindElementOption<E>, text: string): void {
    this.dispatch(parent, UIEvent.SHOW_TEXT_TOOLTIP, text);
  }

  hideTextTooltip(parent: FindElementOption<E>): void {
    this.dispatch(parent, UIEvent.HIDE_TEXT_TOOLTIP);
  }

  showAbilityTooltip(
    parent: FindElementOption<E>,
    abilityName: string,
    params?: AbilityTooltipParams
  ): void {
    if (!params) {
      this.dispatch(parent, UIEvent.SHOW_ABILITY_TOOLTIP, abilityName);
      return;
    }

    if ("entityIndex" in params) {
      this.dispatch(
        parent,
        UIEvent.SHOW_ABILITY_TOOLTIP_ENTITY_INDEX,
        abilityName,
        params.entityIndex
      );
    } else if ("guide" in params) {
      this.dispatch(parent, UIEvent.SHOW_ABILITY_TOOLTIP_GUIDE, abilityName, params.guide);
    } else if ("hero" in params) {
      this.dispatch(
        parent,
        UIEvent.SHOW_ABILITY_TOOLTIP_HERO,
        abilityName,
        params.hero,
        params.flag
      );
    } else if ("level" in params) {
      this.dispatch(parent, UIEvent.SHOW_ABILITY_TOOLTIP_LEVEL, abilityName, params.level);
    }
  }

  hideAbilityTooltip(parent: FindElementOption<E>): void {
    this.dispatch(parent, UIEvent.HIDE_ABILITY_TOOLTIP);
  }

  showPopup<K extends LayoutID & keyof PopupParams>(
    parent: FindElementOption<E>,
    layoutID: K,
    id: string,
    params?: PopupParams[K]
  ): void {
    const layout = Layout.Path(layoutID);

    if (!params) {
      this.dispatch(parent, UIEvent.SHOW_POPUP, id, layout);
      return;
    }

    this.dispatch(parent, UIEvent.SHOW_POPUP_PARAMS, id, layout, serializeParams(params));
  }

  closePopup(parent: FindElementOption<E>): void {
    this.dispatch(parent, UIEvent.POPUP_BUTTON_CLICKED);
  }
}

export type { Component };

CustomUIConfig.Component = Component;
