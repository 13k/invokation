"use strict";

function ContextCallbacks() {
  this._callbacks = {};
}

ContextCallbacks.prototype.Add = function(name, fn) {
  this._callbacks[name] = this._callbacks[name] || [];
  this._callbacks[name].push(fn);
  return fn;
};

ContextCallbacks.prototype.Update = function(callbacks) {
  var self = this;

  $.Each(callbacks, function(fns, name) {
    fns = (typeof(fns) === "function") ? [fns] : fns;
    $.Each(fns, function(fn) {
      self.Add(name, fn);
    });
  });
};

ContextCallbacks.prototype.Run = function(name) {
  var args = Array.prototype.slice.call(arguments, 1);
  var callbacks = this._callbacks[name] || [];

  $.Each(callbacks, function(fn) {
    fn.apply(null, args);
  });
};