"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;

  class NetTable {
    constructor(name) {
      this.name = name;

      this._onChangeCallbacks = [];
      this._onKeyChangeCallbacks = {};

      this.subscribe(this.onChange.bind(this));
    }

    onChange(table, key, value) {
      if (table !== this.name) {
        return;
      }

      _.over(this._onChangeCallbacks)(key, value);
      _.over(_.get(this._onKeyChangeCallbacks, key, []))(key, value);
    }

    subscribe(fn) {
      return CustomNetTables.SubscribeNetTableListener(this.name, fn);
    }

    All() {
      return CustomNetTables.GetAllTableValues(this.name);
    }

    Get(key) {
      return CustomNetTables.GetTableValue(this.name, key);
    }

    OnChange(fn) {
      this._onChangeCallbacks.push(fn);
    }

    OnKeyChange(key, fn) {
      this._onKeyChangeCallbacks[key] = this._onKeyChangeCallbacks[key] || [];
      this._onKeyChangeCallbacks[key].push(fn);
    }
  }

  global.NetTable = NetTable;
})(GameUI.CustomUIConfig(), this);
