// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace layout {
    export interface Components {
      [LayoutID.Challenge]: components.Challenge.Challenge;
      [LayoutID.ChallengeComboStep]: components.ChallengeComboStep.ChallengeComboStep;
      [LayoutID.CombatLog]: components.CombatLog.CombatLog;
      [LayoutID.ComboScore]: components.ComboScore.ComboScore;
      [LayoutID.CustomLoadingScreen]: components.CustomLoadingScreen.CustomLoadingScreen;
      [LayoutID.CustomUIManifest]: components.CustomUIManifest.CustomUIManifest;
      [LayoutID.Freestyle]: components.Freestyle.Freestyle;
      [LayoutID.Picker]: components.picker.Picker;
      [LayoutID.PickerCombo]: components.PickerCombo.PickerCombo;
      [LayoutID.TopBar]: components.TopBar.TopBar;
      [LayoutID.Viewer]: components.Viewer.Viewer;
      [LayoutID.ViewerComboStep]: components.ViewerComboStep.ViewerComboStep;
      [LayoutID.ViewerProperties]: components.ViewerProperties.ViewerProperties;
      // UI
      [LayoutID.UIInvokerSpellCard]: components.ui.invoker_spell_card.InvokerSpellCard;
      [LayoutID.UIItemPicker]: components.ui.item_picker.ItemPicker;
      [LayoutID.UITagSelect]: components.ui.tag_select.TagSelect;
      [LayoutID.UITalentsDisplay]: components.ui.talents_display.TalentsDisplay;
      // Popups
      [LayoutID.PopupGameInfo]: components.popups.game_info.PopupGameInfo;
      [LayoutID.PopupInvokerAbilityPicker]: components.popups.invoker_ability_picker.PopupInvokerAbilityPicker;
      [LayoutID.PopupItemPicker]: components.popups.item_picker.PopupItemPicker;
      [LayoutID.PopupTextEntry]: components.popups.text_entry.PopupTextEntry;
      // Tooltips
      [LayoutID.TooltipStatBranch]: components.tooltips.stat_branch.TooltipStatBranch;
    }
  }

  export namespace component {
    const {
      custom_events,
      layout,
      callbacks: { Callbacks },
      logger: { Logger },
      panorama: { UIEvent, createPanel, debugPanel, serializeParams },
      singleton: { ENV },
      util: { prefixOnce, uniqueId },
    } = GameUI.CustomUIConfig().invk;

    import AbilityTooltipParams = invk.panorama.AbilityTooltipParams;
    import Callback = invk.callbacks.Callback;
    import Components = invk.layout.Components;
    import CustomGameEvent = invk.custom_events.CustomGameEvent;
    import Event = invk.custom_events.Event;
    import GameEvent = invk.custom_events.GameEvent;
    import LayoutID = invk.layout.LayoutID;

    export type Elements = Record<string, Panel>;
    export type Inputs = object;
    export type Outputs = object;
    export type Params = Record<string, unknown>;

    export interface Options<E extends Elements, I extends Inputs, P extends Params> {
      elements?: ElementsOption<E>;
      customEvents?: CustomEventsOption;
      uiEvents?: UIEventsOption<E>;
      panelEvents?: PanelEventsOption<E>;
      inputs?: InputsOption<I>;
      params?: ParamsOption<P>;
    }

    export type ElementsOption<E extends Elements> = { [K in keyof E]: string };
    export type CustomEventsOption = { [K in Event]?: custom_events.Listener<K> };
    export type InputsOption<I extends Inputs> = { [K in keyof I]: Callback<I, K> };
    export type OutputsOption<O extends Outputs> = { [K in keyof O]?: Callback<O, K> };
    export type ParamsOption<P extends Params> = { [K in keyof P]: ParamDescriptor };

    export type UIEventsOption<E extends Elements> = {
      [K in keyof E | "$"]?: { [K in panorama.UIEvent]?: panorama.UIEventListener };
    };

    export type PanelEventsOption<E extends Elements> = {
      [K in keyof E | "$"]?: { [K in PanelEvent]?: panorama.PanelEventListener };
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
      UInt32 = 2,
    }

    export interface AttributeTypes {
      [ParamType.String]: string;
      [ParamType.Int]: number;
      [ParamType.UInt32]: number;
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
      env: env.Env;
      panel: DataPanel<this, E, I, O, P>;
      elements: E;
      params: P;

      private inputsCb: callbacks.Callbacks<I>;
      private outputsCb: callbacks.Callbacks<O>;
      private paramsOptions?: ParamsOption<P> | undefined;
      protected logger: logger.Logger;

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
        this.paramsOptions = options.params;
        this.params = {} as P;

        this.inputsCb = new Callbacks();
        this.outputsCb = new Callbacks();

        this.setup();
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

      private setup() {
        this.data.component = this;

        if (this.env.development) {
          this.panel.AddClass(CssClass.Development);
        }

        this.panel.SetPanelEvent("onload", this._onLoad.bind(this));
      }

      private _onLoad(): void {
        this.params = this.loadParams(this.paramsOptions);
        this.debug("onLoad()", { params: this.params });
        this.onLoad();
      }

      protected onLoad(): void {
        return;
      }

      // ----- Logging -----

      log(level: logger.Level, ...args: unknown[]): void {
        this.logger.log(level, ...args);
      }

      logFn(level: logger.Level, fn: logger.LazyFn): void {
        this.logger.logFn(level, fn);
      }

      debug(...args: unknown[]): void {
        this.log(Logger.Level.Debug, ...args);
      }

      info(...args: unknown[]): void {
        this.log(Logger.Level.Info, ...args);
      }

      warn(...args: unknown[]): void {
        this.log(Logger.Level.Warning, ...args);
      }

      error(...args: unknown[]): void {
        this.log(Logger.Level.Error, ...args);
      }

      debugFn(fn: logger.LazyFn): void {
        this.logFn(Logger.Level.Debug, fn.bind(this));
      }

      // ----- I/O -----

      registerInput<K extends keyof I>(name: K, cb: Callback<I, K>): void {
        this.inputsCb.on(name, cb);
      }

      registerInputs(inputs?: InputsOption<I>): void {
        if (inputs == null) return;

        for (const [name, cb] of Object.entries(inputs)) {
          const key = name as keyof I;

          this.registerInput(key, cb as Callback<I, typeof key>);
        }
      }

      registerOutput<K extends keyof O>(name: K, cb: Callback<O, K>): void {
        this.outputsCb.on(name, cb);
      }

      registerOutputs(outputs: OutputsOption<O>): void {
        for (const [name, cb] of Object.entries(outputs)) {
          const key = name as keyof O;

          this.registerOutput(name as keyof O, cb as Callback<O, typeof key>);
        }
      }

      input<K extends keyof I>(name: K, payload: I[K]): void {
        this.inputsCb.run(name, payload);
      }

      output<K extends keyof O>(name: K, payload: O[K]): void {
        this.outputsCb.run(name, payload);
      }

      // ----- Custom events -----

      subscribe<K extends Event>(
        event: K,
        listener: custom_events.Listener<K>,
      ): GameEventListenerID {
        return custom_events.subscribe(this.id, event, listener);
      }

      subscribeAll(options?: CustomEventsOption): void {
        if (options == null) return;

        for (const [event, listener] of Object.entries(options)) {
          const eventName = event as Event;

          this.subscribe(eventName, listener as custom_events.Listener<Event>);
        }
      }

      unsubscribe(id: GameEventListenerID): void {
        custom_events.unsubscribe(id);
      }

      unsubscribeSiblings(): void {
        const subscriptions = custom_events.unsubscribeAllSiblings(this.id);

        this.debugFn(() =>
          (subscriptions?.size ?? 0) > 0 ? ["unsubscribe.siblings", subscriptions] : null,
        );
      }

      sendServer<K extends CustomGameEvent>(
        name: K,
        payload: CustomGameEventDeclarations[K],
      ): void {
        custom_events.sendServer(name, payload);
      }

      sendAll<K extends CustomGameEvent>(name: K, payload: CustomGameEventDeclarations[K]): void {
        custom_events.sendAll(name, payload);
      }

      sendPlayer<K extends CustomGameEvent>(
        playerId: PlayerID,
        name: K,
        payload: CustomGameEventDeclarations[K],
      ): void {
        custom_events.sendPlayer(playerId, name, payload);
      }

      sendClientSide<K extends GameEvent>(name: K, payload: GameEventDeclarations[K]): void {
        custom_events.sendClientSide(name, payload);
      }

      // ----- Game UI -----

      hudError(message: string, soundEvent: string): void {
        GameUI.SendCustomHUDError(message, soundEvent);
      }

      setUI<K extends keyof typeof DotaDefaultUIElement_t>(
        elementType: K | DotaDefaultUIElement_t,
        state: boolean,
      ): void {
        const ty =
          typeof elementType === "string" ? DotaDefaultUIElement_t[elementType] : elementType;

        GameUI.SetDefaultUIEnabled(ty, state);
      }

      showUI<K extends keyof typeof DotaDefaultUIElement_t>(
        elementType: K | DotaDefaultUIElement_t,
      ): void {
        this.setUI(elementType, true);
      }

      hideUI<K extends keyof typeof DotaDefaultUIElement_t>(
        elementType: K | DotaDefaultUIElement_t,
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
      findElements(options?: ElementsOption<E>): E {
        const elements = {} as E;

        if (options == null) return elements;

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

      loadParams(options?: ParamsOption<P>): P {
        const params = {} as P;

        if (options == null) return params;

        this.debug("loadParams()", options);

        for (const [k, v] of Object.entries(options)) {
          switch (v.type) {
            case ParamType.String:
              params[k as keyof P] = this.attrStr(
                k,
                (v.default == null ? "" : v.default) as string,
              );

              break;
            case ParamType.Int:
              params[k as keyof P] = this.attrInt(k, (v.default == null ? 0 : v.default) as number);

              break;
            case ParamType.UInt32:
              params[k as keyof P] = this.attrUint32(
                k,
                (v.default == null ? 0 : v.default) as number,
              );

              break;
            default: {
              const _check: never = v.type;
              throw new Error(`Component param ${k} with unknown type ${_check}`);
            }
          }
        }

        return params;
      }

      create<K extends LayoutID & keyof Components>(
        layoutId: K,
        elemId: string,
        parent: Panel = this.panel,
      ): Components[K] {
        const panel = createPanel(parent, elemId, layout.path(layoutId));

        this.debug("create()", { layoutId, elemID: elemId, panel: debugPanel(panel) });

        const { component } = panel.Data<LayoutData<K>>();

        return component;
      }

      load<K extends LayoutID & keyof Components>(
        panel: Panel,
        layoutId: K,
        override = false,
        partial = false,
      ): Components[K] {
        panel.BLoadLayout(layout.path(layoutId), override, partial);

        const { component } = panel.Data<LayoutData<K>>();

        return component;
      }

      // ----- UI events -----

      listen(element: Panel, event: panorama.UIEvent, listener: panorama.UIEventListener): void {
        $.RegisterEventHandler(event, element, listener);
      }

      listenAll(options?: UIEventsOption<E>): void {
        if (options == null) return;

        for (const [element, events] of Object.entries(options)) {
          for (const [event, listener] of Object.entries(events ?? {})) {
            this.listen(this.element(element), event as panorama.UIEvent, listener);
          }
        }
      }

      setPanelEvents(options?: PanelEventsOption<E>): void {
        if (options == null) return;

        for (const [element, events] of Object.entries(options)) {
          for (const [event, listener] of Object.entries(events || {})) {
            this.element(element).SetPanelEvent(event as PanelEvent, listener);
          }
        }
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

      showTooltip<K extends LayoutID>(
        parent: Panel,
        layoutId: K,
        id: string,
        params?: Components[K]["params"],
      ): void {
        const path = layout.path(layoutId);

        if (params == null) {
          this.dispatch(parent, UIEvent.SHOW_TOOLTIP, id, path);
          return;
        }

        this.dispatch(parent, UIEvent.SHOW_TOOLTIP_PARAMS, id, path, serializeParams(params));
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

      showAbilityTooltip(parent: Panel, abilityName: string, params?: AbilityTooltipParams): void {
        if (params == null) {
          this.dispatch(parent, UIEvent.SHOW_ABILITY_TOOLTIP, abilityName);
          return;
        }

        if ("entityIndex" in params) {
          this.dispatch(
            parent,
            UIEvent.SHOW_ABILITY_TOOLTIP_ENTITY_INDEX,
            abilityName,
            params.entityIndex,
          );
        } else if ("guide" in params) {
          this.dispatch(parent, UIEvent.SHOW_ABILITY_TOOLTIP_GUIDE, abilityName, params.guide);
        } else if ("hero" in params) {
          this.dispatch(
            parent,
            UIEvent.SHOW_ABILITY_TOOLTIP_HERO,
            abilityName,
            params.hero,
            params.flag,
          );
        } else if ("level" in params) {
          this.dispatch(parent, UIEvent.SHOW_ABILITY_TOOLTIP_LEVEL, abilityName, params.level);
        }
      }

      hideAbilityTooltip(parent: Panel): void {
        this.dispatch(parent, UIEvent.HIDE_ABILITY_TOOLTIP);
      }

      showPopup<K extends LayoutID>(
        parent: Panel,
        layoutId: K,
        id: string,
        params?: Components[K]["params"],
      ): void {
        const path = layout.path(layoutId);

        if (params == null) {
          this.dispatch(parent, UIEvent.SHOW_POPUP, id, path);
          return;
        }

        this.dispatch(parent, UIEvent.SHOW_POPUP_PARAMS, id, path, serializeParams(params));
      }

      closePopup(parent: Panel): void {
        this.dispatch(parent, UIEvent.POPUP_BUTTON_CLICKED);
      }
    }
  }
}
