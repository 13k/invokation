import { mapValues, transform, uniqueId } from "lodash";
import { ComponentLayout, Components } from "./const/component";
import { CustomEvent, EventListener } from "./const/events";
import type { PanelWithComponent, WithComponent } from "./const/panorama";
import { CSSClass, PanelType } from "./const/panorama";
import { CustomEvents } from "./custom_events";
import { Env, ENV } from "./env";
import { InputsBinding, InputsTrigger, IO, OutputsBinding } from "./io";
import { LogFn, Logger, LogLevel } from "./logger";
import { PanelEventListener, PanelEvents } from "./panel_events";
import {
  ApplyPanelOptions,
  createPanel,
  CreatePanelOptions,
  isItemAbility,
  loadPanelLayout,
  prefixer,
} from "./util";

interface ApplyComponentOptions {
  inputs?: Record<string, unknown>;
  outputs?: OutputsBinding;
}

const LAYOUT_BASE_URI = "file://{resources}/layout/custom_game";

const elemID = (s: string): string => prefixer(s, "#");

const componentLayout = (layout: string): string => {
  if (layout.startsWith("file:")) {
    return layout;
  }

  if (layout.startsWith("/")) {
    layout = layout.slice(1);
  }

  return `${LAYOUT_BASE_URI}/${layout}`;
};

export function getPanelComponent<T extends Component>(panel: Panel): T {
  return (panel as PanelWithComponent<T>).component;
}

export function setPanelComponent<T extends Component>(panel: Panel, component: T): void {
  (panel as PanelWithComponent<T>).component = component;
}

export abstract class Component {
  id: string;
  env: Env;
  logger: Logger;
  io: IO;
  ctx: Panel;

  constructor() {
    this.id = uniqueId(`${this.constructor.name}.`);
    this.env = ENV;
    this.io = new IO();
    this.logger = new Logger({
      level: this.env.development ? LogLevel.DEBUG : LogLevel.INFO,
      progname: this.id,
    });

    this.ctx = $.GetContextPanel();

    this.setupContextPanel();
    this.unsubscribeAllEvents();

    this.debug("init", { layout: this.ctx.layoutfile });
  }

  // ----- Internal -----

