"use strict";

(function(C) {
  var module = function Logger(prefix) {
    this.prefix = prefix;
  };

  module.prototype.Log = function() {
    var args = [this.prefix];
    args = args.concat(Array.prototype.slice.call(arguments));
    return $.Msg.apply(null, args);
  };

  C.Logger = module;
})(GameUI.CustomUIConfig());
