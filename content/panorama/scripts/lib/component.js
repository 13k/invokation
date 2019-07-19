"use strict";

(function(C) {
  var Class = C.Class,
    Logger = C.Logger,
    Callbacks = C.Callbacks,
    CustomEvents = C.CustomEvents;

  function extractHeading(ctx) {
    var heading = ctx.layoutfile
      .replace(/\\/g, "/")
      .replace("panorama/layout/custom_game/", "")
      .replace(".xml", "");

    return "[" + heading + "] ";
  }

  var Component = Class({
    constructor: function Component(ctx) {
      this.$ctx = ctx;
      this.logger = new Logger(extractHeading(this.$ctx));
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

    log: function() {
      this.logger.Log.apply(this.logger, arguments);
    },

    set: function(key, value) {
      this.data[key] = value;
      return value;
    },

    update: function(data) {
      var self = this;

      $.Each(data, function(value, key) {
        self.data[key] = value;
      });

      return data;
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
  });

  C.CreateComponent = function(body) {
    return Class(Component, body);
  };
})(GameUI.CustomUIConfig());
