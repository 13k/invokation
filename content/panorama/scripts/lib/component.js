"use strict";

(function(global, context) {
  var _ = global.lodash;
  var Class = global.Class;
  var Logger = global.Logger;
  var Callbacks = global.Callbacks;
  var CustomEvents = global.CustomEvents;
  var Prefixer = global.Util.Prefixer;
  var PopupParams = global.Util.PopupParams;

  var ENV = global.ENV;
  var EVENTS = global.Const.EVENTS;
  var UI_EVENTS = global.Const.UI_EVENTS;

  var DEVELOPMENT_CLASS = "Development";

  var elemAttrNamer = _.partialRight(Prefixer, "$");
  var elemIDing = _.partialRight(Prefixer, "#");

  var Component = Class({
    constructor: function Component(options) {
      options = options || {};

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
      this.findElements(options.elements);
      this.registerInputs(options.inputs);
      this.unsubscribeAllSiblings();
      this.subscribeAll(options.customEvents);
      this.listenAll(options.elementEvents);
    },

    // ----- Internal -----

    setupContextPanel: function() {
      this.$ctx.component = this;

      if (this.env.development) {
        this.$ctx.AddClass(DEVELOPMENT_CLASS);
      }
    },

    // eventName("!event") -> EVENTS["event"]
    // eventName("event") -> "event"
    eventName: function(event) {
      if (_.startsWith(event, "!")) {
        event = EVENTS[_.trimStart(event, "!")];
      }

      return event;
    },

    // handler("fn") -> this["fn"].bind(this)
    // handler(Function) -> Function
    handler: function(fn) {
      if (_.isString(fn)) {
        fn = _.bindKey(this, fn);
      }

      return fn;
    },

    // element("#elementID") -> $("#elementID")
    // element("$element") -> _.get(this, "$element")
    // element("element") -> _.get(this, "$element")
    // element(Panel) -> Panel
    element: function(element) {
      if (_.isString(element)) {
        if (_.startsWith(element, "#")) {
          element = $(element);
        } else {
          element = _.get(this, elemAttrNamer(element));
        }
      }

      return element;
    },

    // ----- Component logging -----

    _log: function(levelName, args) {
      args = _.toArray(args);
      args.unshift(Logger[levelName]);
      return this.logger.log.apply(this.logger, args);
    },

    log: function() {
      return this.logger.log.apply(this.logger, arguments);
    },

    debug: function() {
      return this._log("DEBUG", arguments);
    },

    debugFn: function(fn) {
      return this.logger.debugFn(fn.bind(this));
    },

    info: function() {
      return this._log("INFO", arguments);
    },

    warn: function() {
      return this._log("WARNING", arguments);
    },

    error: function() {
      return this._log("ERROR", arguments);
    },

    // ----- Component Data ------

    set: function(key, value) {
      this.data[key] = value;
      return value;
    },

    update: function(data) {
      _.assign(this.data, data);
      return this.data;
    },

    Get: function(key) {
      return this.data[key];
    },

    // ----- Component I/O -----

    runOutput: function(name, payload) {
      return this.outputs.Run(name, payload);
    },

    Output: function(name, fn) {
      return this.outputs.On(name, this.handler(fn));
    },

    Outputs: function(outputs) {
      return _.map(outputs, _.rearg(this.Output.bind(this), [1, 0]));
    },

    registerInput: function(name, fn) {
      this.inputs[name] = this.handler(fn);
      return name;
    },

    registerInputs: function(inputs) {
      return _.map(inputs, _.rearg(this.registerInput.bind(this), [1, 0]));
    },

    Input: function(name, payload) {
      return _.invoke(this.inputs, name, payload);
    },

    Inputs: function(inputs) {
      return _.mapValues(inputs, _.rearg(this.Input.bind(this), [1, 0]));
    },

    // ----- Custom Events -----

    subscribe: function(event, fn) {
      return CustomEvents.Subscribe(this.classid, this.eventName(event), this.handler(fn));
    },

    subscribeAll: function(events) {
      return _.mapValues(events, _.rearg(this.subscribe.bind(this), [1, 0]));
    },

    unsubscribe: function() {
      return CustomEvents.Unsubscribe.apply(CustomEvents, arguments);
    },

    unsubscribeAllSiblings: function() {
      var subscriptions = CustomEvents.UnsubscribeAllSiblings(this.classid);

      this.debugFn(function() {
        if (!subscriptions) {
          return null;
        }

        return ["unsubscribeAll", subscriptions];
      });

      return subscriptions;
    },

    sendServer: function() {
      return CustomEvents.SendServer.apply(CustomEvents, arguments);
    },

    sendAll: function() {
      return CustomEvents.SendAll.apply(CustomEvents, arguments);
    },

    sendPlayer: function() {
      return CustomEvents.SendPlayer.apply(CustomEvents, arguments);
    },

    sendClientSide: function() {
      return CustomEvents.SendClientSide.apply(CustomEvents, arguments);
    },

    // ----- Game UI -----

    hudError: function(message, soundEvent) {
      return GameUI.SendCustomHUDError(message, soundEvent);
    },

    setUI: function(elementType, state) {
      if (_.isString(elementType)) {
        elementType = DotaDefaultUIElement_t[elementType];
      }

      return GameUI.SetDefaultUIEnabled(elementType, state);
    },

    showUI: function(elementType) {
      return this.setUI(elementType, true);
    },

    hideUI: function(elementType) {
      return this.setUI(elementType, false);
    },

    showActionPanelUI: function() {
      return this.showUI("DOTA_DEFAULT_UI_ACTION_PANEL");
    },

    hideActionPanelUI: function() {
      return this.hideUI("DOTA_DEFAULT_UI_ACTION_PANEL");
    },

    showInventoryShopUI: function() {
      return this.showUI("DOTA_DEFAULT_UI_INVENTORY_SHOP");
    },

    hideInventoryShopUI: function() {
      return this.hideUI("DOTA_DEFAULT_UI_INVENTORY_SHOP");
    },

    // ----- Element (Panel) Utils & Events -----

    // findElements([ "ElementID1", "#ElementID2", ... ])
    //   -> this.$elementId1 = $("#ElementID1")
    //   -> this.$elementId2 = $("#ElementID2")
    // findElements({ elemAttr1: "ElementID1", $elemAttr2: "#ElementID2", ... })
    //   -> this.$elemAttr1 = $("#ElementID1")
    //   -> this.$elemAttr2 = $("#ElementID2")
    findElements: function(elements) {
      if (!elements) {
        return;
      }

      var map = _.chain(elements);

      if (_.isArray(elements)) {
        map = map
          .map(function(elemID) {
            return [_.camelCase(_.trimStart(elemID, "#")), elemID];
          })
          .fromPairs();
      }

      map = map.transform(function(result, elemID, attrName) {
        result[elemAttrNamer(attrName)] = $(elemIDing(elemID));
      });

      _.assign(this, map.value());
    },

    listen: function(element, event, fn) {
      return $.RegisterEventHandler(event, this.element(element), this.handler(fn));
    },

    // listenAll({ elemAttr: { eventName1: "fn"|Function, eventName2: "fn"|Function, ... }, ... })
    // listenAll([ { element: "elemAttr"|"#ElementID"|Panel, event: "eventName", handler: "fn"|Function }, ... ])
    listenAll: function(events) {
      if (!events) {
        return;
      }

      var list = _.chain(events);

      if (_.isPlainObject(events)) {
        list = list.flatMap(function(elemEvents, attrName) {
          return _.map(elemEvents, function(fn, eventName) {
            return { element: attrName, event: eventName, handler: fn };
          });
        });
      }

      var applyListen = function(spec) {
        return this.listen(spec.element, spec.event, spec.handler);
      };

      return list.map(applyListen.bind(this)).value();
    },

    dispatch: function(element, event) {
      element = this.element(element);

      var args = [event, element];
      var eventArgs = _.drop(arguments, 2);
      args = _.concat(args, eventArgs);

      return $.DispatchEvent.apply($, args);
    },

    openExternalURL: function(element, url) {
      return this.dispatch(element, UI_EVENTS.EXTERNAL_BROWSER_GO_TO_URL, url);
    },

    playSound: function(soundEvent) {
      return $.DispatchEvent(UI_EVENTS.PLAY_SOUND, soundEvent);
    },

    showTooltip: function(element, text) {
      return this.dispatch(element, UI_EVENTS.SHOW_TEXT_TOOLTIP, text);
    },

    hideTooltip: function(element) {
      return this.dispatch(element, UI_EVENTS.HIDE_TEXT_TOOLTIP);
    },

    showAbilityTooltip: function(element, abilityName) {
      return this.dispatch(element, UI_EVENTS.SHOW_ABILITY_TOOLTIP, abilityName);
    },

    hideAbilityTooltip: function(element) {
      return this.dispatch(element, UI_EVENTS.HIDE_ABILITY_TOOLTIP);
    },

    showPopup: function(element, popupId, layout, params) {
      var args = [element];

      if (params) {
        args.push(UI_EVENTS.SHOW_POPUP_PARAMS);
      } else {
        args.push(UI_EVENTS.SHOW_POPUP);
      }

      args = _.concat(args, popupId, layout);

      if (params) {
        args.push(PopupParams(params));
      }

      return this.dispatch.apply(this, args);
    },

    closePopup: function(element) {
      return this.dispatch(element, UI_EVENTS.POPUP_BUTTON_CLICKED);
    },
  });

  context.CreateComponent = function(body) {
    return Class(Component, body);
  };
})(GameUI.CustomUIConfig(), this);
