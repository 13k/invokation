"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var NET_TABLES = global.Const.NET_TABLES;

  var module = function NetTable(name) {
    this.name = name || NET_TABLES.DEFAULT;
    this._onChangeCallbacks = [];
    this._onKeyChangeCallbacks = {};
    this.subscribe(this.onChange.bind(this));
  };

  module.prototype.onChange = function(table, key, value) {
    if (table !== this.name) {
      return;
    }

    _.over(this._onChangeCallbacks)(key, value);
    _.over(_.get(this._onKeyChangeCallbacks, key, []))(key, value);
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

  global.NetTable = module;
})(GameUI.CustomUIConfig(), this);
