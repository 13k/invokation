namespace invk {
  export namespace Layout {
    export interface Components {
      [LayoutId.Challenge]: Components.Challenge.Challenge;
      [LayoutId.ChallengeComboStep]: Components.ChallengeComboStep.ChallengeComboStep;
      [LayoutId.CombatLog]: Components.CombatLog.CombatLog;
      [LayoutId.ComboScore]: Components.ComboScore.ComboScore;
      [LayoutId.CustomLoadingScreen]: Components.CustomLoadingScreen.CustomLoadingScreen;
      [LayoutId.CustomUiManifest]: Components.CustomUiManifest.CustomUiManifest;
      [LayoutId.Freestyle]: Components.Freestyle.Freestyle;
      [LayoutId.Picker]: Components.Picker.Picker;
      [LayoutId.PickerCombo]: Components.PickerCombo.PickerCombo;
      [LayoutId.TopBar]: Components.TopBar.TopBar;
      [LayoutId.Viewer]: Components.Viewer.Viewer;
      [LayoutId.ViewerComboStep]: Components.ViewerComboStep.ViewerComboStep;
      [LayoutId.ViewerProperties]: Components.ViewerProperties.ViewerProperties;
      // UI
      [LayoutId.UiInvokerSpellCard]: Components.Ui.InvokerSpellCard.InvokerSpellCard;
      [LayoutId.UiItemPicker]: Components.Ui.ItemPicker.ItemPicker;
      [LayoutId.UiTagSelect]: Components.Ui.TagSelect.TagSelect;
      [LayoutId.UiTalentsDisplay]: Components.Ui.TalentsDisplay.TalentsDisplay;
      // Popups
      [LayoutId.PopupGameInfo]: Components.Popups.GameInfo.PopupGameInfo;
      [LayoutId.PopupInvokerAbilityPicker]: Components.Popups.InvokerAbilityPicker.PopupInvokerAbilityPicker;
      [LayoutId.PopupItemPicker]: Components.Popups.ItemPicker.PopupItemPicker;
      [LayoutId.PopupTextEntry]: Components.Popups.TextEntry.PopupTextEntry;
      // Tooltips
      [LayoutId.TooltipStatBranch]: Components.Tooltips.StatBranch.TooltipStatBranch;
    }
  }

  export namespace Component {
    const {
      CustomEvents,
      Layout,
      Callbacks: { Callbacks },
      Logger: { Logger },
      Panorama: { UiEvent, createPanel, debugPanel, serializeParams },
      Singleton: { ENV },
      Util: { prefixOnce, uniqueId },
    } = GameUI.CustomUIConfig().invk;

    import AbilityTooltipParams = invk.Panorama.AbilityTooltipParams;
    import Callback = invk.Callbacks.Callback;
    import Components = invk.Layout.Components;
    import CustomEvent = invk.CustomEvents.CustomEvent;
    import CustomEventListener = invk.CustomEvents.CustomEventListener;
    import CustomGameEvent = invk.CustomEvents.CustomGameEvent;
    import GameEvent = invk.CustomEvents.GameEvent;
    import LayoutId = invk.Layout.LayoutId;
    import PanelEventListener = invk.Panorama.PanelEventListener;
    import UiEventListener = invk.Panorama.UiEventListener;

    export type Elements = Record<string, Panel>;
    export type Inputs = object;
    export type Outputs = object;
    export type Params = Record<string, unknown>;

    export interface Options<E extends Elements, I extends Inputs, P extends Params> {
      elements?: ElementsOptions<E>;
      customEvents?: CustomEventsOptions;
      uiEvents?: UiEventsOptions<E>;
      panelEvents?: PanelEventsOptions<E>;
      inputs?: InputsOptions<I>;
      params?: ParamsOptions<P>;
    }

    export type ElementsOptions<E extends Elements> = { [K in keyof E]: string };
    export type CustomEventsOptions = { [K in CustomEvent]?: CustomEventListener<K> };
    export type InputsOptions<I extends Inputs> = { [K in keyof I]: Callback<I, K> };
    export type OutputsOptions<O extends Outputs> = { [K in keyof O]?: Callback<O, K> };
    export type ParamsOptions<P extends Params> = { [K in keyof P]: ParamDescriptor };

    export type UiEventsOptions<E extends Elements> = {
      [K in keyof E | "$"]?: { [K in Panorama.UiEvent]?: UiEventListener };
    };

    export type PanelEventsOptions<E extends Elements> = {
      [K in keyof E | "$"]?: { [K in PanelEvent]?: PanelEventListener };
    };

    interface Data<
      C extends Component<E, I, O, P>,
      E extends Elements,
      I extends Inputs,
      O extends Outputs,
      P extends Params,
    > {
      component: C;
    }

    interface DataPanel<
      C extends Component<E, I, O, P>,
      E extends Elements,
      I extends Inputs,
      O extends Outputs,
      P extends Params,
    > extends Panel {
      // biome-ignore lint/style/useNamingConvention: builtin type
      Data<T = Data<C, E, I, O, P>>(): T;
    }

    type LayoutData<K extends keyof Components> = Data<
      Components[K],
      Components[K]["elements"],
      Inputs,
      Outputs,
      Components[K]["params"]
    >;

    export enum ParamType {
      String = 0,
      Int = 1,
      Uint32 = 2,
    }

    export interface AttributeTypes {
      [ParamType.String]: string;
      [ParamType.Int]: number;
      [ParamType.Uint32]: number;
    }

    export interface ParamDescriptor {
      type: ParamType;
      default?: AttributeTypes[this["type"]];
    }

    enum CssClass {
      Development = "Development",
    }

    export abstract class Component<
      E extends Elements = never,
      I extends Inputs = never,
      O extends Outputs = never,
      P extends Params = never,
    > {
      id: string;
      env: Env.Env;
      panel: DataPanel<this, E, I, O, P>;
      elements: E;
      params: P;

      protected logger: Logger.Logger;

      #inputs: Callbacks.Callbacks<I>;
      #outputs: Callbacks.Callbacks<O>;
      #paramsOptions: ParamsOptions<P> | undefined;

      constructor(options: Options<E, I, P> = {}) {
        this.id = uniqueId(`${this.constructor.name}.`);
        this.logger = new Logger({ name: this.id });
        this.env = ENV;
        this.panel = $.GetContextPanel();

        this.debug("constructor()", {
          id: this.id,
          env: this.env,
          panel: debugPanel(this.panel),
        });

        this.elements = this.findElements(options.elements);
        this.#paramsOptions = options.params;
        this.params = {} as P;

        this.#inputs = new Callbacks();
        this.#outputs = new Callbacks();

        this.#setup();
        this.unsubscribeSiblings();
        this.registerInputs(options.inputs);
        this.subscribeAll(options.customEvents);
        this.listenAll(options.uiEvents);
        this.setPanelEvents(options.panelEvents);
      }

      // ----- Internal -----

      get data(): Data<this, E, I, O, P> {
        return this.panel.Data<Data<this, E, I, O, P>>();
      }

      #setup() {
        this.data.component = this;

        if (this.env.development) {
          this.panel.AddClass(CssClass.Development);
        }

        this.panel.SetPanelEvent("onload", this.#onLoad.bind(this));
      }

      #onLoad(): void {
        this.params = this.loadParams(this.#paramsOptions);
        this.debug("onLoad()", { params: this.params });
        this.onLoad();
      }

      /** subclasses can override to customize on-load behavior */
      protected onLoad(): void {
        return;
      }

      // ----- Logging -----

      log(level: Logger.Level, ...args: unknown[]): void {
        this.logger.log(level, ...args);
      }

      logFn(level: Logger.Level, fn: Logger.LazyFn): void {
        this.logger.logFn(level, fn);
      }

      debug(...args: unknown[]): void {
        this.log(Logger.LEVEL.Debug, ...args);
      }

      info(...args: unknown[]): void {
        this.log(Logger.LEVEL.Info, ...args);
      }

      warn(...args: unknown[]): void {
        this.log(Logger.LEVEL.Warning, ...args);
      }

      error(...args: unknown[]): void {
        this.log(Logger.LEVEL.Error, ...args);
      }

      debugFn(fn: Logger.LazyFn): void {
        this.logFn(Logger.LEVEL.Debug, fn.bind(this));
      }

      // ----- I/O -----

      registerInput<K extends keyof I>(name: K, cb: Callback<I, K>): void {
        this.#inputs.on(name, cb);
      }

      registerInputs(inputs?: InputsOptions<I>): void {
        if (inputs == null) {
          return;
        }

        for (const [name, cb] of Object.entries(inputs)) {
          this.registerInput(name as keyof I, cb as Callback<I, keyof I>);
        }
      }

      registerOutput<K extends keyof O>(name: K, cb: Callback<O, K>): void {
        this.#outputs.on(name, cb);
      }

      registerOutputs(outputs: OutputsOptions<O>): void {
        for (const [name, cb] of Object.entries(outputs)) {
          const key = name as keyof O;

          this.registerOutput(key, cb as Callback<O, typeof key>);
        }
      }

      input<K extends keyof I>(name: K, payload: I[K]): void {
        this.#inputs.run(name, payload);
      }

      inputs<K extends keyof I>(inputs: { [K in keyof I]?: I[K] }): void {
        for (const [name, payload] of Object.entries(inputs)) {
          this.input(name as keyof I, payload as I[K]);
        }
      }

      output<K extends keyof O>(name: K, payload: O[K]): void {
        this.#outputs.run(name, payload);
      }

      outputs<K extends keyof O>(outputs: { [K in keyof O]?: O[K] }): void {
        for (const [name, payload] of Object.entries(outputs)) {
          this.output(name as keyof O, payload as O[K]);
        }
      }

      // ----- Custom events -----

      subscribe<K extends CustomEvent>(
        event: K,
        listener: CustomEventListener<K>,
      ): GameEventListenerID {
        return CustomEvents.subscribe(this.id, event, listener);
      }

      subscribeAll(options?: CustomEventsOptions): void {
        if (options == null) {
          return;
        }

        for (const [event, listener] of Object.entries(options)) {
          const eventName = event as CustomEvent;

          this.subscribe(eventName, listener as CustomEventListener<CustomEvent>);
        }
      }

      unsubscribe(id: GameEventListenerID): void {
        CustomEvents.unsubscribe(id);
      }

      unsubscribeSiblings(): void {
        const subscriptions = CustomEvents.unsubscribeAllSiblings(this.id);

        this.debugFn(() =>
          (subscriptions?.size ?? 0) > 0 ? ["unsubscribe.siblings", subscriptions] : null,
        );
      }

      sendServer<K extends CustomGameEvent>(
        name: K,
        payload: CustomGameEventDeclarations[K],
      ): void {
        CustomEvents.sendServer(name, payload);
      }

      sendAll<K extends CustomGameEvent>(name: K, payload: CustomGameEventDeclarations[K]): void {
        CustomEvents.sendAll(name, payload);
      }

      sendPlayer<K extends CustomGameEvent>(
        playerId: PlayerID,
        name: K,
        payload: CustomGameEventDeclarations[K],
      ): void {
        CustomEvents.sendPlayer(playerId, name, payload);
      }

      sendClientSide<K extends GameEvent>(name: K, payload: GameEventDeclarations[K]): void {
        CustomEvents.sendClientSide(name, payload);
      }

      // ----- Game UI -----

      hudError(message: string, soundEvent: string): void {
        GameUI.SendCustomHUDError(message, soundEvent);
      }

      setUi<K extends keyof typeof DotaDefaultUIElement_t>(
        elementType: K | DotaDefaultUIElement_t,
        state: boolean,
      ): void {
        const ty =
          typeof elementType === "string" ? DotaDefaultUIElement_t[elementType] : elementType;

        GameUI.SetDefaultUIEnabled(ty, state);
      }

      showUi<K extends keyof typeof DotaDefaultUIElement_t>(
        elementType: K | DotaDefaultUIElement_t,
      ): void {
        this.setUi(elementType, true);
      }

      hideUi<K extends keyof typeof DotaDefaultUIElement_t>(
        elementType: K | DotaDefaultUIElement_t,
      ): void {
        this.setUi(elementType, false);
      }

      showActionPanelUi(): void {
        this.showUi("DOTA_DEFAULT_UI_ACTION_PANEL");
      }

      hideActionPanelUi(): void {
        this.hideUi("DOTA_DEFAULT_UI_ACTION_PANEL");
      }

      showInventoryShopUi(): void {
        this.showUi("DOTA_DEFAULT_UI_INVENTORY_SHOP");
      }

      hideInventoryShopUi(): void {
        this.hideUi("DOTA_DEFAULT_UI_INVENTORY_SHOP");
      }

      // ----- Element utils -----

      element(ref: string): Panel;
      element(ref: "$"): this["panel"];
      element<K extends keyof E & string>(ref: K): E[K];
      element<K extends keyof E & string>(ref: K | "$" | string): E[K] | Panel {
        if (ref === "$") {
          return this.panel;
        }

        if (ref.startsWith("#")) {
          return $.FindChildInContext(ref);
        }

        return this.elements[ref];
      }

      /**
       * @example
       * findElements({ name1: "#elem1", name2: "Elmen2", ... })
       * // returns { name1: $("#elem1"), name2: $("#Elem2"), ... }
       */
      findElements(options?: ElementsOptions<E>): E {
        const elements = {} as E;

        if (options == null) {
          return elements;
        }

        for (const [name, id] of Object.entries(options)) {
          const idpfx = prefixOnce(id, "#");
          const panel = $.FindChildInContext(idpfx);

          if (panel == null) {
            throw new Error(`Could not find panel with id="${id}" ("${idpfx}")`);
          }

          elements[name as keyof E] = panel as E[keyof E];
        }

        return elements;
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

      loadParams(options?: ParamsOptions<P>): P {
        const params = {} as P;

        if (options == null) {
          return params;
        }

        this.debug("loadParams()", options);

        for (const [k, v] of Object.entries(options)) {
          switch (v.type) {
            case ParamType.String: {
              params[k as keyof P] = this.attrStr(
                k,
                (v.default == null ? "" : v.default) as string,
              );

              break;
            }
            case ParamType.Int: {
              params[k as keyof P] = this.attrInt(k, (v.default == null ? 0 : v.default) as number);

              break;
            }
            case ParamType.Uint32: {
              params[k as keyof P] = this.attrUint32(
                k,
                (v.default == null ? 0 : v.default) as number,
              );

              break;
            }
            default: {
              const _check: never = v.type;
              throw new Error(`Component param ${k} with unknown type ${_check}`);
            }
          }
        }

        return params;
      }

      create<K extends LayoutId & keyof Components>(
        layoutId: K,
        elemId: string,
        parent: Panel = this.panel,
      ): Components[K] {
        const panel = createPanel(parent, elemId, Layout.path(layoutId));

        this.debugFn(() => ["create()", { layoutId, elemId, panel: debugPanel(panel) }]);

        const { component } = panel.Data<LayoutData<K>>();

        return component;
      }

      load<K extends LayoutId & keyof Components>(
        panel: Panel,
        layoutId: K,
        override = false,
        partial = false,
      ): Components[K] {
        panel.BLoadLayout(Layout.path(layoutId), override, partial);

        const { component } = panel.Data<LayoutData<K>>();

        return component;
      }

      // ----- UI events -----

      listen(element: Panel, event: Panorama.UiEvent, listener: Panorama.UiEventListener): void {
        $.RegisterEventHandler(event, element, listener);
      }

      listenAll(options?: UiEventsOptions<E>): void {
        if (options == null) {
          return;
        }

        for (const [element, events] of Object.entries(options)) {
          for (const [event, listener] of Object.entries(events ?? {})) {
            this.listen(this.element(element), event as Panorama.UiEvent, listener);
          }
        }
      }

      setPanelEvents(options?: PanelEventsOptions<E>): void {
        if (options == null) {
          return;
        }

        for (const [element, events] of Object.entries(options)) {
          for (const [event, listener] of Object.entries(events || {})) {
            this.element(element).SetPanelEvent(event as PanelEvent, listener);
          }
        }
      }

      dispatch(element: Panel, event: string, ...args: unknown[]): void {
        $.DispatchEvent(event, element, ...args);
      }

      openUrl(element: Panel, url: string): void {
        this.dispatch(element, UiEvent.BrowserGoToUrl, url);
      }

      playSound(soundEvent: string): void {
        $.DispatchEvent(UiEvent.PlaySound, soundEvent);
      }

      showTooltip<K extends LayoutId>(
        parent: Panel,
        layoutId: K,
        id: string,
        params?: Components[K]["params"],
      ): void {
        const path = Layout.path(layoutId);

        if (params == null) {
          this.dispatch(parent, UiEvent.ShowTooltip, id, path);
          return;
        }

        this.dispatch(parent, UiEvent.ShowTooltipParams, id, path, serializeParams(params));
      }

      hideTooltip(parent: Panel, id: string): void {
        this.dispatch(parent, UiEvent.HideTooltip, id);
      }

      showTextTooltip(parent: Panel, text: string): void {
        this.dispatch(parent, UiEvent.ShowTextTooltip, text);
      }

      hideTextTooltip(parent: Panel): void {
        this.dispatch(parent, UiEvent.HideTextTooltip);
      }

      showAbilityTooltip(parent: Panel, abilityName: string, params?: AbilityTooltipParams): void {
        if (params == null) {
          this.dispatch(parent, UiEvent.ShowAbilityTooltip, abilityName);
          return;
        }

        if ("entityIndex" in params) {
          this.dispatch(
            parent,
            UiEvent.ShowAbilityTooltipEntityIndex,
            abilityName,
            params.entityIndex,
          );
        } else if ("guide" in params) {
          this.dispatch(parent, UiEvent.ShowAbilityTooltipGuide, abilityName, params.guide);
        } else if ("hero" in params) {
          this.dispatch(
            parent,
            UiEvent.ShowAbilityTooltipHero,
            abilityName,
            params.hero,
            params.flag,
          );
        } else if ("level" in params) {
          this.dispatch(parent, UiEvent.ShowAbilityTooltipLevel, abilityName, params.level);
        }
      }

      hideAbilityTooltip(parent: Panel): void {
        this.dispatch(parent, UiEvent.HideAbilityTooltip);
      }

      showPopup<K extends LayoutId>(
        parent: Panel,
        layoutId: K,
        id: string,
        params?: Components[K]["params"],
      ): void {
        const path = Layout.path(layoutId);

        if (params == null) {
          this.dispatch(parent, UiEvent.ShowPopup, id, path);
          return;
        }

        this.dispatch(parent, UiEvent.ShowPopupParams, id, path, serializeParams(params));
      }

      closePopup(parent: Panel): void {
        this.dispatch(parent, UiEvent.PopupButtonClicked);
      }
    }
  }
}
