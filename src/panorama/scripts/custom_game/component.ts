namespace invk {
  export namespace Layout {
    export interface Components {
      [Layout.ID.Challenge]: invk.Components.Challenge.Challenge;
      [Layout.ID.ChallengeComboStep]: invk.Components.ChallengeComboStep.ChallengeComboStep;
      [Layout.ID.CombatLog]: invk.Components.CombatLog.CombatLog;
      [Layout.ID.ComboScore]: invk.Components.ComboScore.ComboScore;
      [Layout.ID.CustomLoadingScreen]: invk.Components.CustomLoadingScreen.CustomLoadingScreen;
      [Layout.ID.CustomUIManifest]: invk.Components.CustomUIManifest.CustomUIManifest;
      [Layout.ID.Freestyle]: invk.Components.Freestyle.Freestyle;
      [Layout.ID.Picker]: invk.Components.Picker.Picker;
      [Layout.ID.PickerCombo]: invk.Components.PickerCombo.PickerCombo;
      [Layout.ID.TopBar]: invk.Components.TopBar.TopBar;
      [Layout.ID.Viewer]: invk.Components.Viewer.Viewer;
      [Layout.ID.ViewerComboStep]: invk.Components.ViewerComboStep.ViewerComboStep;
      [Layout.ID.ViewerProperties]: invk.Components.ViewerProperties.ViewerProperties;
      // UI
      [Layout.ID.UIItemPicker]: invk.Components.UI.ItemPicker.ItemPicker;
      [Layout.ID.UITagSelect]: invk.Components.UI.TagSelect.TagSelect;
      [Layout.ID.UITalentsDisplay]: invk.Components.UI.TalentsDisplay.TalentsDisplay;
      // Popups
      [Layout.ID.PopupGameInfo]: invk.Components.Popups.PopupGameInfo.PopupGameInfo;
      [Layout.ID
        .PopupInvokerAbilityPicker]: invk.Components.Popups.PopupInvokerAbilityPicker.PopupInvokerAbilityPicker;
      [Layout.ID.PopupItemPicker]: invk.Components.Popups.PopupItemPicker.PopupItemPicker;
      [Layout.ID.PopupTextEntry]: invk.Components.Popups.PopupTextEntry.PopupTextEntry;
      // Tooltips
      [Layout.ID.TooltipStatBranch]: invk.Components.Tooltips.TooltipStatBranch.TooltipStatBranch;
    }

    export interface PopupParams {
      [Layout.ID.PopupGameInfo]: invk.Components.Popups.PopupGameInfo.Params;
      [Layout.ID
        .PopupInvokerAbilityPicker]: invk.Components.Popups.PopupInvokerAbilityPicker.Params;
      [Layout.ID.PopupItemPicker]: invk.Components.Popups.PopupItemPicker.Params;
      [Layout.ID.PopupTextEntry]: invk.Components.Popups.PopupTextEntry.Params;
    }

    export interface TooltipParams {
      [Layout.ID.TooltipStatBranch]: invk.Components.Tooltips.TooltipStatBranch.Params;
    }
  }

  export namespace Component {
    const {
      CustomEvents,
      Layout,
      Callbacks: { Callbacks },
      CustomEvents: { Name: CustomEventName },
      Logger: { Logger },
      Panorama: { UIEvent, serializeParams, createPanel },
      Static: { ENV },
      Util: { prefixer },
      Vendor: { lodash: _ },
    } = GameUI.CustomUIConfig().invk;

    export type Elements = Record<string, Panel>;
    export type Inputs = object;
    export type Outputs = object;
    // TODO: parameterize component with Params and auto-load parameters (attach OnLoad event in setup?)
    export type Params = object;

    interface Data<
      C extends Component<E, I, O>,
      E extends Elements,
      I extends Inputs,
      O extends Outputs
    > {
      component: C;
    }

    interface DataPanel<
      C extends Component<E, I, O>,
      E extends Elements,
      I extends Inputs,
      O extends Outputs
    > extends Panel {
      Data<T = Data<C, E, I, O>>(): T;
    }

    export interface Options<E extends Elements, I extends Inputs> {
      elements?: ElementsOption<E>;
      inputs?: InputsOption<I>;
      customEvents?: CustomEventsOption;
      elementEvents?: ElementEventsOption<E>;
    }

    export type ElementsOption<E extends Elements> = { [K in keyof E]: string };
    // TODO: parameterize payloads
    export type InputsOption<I extends Inputs> = { [K in keyof I]: HandlerOption };
    // TODO: parameterize payloads
    export type OutputsOption<O extends Outputs> = { [K in keyof O]?: (payload: O[K]) => void };
    // TODO: parameterize payloads
    export type CustomEventsOption = { [K in keyof typeof CustomEvents.Name]?: HandlerOption };
    // TODO: parameterize payloads
    export type ElementEventsOption<E extends Elements> = {
      [K in keyof E]?: {
        [K in keyof typeof Panorama.UIEvent]?: HandlerOption;
      };
    };

    export type HandlerOption = string | HandlerFn;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type HandlerFn = (...args: any[]) => void;

    type LayoutData<K extends keyof Layout.Components> = Data<
      Layout.Components[K],
      Layout.Components[K]["elements"],
      Inputs,
      Outputs
    >;

    enum CssClass {
      Development = "Development",
    }

    export class Component<E extends Elements, I extends Inputs, O extends Outputs> {
      id: string;
      env: Env.Env;
      panel: DataPanel<this, E, I, O>;
      elements: E;

      private inputsCB: Callbacks.Callbacks<I>;
      private outputsCB: Callbacks.Callbacks<O>;
      private logger: Logger.Logger;

      constructor(options: Options<E, I> = {}) {
        this.id = _.uniqueId(`${this.constructor.name}.`);
        this.env = ENV;
        this.panel = $.GetContextPanel();

        this.inputsCB = new Callbacks();
        this.outputsCB = new Callbacks();

        this.logger = new Logger({
          level: this.env.development ? Logger.Level.Debug : Logger.Level.Info,
          name: this.id,
        });

        this.elements = this.findElements(options.elements);

        this.setup();
        this.registerInputs(options.inputs);
        this.unsubscribeAllSiblings();
        this.subscribeAll(options.customEvents);
        this.listenAll(options.elementEvents);
      }

      /******************************
       * Internal
       ******************************/

      get data(): Data<this, E, I, O> {
        return this.panel.Data<Data<this, E, I, O>>();
      }

      setup() {
        this.data.component = this;

        if (this.env.development) {
          this.panel.AddClass(CssClass.Development);
        }
      }

      handler(fnOpt: HandlerOption): HandlerFn {
        if (_.isString(fnOpt)) {
          fnOpt = _.bindKey(this, fnOpt);
        }

        return fnOpt;
      }

      /******************************
       * Logging
       ******************************/

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      log(level: Logger.Level, ...args: any[]): void {
        this.logger.log(level, ...args);
      }

      logFn(level: Logger.Level, fn: Logger.LazyFn): void {
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

      debugFn(fn: Logger.LazyFn): void {
        this.logFn(Logger.Level.Debug, fn.bind(this));
      }

      /******************************
       * I/O
       ******************************/

      // TODO: rename to output
      runOutput<K extends keyof O>(name: K, payload: O[K]): void {
        this.outputsCB.run(name, payload);
      }

      // TODO: rename to registerOutput
      Output<K extends keyof O>(name: K, fn: HandlerFn): void {
        this.outputsCB.on(name, fn);
      }

      // TODO: rename to registerOutputs
      Outputs(outputs: OutputsOption<O>): void {
        _.each(outputs, (fn, name) => (fn ? this.Output(name as keyof O, fn) : undefined));
      }

      registerInput<K extends keyof I>(name: K, fnOpt: HandlerOption): void {
        this.inputsCB.on(name, this.handler(fnOpt));
      }

      registerInputs(inputs?: InputsOption<I>): void {
        if (!inputs) return;

        _.each(inputs, (fn, name) => this.registerInput(name as keyof I, fn));
      }

      // TODO: rename to input
      Input<K extends keyof I>(name: K, payload: I[K]): void {
        this.inputsCB.run(name, payload);
      }

      /******************************
       * Custom events
       ******************************/

      customEventName<K extends keyof typeof CustomEvents.Name>(
        event: K | CustomEvents.Name
      ): CustomEvents.Name {
        if (event in CustomEventName) {
          return CustomEventName[event as K];
        }

        return event as CustomEvents.Name;
      }

      subscribe<K extends keyof typeof CustomEvents.Name>(
        event: K | CustomEvents.Name,
        fnOpt: HandlerOption
      ): GameEventListenerID {
        return CustomEvents.subscribe(this.id, this.customEventName(event), this.handler(fnOpt));
      }

      subscribeAll(events?: CustomEventsOption): void {
        if (!events) return;

        _.each(events, (fnOpt, event) =>
          fnOpt ? this.subscribe(event as keyof typeof CustomEvents.Name, fnOpt) : null
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

      element(ref: string): Panel;
      element<K extends keyof E & string>(ref: K): E[K];
      element<K extends keyof E & string>(ref: K | string): E[K] | Panel {
        return _.startsWith(ref, "#") ? $.FindChildInContext(ref) : this.elements[ref];
      }

      // findElements({ name1: "elem1", name2: "Elmen2", ... })
      //   -> { name1: $("#elem1"), name2: $("#Elem2"), ... }
      findElements(options?: ElementsOption<E>): E {
        this.debug("findElements()", options);

        if (!options) {
          return {} as E;
        }

        return _.transform(
          options,
          (result, id, name) => {
            const idpfx = prefixer(id, "#");

            const panel = $.FindChildInContext(idpfx) as E[keyof E];

            if (panel == null) {
              throw new Error(`Could not find panel with id=${id}`);
            }

            result[name as keyof E] = panel;
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

      attrUint32<T>(attr: string, defaultValue: number): T {
        return this.panel.GetAttributeUInt32(attr, defaultValue) as T;
      }

      create<K extends Layout.ID & keyof Layout.Components>(
        layoutID: K,
        elemID: string,
        parent: Panel = this.panel
      ): Layout.Components[K] {
        const panel = createPanel(parent, elemID, Layout.path(layoutID));

        const { component } = panel.Data<LayoutData<K>>();

        return component;
      }

      load<K extends Layout.ID & keyof Layout.Components>(
        panel: Panel,
        layoutID: K,
        override = false,
        partial = false
      ): Layout.Components[K] {
        panel.BLoadLayout(Layout.path(layoutID), override, partial);

        const { component } = panel.Data<LayoutData<K>>();

        return component;
      }

      /******************************
       * UI events
       ******************************/

      uiEventName<K extends keyof typeof Panorama.UIEvent>(
        event: K | Panorama.UIEvent
      ): Panorama.UIEvent {
        if (event in UIEvent) {
          return UIEvent[event as K];
        }

        return event as Panorama.UIEvent;
      }

      listen<K extends keyof typeof Panorama.UIEvent>(
        element: Panel,
        event: K | Panorama.UIEvent,
        fnOpt: HandlerOption
      ): void {
        event = this.uiEventName(event);
        this.debug("registering element event listener", { event, element });
        $.RegisterEventHandler(event, element, this.handler(fnOpt));
      }

      listenAll(events?: ElementEventsOption<E>): void {
        if (!events) return;

        const specs = _.flatMap(events, (elemEvents, element) =>
          _.map(elemEvents, (handler, event) => ({ element, event, handler }))
        );

        _.each(specs, (spec) =>
          spec.handler
            ? this.listen(
                this.element(spec.element),
                spec.event as keyof typeof Panorama.UIEvent,
                spec.handler
              )
            : undefined
        );
      }

      dispatch(element: Panel, event: string, ...args: unknown[]): void {
        $.DispatchEvent(event, element, ...args);
      }

      openExternalURL(element: Panel, url: string): void {
        this.dispatch(element, UIEvent.EXTERNAL_BROWSER_GO_TO_URL, url);
      }

      playSound(soundEvent: string): void {
        $.DispatchEvent(UIEvent.PLAY_SOUND, soundEvent);
      }

      showTooltip<K extends Layout.ID & keyof Layout.TooltipParams>(
        parent: Panel,
        layoutID: K,
        id: string,
        params?: Layout.TooltipParams[K]
      ): void {
        const layout = Layout.path(layoutID);

        if (!params) {
          this.dispatch(parent, UIEvent.SHOW_TOOLTIP, id, layout);
          return;
        }

        this.dispatch(parent, UIEvent.SHOW_TOOLTIP_PARAMS, id, layout, serializeParams(params));
      }

      hideTooltip(parent: Panel, id: string): void {
        this.dispatch(parent, UIEvent.HIDE_TOOLTIP, id);
      }

      showTextTooltip(parent: Panel, text: string): void {
        this.dispatch(parent, UIEvent.SHOW_TEXT_TOOLTIP, text);
      }

      hideTextTooltip(parent: Panel): void {
        this.dispatch(parent, UIEvent.HIDE_TEXT_TOOLTIP);
      }

      showAbilityTooltip(
        parent: Panel,
        abilityName: string,
        params?: Panorama.AbilityTooltipParams
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

      hideAbilityTooltip(parent: Panel): void {
        this.dispatch(parent, UIEvent.HIDE_ABILITY_TOOLTIP);
      }

      showPopup<K extends Layout.ID & keyof Layout.PopupParams>(
        parent: Panel,
        layoutID: K,
        id: string,
        params?: Layout.PopupParams[K]
      ): void {
        const layout = Layout.path(layoutID);

        if (!params) {
          this.dispatch(parent, UIEvent.SHOW_POPUP, id, layout);
          return;
        }

        this.dispatch(parent, UIEvent.SHOW_POPUP_PARAMS, id, layout, serializeParams(params));
      }

      closePopup(parent: Panel): void {
        this.dispatch(parent, UIEvent.POPUP_BUTTON_CLICKED);
      }
    }
  }
}
