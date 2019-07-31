"use strict";

(function(C) {
  var _ = C.lodash,
    Class = C.Class,
    Logger = C.Logger,
    Callbacks = C.Callbacks,
    CustomEvents = C.CustomEvents;

  function extractComponentName(ctx) {
    return ctx.layoutfile
      .replace(/\\/g, "/")
      .replace("panorama/layout/custom_game/", "")
      .replace(".xml", "");
  }

  var Component = Class({
    constructor: function Component(ctx) {
      this.$ctx = ctx;
      this.logger = new Logger({ progname: extractComponentName(this.$ctx) });
      this.data = {};
      this.inputs = {};
      this.outputs = new Callbacks();
      this.isInToolsMode = Game.IsInToolsMode();
      this.setupContextPanel();
    },

    setupContextPanel: function() {
      this.$ctx.component = this;

      if (this.isInToolsMode) {
        this.$ctx.AddClass("ToolsMode");
      }
    },

    _log: function(levelName, args) {
      args = _.map(args);
      args.unshift(Logger.LEVELS[levelName]);
      return this.logger.log.apply(this.logger, args);
    },

    log: function() {
      return this.logger.log.apply(this.logger, arguments);
    },

    debug: function() {
      return this._log("DEBUG", arguments);
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

    runOutput: function(name, payload) {
      return this.outputs.Run(name, payload);
    },

    Output: function(name, fn) {
      return this.outputs.On(name, fn);
    },

    Outputs: function(outputs) {
      var self = this;

      $.Each(outputs, function(fn, name) {
        self.Output(name, fn);
      });

      return outputs;
    },

    registerInput: function(name, fn) {
      this.inputs[name] = fn.bind(this);
      return name;
    },

    registerInputs: function(inputs) {
      var self = this;

      $.Each(inputs, function(fn, name) {
        self.registerInput(name, fn);
      });
    },

    Input: function(name, payload) {
      if (!name in this.inputs) {
        return;
      }

      return this.inputs[name](payload);
    },

    Inputs: function(inputs) {
      var self = this;

      $.Each(inputs, function(payload, name) {
        self.Input(name, payload);
      });

      return inputs;
    },

    subscribe: function(event, fn) {
      return CustomEvents.Subscribe(event, fn.bind(this));
    },

    unsubscribe: function() {
      return CustomEvents.Unsubscribe.apply(CustomEvents, arguments);
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

    localizeFallback: function(id1, id2) {
      var key1 = "#" + id1;
      var l10n = $.Localize(key1);

      if (l10n === id1) {
        var key2 = "#" + id2;
        l10n = $.Localize(key2);
      }

      return l10n;
    },
  });

  C.CreateComponent = function(body) {
    return Class(Component, body);
  };
})(GameUI.CustomUIConfig());
