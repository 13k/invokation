"use strict";

(function(global /*, context */) {
  var _ = global.lodash;

  var module = function Callbacks() {
    this.callbacks = {};
  };

  module.prototype.On = function(name, fn) {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(fn);
    return name;
  };

  module.prototype.Run = function(name, payload) {
    _.over(_.get(this.callbacks, name, []))(payload);
  };

  global.Callbacks = module;
})(GameUI.CustomUIConfig(), this);
