"use strict";

((global /*, context */) => {
  const { lodash: _, ENV, Logger, NetTable, Callbacks } = global;
  const { LuaArrayDeep } = global.Util;
  const { NET_TABLE } = global.Const;

  const WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

  class AbilitiesKeyValues {
    constructor() {
      this.data = null;
      this.callbacks = new Callbacks();
      this.netTable = new NetTable(NET_TABLE.MAIN);
      this.logger = new Logger({
        level: ENV.development ? Logger.DEBUG : Logger.INFO,
        progname: "abilities_key_values",
      });

      this.listenToNetTableChange();
    }

    loadFromNetTable() {
      return this.netTable.Get(NET_TABLE.KEYS.MAIN.ABILITIES_KEY_VALUES);
    }

    listenToNetTableChange() {
      return this.netTable.OnKeyChange(
        NET_TABLE.KEYS.MAIN.ABILITIES_KEY_VALUES,
        this.onNetTableChange.bind(this)
      );
    }

    onNetTableChange(key, value) {
      if (key !== NET_TABLE.KEYS.MAIN.ABILITIES_KEY_VALUES) {
        return;
      }

      this.logger.debug("onNetTableChange()");
      this.set(value);
    }

    set(value) {
      if (!value) {
        this.logger.warning(WARN_UNDEF_VALUE);
        return;
      }

      this.data = value;
      this.onChange();
    }

    onChange() {
      this.normalize();
      this.callbacks.Run("change", this.data);
    }

    normalize() {
      this.data = LuaArrayDeep(this.data);
    }

    Load() {
      this.logger.debug("Load()");

      if (!this.data) {
        this.set(this.loadFromNetTable());
        return true;
      }

      return false;
    }

    OnChange(fn) {
      this.callbacks.On("change", fn);

      if (this.data) {
        fn(this.data);
      }
    }

    Entries() {
      return _.values(this.data);
    }

    Get(id) {
      return _.get(this.data, id);
    }

    Each(fn) {
      return _.forOwn(this.data, fn);
    }
  }

  global.AbilitiesKeyValues = AbilitiesKeyValues;
})(GameUI.CustomUIConfig(), this);
