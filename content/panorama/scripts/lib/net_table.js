"use strict";

(function(C) {
  var MASTER_TABLE_NAME = "invokation";

  var module = function NetTable(name) {
    this.name = name || MASTER_TABLE_NAME;
    this._onChangeCallbacks = [];
    this._onKeyChangeCallbacks = {};
    this.subscribe(this.onChange.bind(this));
  };

  module.prototype.onChange = function(table, key, value) {
    if (table !== this.name) {
      return;
    }

    $.Each(this._onChangeCallbacks, function(fn) {
      fn(key, value);
    });

    var keyChangeFns = this._onKeyChangeCallbacks[key] || [];

    $.Each(keyChangeFns, function(fn) {
      fn(key, value);
    });
  };

  module.prototype.subscribe = function(fn) {
    return CustomNetTables.SubscribeNetTableListener(this.name, fn);
  };

  module.prototype.All = function() {
    return CustomNetTables.GetAllTableValues(this.name);
  };

  module.prototype.Get = function(key) {
    return CustomNetTables.GetTableValue(this.name, key);
  };

  module.prototype.OnChange = function(fn) {
    this._onChangeCallbacks.push(fn);
  };

  module.prototype.OnKeyChange = function(key, fn) {
    this._onKeyChangeCallbacks[key] = this._onKeyChangeCallbacks[key] || [];
    this._onKeyChangeCallbacks[key].push(fn);
  };

  C.NetTable = module;
})(GameUI.CustomUIConfig());
