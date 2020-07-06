"use strict";

(function (global /*, context */) {
  var _ = global.lodash;
  var Class = global.Class;
  var Logger = global.Logger;
  var NetTable = global.NetTable;
  var Callbacks = global.Callbacks;
  var LuaArrayDeep = global.Util.LuaArrayDeep;

  var ENV = global.ENV;
  var NET_TABLE = global.Const.NET_TABLE;

  var WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

  var AbilitiesKeyValues = Class({
    constructor: function AbilitiesKeyValues() {
      this.data = null;
      this.callbacks = new Callbacks();
      this.netTable = new NetTable(NET_TABLE.MAIN);
      this.logger = new Logger({
        level: ENV.development ? Logger.DEBUG : Logger.INFO,
        progname: "abilities_key_values",
      });

      this.listenToNetTableChange();
    },

    loadFromNetTable: function () {
      return this.netTable.Get(NET_TABLE.KEYS.MAIN.ABILITIES_KEY_VALUES);
    },

    listenToNetTableChange: function () {
      return this.netTable.OnKeyChange(
        NET_TABLE.KEYS.MAIN.ABILITIES_KEY_VALUES,
        this.onNetTableChange.bind(this)
      );
    },

    onNetTableChange: function (key, value) {
      if (key !== NET_TABLE.KEYS.MAIN.ABILITIES_KEY_VALUES) {
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

      this.data = value;
      this.onChange();
    },

    onChange: function () {
      this.normalize();
      this.callbacks.Run("change", this.data);
    },

    normalize: function () {
      this.data = LuaArrayDeep(this.data);
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

  global.AbilitiesKeyValues = AbilitiesKeyValues;
})(GameUI.CustomUIConfig(), this);
