"use strict";

var MASTER_TABLE_NAME = "invokation";

function NetTable(name) {
  this.name = name || MASTER_TABLE_NAME;
  this._onChangeCallbacks = [];
  this._onKeyChangeCallbacks = {};
  this.subscribe(this.onChange.bind(this));
}

NetTable.prototype.onChange = function(table, key, value) {
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

NetTable.prototype.subscribe = function(fn) {
  return CustomNetTables.SubscribeNetTableListener(this.name, fn);
};

NetTable.prototype.All = function() {
  return CustomNetTables.GetAllTableValues(this.name);
};

NetTable.prototype.Get = function(key) {
  return CustomNetTables.GetTableValue(this.name, key);
};

NetTable.prototype.OnChange = function(fn) {
  this._onChangeCallbacks.push(fn);
};

NetTable.prototype.OnKeyChange = function(key, fn) {
  this._onKeyChangeCallbacks[key] = this._onKeyChangeCallbacks[key] || [];
  this._onKeyChangeCallbacks[key].push(fn);
};