  private setupContextPanel(): void {
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

  findAll<T>(obj: { [K in keyof T]: string }): T {
    return transform<{ [K in keyof T]: string }, T>(
      obj,
      (r, value, key) => {
        r[key] = ($(elemID(value)) as unknown) as T[typeof key];
      },
      {} as T
    );
  }

  // ----- I/O -----

  /*
  bind(name: string): (...args: unknown[]) => unknown {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any)[name].bind(this);
  }

  binds<M extends MethodMapping<this>>(
    this: this & HasMethods<this, M>,
    mapping: M
  ): MethodBinding<this, M> {
    return transform<M, MethodBinding<this, M>>(
      mapping,
      (binding, methodName, name) => {
        binding[name] = this[methodName].bind(this);
      },
      {} as MethodBinding<this, M>
    );
  }
  */

  bindAll(
    mapping: Record<string, (...args: unknown[]) => unknown>
  ): Record<string, (...args: unknown[]) => unknown> {
    return mapValues(mapping, (fn) => fn.bind(this));
  }

  // listeners are own functions
  registerInputs(inputs: InputsBinding): void {
    const boundInputs = this.bindAll(inputs);

    this.io.registerInputs(boundInputs);
  }

  input(input: string, payload?: unknown): void {
    this.io.input(input, payload);
  }

  inputs(inputs?: InputsTrigger): void {
    if (inputs == null) return;

    this.io.inputs(inputs);
  }

  registerOutputs(outputs: string[]): void {
    this.io.registerOutputs(outputs);
  }

  // listeners are external functions
  onOutputs(outputs: OutputsBinding): void {
    this.io.onOutputs(outputs);
  }

  output(output: string, payload?: unknown): void {
    this.io.output(output, payload);
  }

  // ----- Events -----

  onCustomEvent<K extends CustomEvent>(event: K, listener: EventListener<K>): GameEventListenerID {
    const listenerID = CustomEvents.subscribe(this.id, event, listener.bind(this));

    this.debugFn(() => ["subscribe", { event, listenerID }]);

    return listenerID;
  }

  unsubscribeAllEvents(): void {
    const subscriptions = CustomEvents.unsubscribeSiblings(this.id);

    this.debugFn(() => ["unsubscribeAll", { subscriptions }]);
  }

  onPanelEvent<T extends PanelBase>(
    panel: T,
    event: PanelEvent,
    listener: PanelEventListener<T>
  ): void {
    PanelEvents.listen(panel, event, listener.bind(this));
  }

  // ----- Element utils -----

  private applyComponentOptions<T extends Component>(
    component: T,
    options: ApplyComponentOptions = {}
  ): void {
    if (options.outputs) {
      // listeners are own functions
      const outputs = this.bindAll(options.outputs);

      component.onOutputs(outputs);
    }

    component.inputs(options.inputs);
  }

  private createElement<K extends keyof PanoramaPanelNameMap>(
    type: K,
    parent: PanelBase,
    id: string,
    options: CreatePanelOptions<PanoramaPanelNameMap[K]> = {}
  ): PanoramaPanelNameMap[K] {
    return createPanel(type, parent, id, options);
  }

  createPanel(parent: PanelBase, id: string, options: CreatePanelOptions<Panel> = {}): Panel {
    return this.createElement(PanelType.Panel, parent, id, options);
  }

  createComponent<Layout extends ComponentLayout>(
    parent: PanelBase,
    id: string,
    layout: Layout,
    options: CreatePanelOptions<Panel> & ApplyComponentOptions = {}
  ): PanelWithComponent<Components[Layout]> {
    const panel = this.createPanel(parent, id, { ...options, layout: componentLayout(layout) });
    const component = getPanelComponent<Components[Layout]>(panel);

    this.applyComponentOptions(component, options);

    return panel as PanelWithComponent<Components[Layout]>;
  }

  loadComponent<T extends Panel, Layout extends ComponentLayout>(
    panel: T,
    layout: Layout,
    options: ApplyPanelOptions<T> & ApplyComponentOptions = {}
  ): WithComponent<T, Components[Layout]> {
    const layoutUrl = componentLayout(layout);

    loadPanelLayout(panel, layoutUrl, options);

    const component = getPanelComponent<Components[Layout]>(panel);

    this.applyComponentOptions(component, options);

    return panel as WithComponent<T, Components[Layout]>;
  }

  createSnippet(
    parent: PanelBase,
    id: string,
    snippet: string,
    options: CreatePanelOptions<Panel> = {}
  ): Panel {
    return this.createPanel(parent, id, { ...options, snippet });
  }

  createLabel(
    parent: PanelBase,
    id: string,
    text: string,
    options: CreatePanelOptions<LabelPanel> = {}
  ): LabelPanel {
    return this.createElement(PanelType.Label, parent, id, { ...options, props: { text } });
  }

  createAbilityImage(
    parent: PanelBase,
    id: string,
    abilityname: string,
    options: CreatePanelOptions<AbilityImage> = {}
  ): AbilityImage {
    options = { ...options, props: { abilityname } };

    return this.createElement(PanelType.AbilityImage, parent, id, options);
  }

  createItemImage(
    parent: PanelBase,
    id: string,
    itemname: string,
    options: CreatePanelOptions<ItemImage> = {}
  ): ItemImage {
    options = { ...options, props: { itemname } };

    return this.createElement(PanelType.ItemImage, parent, id, options);
  }

  createAbilityOrItemImage(
    parent: PanelBase,
    id: string,
    name: string,
    options: CreatePanelOptions<AbilityImage | ItemImage> = {}
  ): AbilityImage | ItemImage {
    return isItemAbility(name)
      ? this.createItemImage(parent, id, name, options)
      : this.createAbilityImage(parent, id, name, options);
  }
}
