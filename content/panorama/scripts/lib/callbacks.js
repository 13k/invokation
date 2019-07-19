"use strict";

(function(C) {
  var module = function Callbacks() {
    this.callbacks = {};
  };

  module.prototype.On = function(name, fn) {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(fn);
    return fn;
  };

  module.prototype.Run = function(name, payload) {
    var callbacks = this.callbacks[name] || [];

    $.Each(callbacks, function(fn) {
      fn(payload);
    });
  };

  C.Callbacks = module;
})(GameUI.CustomUIConfig());
