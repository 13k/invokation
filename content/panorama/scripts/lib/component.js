"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var Class = global.Class;
  var Logger = global.Logger;
  var Callbacks = global.Callbacks;
  var CustomEvents = global.CustomEvents;
  var Prefixer = global.Util.Prefixer;

  var elemAttrNamer = _.partialRight(Prefixer, "$");
  var elemIDing = _.partialRight(Prefixer, "#");

  var Component = Class({
    constructor: function Component(options) {
      options = options || {};

      this.logger = new Logger({ progname: this.classid });
      this.$ctx = $.GetContextPanel();
      this.data = {};
      this.inputs = {};
      this.outputs = new Callbacks();
      this.isInToolsMode = Game.IsInToolsMode();

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

      if (this.isInToolsMode) {
        this.$ctx.AddClass("ToolsMode");
      }
    },

    // getHandler("fn") -> this["fn"].bind(this)
    // getHandler(Function) -> Function
    getHandler: function(fn) {
      if (_.isString(fn)) {
        fn = _.bindKey(this, fn);
      }

      return fn;
    },

    // ----- Localization -----

    localizeFallback: function(id1, id2) {
      var key1 = "#" + id1;
      var l10n = $.Localize(key1);

      if (l10n === id1) {
        var key2 = "#" + id2;
        l10n = $.Localize(key2);
      }

      return l10n;
    },

    // ----- Component logging -----

    _log: function(levelName, args) {
      args = _.toArray(args);
      args.unshift(Logger.LEVELS[levelName]);
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
      return this.outputs.On(name, fn);
    },

    Outputs: function(outputs) {
      return _.map(outputs, _.rearg(this.Output.bind(this), [1, 0]));
    },

    registerInput: function(name, fn) {
      if (_.isString(fn)) {
        fn = _.bindKey(this, fn);
      }

      this.inputs[name] = fn;
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
      if (_.isString(fn)) {
        fn = _.bindKey(this, fn);
      }

      if (_.startsWith(event, "!")) {
        event = EVENTS[_.trimStart(event, "!")];
      }

      return CustomEvents.Subscribe(this.classid, event, fn);
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

    // getElement("#ID") -> $("#ID")
    // getElement("$attr") -> this.$attr
    // getElement("attr") -> this.$attr
    // getElement(Panel) -> Panel
    getElement: function(element) {
      if (_.isString(element)) {
        if (_.startsWith(element, "#")) {
          element = $(element);
        } else {
          element = _.get(this, elemAttrNamer(element));
        }
      }

      return element;
    },

    listen: function(element, event, fn) {
      element = this.getElement(element);
      fn = this.getHandler(fn);

      return $.RegisterEventHandler(event, element, fn);
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
      element = this.getElement(element);

      var args = [event, element];
      var eventArgs = _.drop(arguments, 2);
      args = _.concat(args, eventArgs);

      return $.DispatchEvent.apply($, args);
    },

    playSound: function(soundEvent) {
      return $.DispatchEvent("PlaySoundEffect", soundEvent);
    },

    showTooltip: function(element, text) {
      return this.dispatch(element, "UIShowTextTooltip", text);
    },

    hideTooltip: function(element) {
      return this.dispatch(element, "UIHideTextTooltip");
    },

    showAbilityTooltip: function(element, abilityName) {
      return this.dispatch(element, "DOTAShowAbilityTooltip", abilityName);
    },

    hideAbilityTooltip: function(element) {
      return this.dispatch(element, "DOTAHideAbilityTooltip");
    },
  });

  context.CreateComponent = function(body) {
    return Class(Component, body);
  };
})(GameUI.CustomUIConfig(), this);
