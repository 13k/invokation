"use strict";

((global, context) => {
  const { lodash: _, ENV, Logger, Callbacks, CustomEvents } = global;
  const { CSS_CLASSES, DOTA_UI, EVENTS, UI_EVENTS } = global.Const;
  const {
    CreatePanelWithLayout,
    CreatePanelWithLayoutSnippet,
    CreateAbilityImage,
    CreateItemImage,
    Prefixer,
    ElementParams,
  } = global.Util;

  const elemAttrNamer = _.partialRight(Prefixer, "$");
  const elemIDing = _.partialRight(Prefixer, "#");

  /***
   * Component class must be included in each context individually.
   ***/
  class Component {
    constructor(options) {
      this.options = options || {};
      this.classid = _.uniqueId(this.constructor.name + ".");
      this.env = ENV;
      this.$ctx = $.GetContextPanel();
      this.data = {};
      this.inputs = {};
      this.outputs = new Callbacks();

      this.logger = new Logger({
        level: this.env.development ? Logger.DEBUG : Logger.INFO,
        progname: this.classid,
      });

      this.setupContextPanel();
      this.findElements(this.options.elements);
      this.registerInputs(this.options.inputs);
      this.unsubscribeAllSiblings();
      this.subscribeAll(this.options.customEvents);
      this.listenAll(this.options.elementEvents);
    }

    // ----- Internal -----

    setupContextPanel() {
      this.debug("layout", this.$ctx.layoutfile);

      this.$ctx.component = this;

      if (this.env.development) {
        this.$ctx.AddClass(CSS_CLASSES.DEVELOPMENT);
      }
    }

    // eventName("!event") -> EVENTS["event"]
    // eventName("event") -> "event"
    eventName(event) {
      if (_.startsWith(event, "!")) {
        event = EVENTS[_.trimStart(event, "!")];
      }

      return event;
    }

    // handler("fn") -> this["fn"].bind(this)
    // handler(Function) -> Function
    handler(fn) {
      if (_.isString(fn)) {
        fn = _.bindKey(this, fn);
      }

      return fn;
    }

    // element("#elementID") -> $("#elementID")
    // element("$element") -> _.get(this, "$element")
    // element("element") -> _.get(this, "$element")
    // element(Panel) -> Panel
    element(element) {
      if (_.isString(element)) {
        if (_.startsWith(element, "#")) {
          element = $(element);
        } else {
          element = _.get(this, elemAttrNamer(element));
        }
      }

      return element;
    }

    // ----- Component logging -----

    _log(levelName, args) {
      args = _.toArray(args);
      args.unshift(Logger[levelName]);
      return this.logger.log.apply(this.logger, args);
    }

    log() {
      return this.logger.log.apply(this.logger, arguments);
    }

    debug() {
      return this._log("DEBUG", arguments);
    }

    debugFn(fn) {
      return this.logger.debugFn(fn.bind(this));
    }

    info() {
      return this._log("INFO", arguments);
    }

    warn() {
      return this._log("WARNING", arguments);
    }

    error() {
      return this._log("ERROR", arguments);
    }

    // ----- Component Data ------

    set(key, value) {
      this.data[key] = value;
      return value;
    }

    update(data) {
      _.assign(this.data, data);
      return this.data;
    }

    Get(key) {
      return this.data[key];
    }

    // ----- Component I/O -----

    runOutput(name, payload) {
      return this.outputs.Run(name, payload);
    }

    Output(name, fn) {
      return this.outputs.On(name, this.handler(fn));
    }

    Outputs(outputs) {
      return _.map(outputs, _.rearg(this.Output.bind(this), [1, 0]));
    }

    registerInput(name, fn) {
      this.inputs[name] = this.handler(fn);
      return name;
    }

    registerInputs(inputs) {
      return _.map(inputs, _.rearg(this.registerInput.bind(this), [1, 0]));
    }

    Input(name, payload) {
      return _.invoke(this.inputs, name, payload);
    }

    Inputs(inputs) {
      return _.mapValues(inputs, _.rearg(this.Input.bind(this), [1, 0]));
    }

    // ----- Context Panel Data -----

    AddClasses(classes) {
      return _.map(classes, (cls) => this.$ctx.AddClass(cls));
    }

    SetDialogVars(vars) {
      return _.mapValues(vars, (value, key) => this.$ctx.SetDialogVariable(key, value));
    }

    SetDialogVarsInt(vars) {
      return _.mapValues(vars, (value, key) => this.$ctx.SetDialogVariableInt(key, value));
    }

    SetDialogVarsTime(vars) {
      return _.mapValues(vars, (value, key) => this.$ctx.SetDialogVariableTime(key, value));
    }

    SetAttributes(attrs) {
      return _.mapValues(attrs, (value, key) => this.$ctx.SetAttributeString(key, value));
    }

    SetAttributesInt(attrs) {
      return _.mapValues(attrs, (value, key) => this.$ctx.SetAttributeInt(key, value));
    }

    SetEvent(eventName, handler) {
      return this.$ctx.SetPanelEvent(eventName, this.handler(handler));
    }

    SetEvents(events) {
      return _.map(events, (handler, eventName) => this.SetEvent(eventName, handler));
    }

    // ----- Custom Events -----

    subscribe(event, fn) {
      return CustomEvents.Subscribe(this.classid, this.eventName(event), this.handler(fn));
    }

    subscribeAll(events) {
      return _.mapValues(events, _.rearg(this.subscribe.bind(this), [1, 0]));
    }

    unsubscribe() {
      return CustomEvents.Unsubscribe.apply(CustomEvents, arguments);
    }

    unsubscribeAllSiblings() {
      const subscriptions = CustomEvents.UnsubscribeAllSiblings(this.classid);

      this.debugFn(() => {
        if (!subscriptions) {
          return null;
        }

        return ["unsubscribeAll", subscriptions];
      });

      return subscriptions;
    }

    sendServer() {
      return CustomEvents.SendServer.apply(CustomEvents, arguments);
    }

    sendAll() {
      return CustomEvents.SendAll.apply(CustomEvents, arguments);
    }

    sendPlayer() {
      return CustomEvents.SendPlayer.apply(CustomEvents, arguments);
    }

    sendClientSide() {
      return CustomEvents.SendClientSide.apply(CustomEvents, arguments);
    }

    // ----- Game UI -----

    hudError(message, soundEvent) {
      return GameUI.SendCustomHUDError(message, soundEvent);
    }

    setUI(uiElem, state) {
      if (_.isString(uiElem)) {
        uiElem = DOTA_UI[uiElem];
      }

      return GameUI.SetDefaultUIEnabled(uiElem, state);
    }

    showUI(uiElem) {
      return this.setUI(uiElem, true);
    }

    hideUI(uiElem) {
      return this.setUI(uiElem, false);
    }

    showActionPanelUI() {
      return this.showUI(DOTA_UI.DOTA_DEFAULT_UI_ACTION_PANEL);
    }

    hideActionPanelUI() {
      return this.hideUI(DOTA_UI.DOTA_DEFAULT_UI_ACTION_PANEL);
    }

    showInventoryShopUI() {
      return this.showUI(DOTA_UI.DOTA_DEFAULT_UI_INVENTORY_SHOP);
    }

    hideInventoryShopUI() {
      return this.hideUI(DOTA_UI.DOTA_DEFAULT_UI_INVENTORY_SHOP);
    }

    // ----- Element (Panel) Utils & Events -----

    // findElements([ "ElementID1", "#ElementID2", ... ])
    //   -> this.$elementId1 = $("#ElementID1")
    //   -> this.$elementId2 = $("#ElementID2")
    // findElements({ elemAttr1: "ElementID1", $elemAttr2: "#ElementID2", ... })
    //   -> this.$elemAttr1 = $("#ElementID1")
    //   -> this.$elemAttr2 = $("#ElementID2")
    findElements(elements) {
      if (!elements) {
        return;
      }

      let mapping = _.chain(elements);

      if (_.isArray(elements)) {
        mapping = mapping
          .map((elemID) => [_.camelCase(_.trimStart(elemID, "#")), elemID])
          .fromPairs();
      }

      mapping = mapping.transform((result, elemID, attrName) => {
        result[elemAttrNamer(attrName)] = $(elemIDing(elemID));
      });

      _.assign(this, mapping.value());
    }

    listen(element, event, fn) {
      return $.RegisterEventHandler(event, this.element(element), this.handler(fn));
    }

    // listenAll({ elemAttr: { eventName1: "fn"|Function, eventName2: "fn"|Function, ... }, ... })
    // listenAll([ { element: "elemAttr"|"#ElementID"|Panel, event: "eventName", handler: "fn"|Function }, ... ])
    listenAll(events) {
      if (!events) {
        return null;
      }

      let list = _.chain(events);

      if (_.isPlainObject(events)) {
        list = list.flatMap((elemEvents, attrName) =>
          _.map(elemEvents, (fn, eventName) => ({
            element: attrName,
            event: eventName,
            handler: fn,
          }))
        );
      }

      const applyListen = (spec) => this.listen(spec.element, spec.event, spec.handler);

      return list.map(applyListen.bind(this)).value();
    }

    dispatch(element, event) {
      element = this.element(element);

      const baseArgs = [event, element];
      const eventArgs = _.drop(arguments, 2);
      const args = _.concat(baseArgs, eventArgs);

      return $.DispatchEvent.apply($, args);
    }

    applyPanelOptions(panel, options = {}) {
      panel.component.AddClasses(options.classes);
      panel.component.SetDialogVars(options.dialogVars);
      panel.component.SetDialogVarsInt(options.dialogVarsInt);
      panel.component.SetDialogVarsTime(options.dialogVarsTime);
      panel.component.SetAttributes(options.attrs);
      panel.component.SetAttributesInt(options.attrsInt);
      panel.component.SetEvents(options.events);
      panel.component.Inputs(options.inputs);
      panel.component.Outputs(options.outputs);
    }

    createComponent(parent, id, layout, options = {}) {
      const panel = CreatePanelWithLayout(parent, id, layout);

      this.applyPanelOptions(panel, options);

      return panel;
    }

    renderSnippet(parent, id, name, options = {}) {
      const panel = CreatePanelWithLayoutSnippet(parent, id, name);

      this.applyPanelOptions(panel, options);

      return panel;
    }

    createLabel(parent, id, text, options = {}) {
      const panel = $.CreatePanel("Label", parent, id);

      panel.text = text;

      this.applyPanelOptions(panel, options);

      return panel;
    }

    createAbilityImage(parent, id, abilityName, options = {}) {
      const panel = CreateAbilityImage(parent, id, abilityName);

      this.applyPanelOptions(panel, options);

      return panel;
    }

    createItemImage(parent, id, itemName, options = {}) {
      const panel = CreateItemImage(parent, id, itemName);

      this.applyPanelOptions(panel, options);

      return panel;
    }

    openExternalURL(element, url) {
      return this.dispatch(element, UI_EVENTS.EXTERNAL_BROWSER_GO_TO_URL, url);
    }

    playSound(soundEvent) {
      return $.DispatchEvent(UI_EVENTS.PLAY_SOUND, soundEvent);
    }

    showTooltip(element, id, layout, params) {
      let args = _.chain([element]);

      if (params) {
        args = args.concat(UI_EVENTS.SHOW_TOOLTIP_PARAMS);
      } else {
        args = args.concat(UI_EVENTS.SHOW_TOOLTIP);
      }

      args = args.concat(id, layout);

      if (params) {
        args = args.concat(ElementParams(params));
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
      let args = _.chain([element]);

      if (params) {
        args = args.concat(UI_EVENTS.SHOW_POPUP_PARAMS);
      } else {
        args = args.concat(UI_EVENTS.SHOW_POPUP);
      }

      args = args.concat(popupId, layout);

      if (params) {
        args = args.concat(ElementParams(params));
      }

      return this.dispatch.apply(this, args.value());
    }

    closePopup(element) {
      return this.dispatch(element, UI_EVENTS.POPUP_BUTTON_CLICKED);
    }
  }

  context.Component = Component;
})(GameUI.CustomUIConfig(), this);
