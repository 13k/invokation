"use strict";

(function (global /*, context */) {
  var _ = global.lodash;
  var Class = global.Class;
  var Logger = global.Logger;
  var NetTable = global.NetTable;
  var Callbacks = global.Callbacks;
  var LuaArrayDeep = global.Util.LuaArrayDeep;

  var ENV = global.ENV;

  var WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

  var NetTableListener = Class({
    constructor: function NetTableListener(tableName, key) {
      this.data = null;
      this.callbacks = new Callbacks();
      this.netTable = new NetTable(tableName);
      this.key = key;
      this.logger = new Logger({
        level: ENV.development ? Logger.DEBUG : Logger.INFO,
        progname: "net_table." + tableName,
      });

      this.listenToNetTableChange();
    },

    loadFromNetTable: function () {
      return this.netTable.Get(this.key);
    },

    listenToNetTableChange: function () {
      return this.netTable.OnKeyChange(this.key, this.onNetTableChange.bind(this));
    },

    onNetTableChange: function (key, value) {
      if (key !== this.key) {
        return;
      }

      this.logger.debug("onNetTableChange()");
      this.set(value);
    },

    set: function (value) {
      if (!value) {
        this.logger.warning(WARN_UNDEF_VALUE);
        return;
      }

      this.data = this.normalize(value);
      this.onChange();
    },

    onChange: function () {
      this.callbacks.Run("change", this.data);
    },

    normalize: function (value) {
      this.data = LuaArrayDeep(value);
    },

    Load: function () {
      this.logger.debug("Load()");

      if (!this.data) {
        this.set(this.loadFromNetTable());
        return true;
      }

      return false;
    },

    OnChange: function (fn) {
      this.callbacks.On("change", fn);

      if (this.data) {
        fn(this.data);
      }
    },

    Entries: function () {
      return _.values(this.data);
    },

    Get: function (id) {
      return _.get(this.data, id);
    },

    Each: function (fn) {
      return _.forOwn(this.data, fn);
    },
  });

  global.NetTableListener = NetTableListener;
})(GameUI.CustomUIConfig(), this);
