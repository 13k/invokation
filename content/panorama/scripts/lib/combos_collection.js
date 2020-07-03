"use strict";

(function (global /*, context */) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var Class = global.Class;
  var Logger = global.Logger;
  var NetTable = global.NetTable;
  var Callbacks = global.Callbacks;
  var CustomEvents = global.CustomEvents;
  var IsOrbAbility = global.Util.IsOrbAbility;
  var IsInvocationAbility = global.Util.IsInvocationAbility;
  var IsItemAbility = global.Util.IsItemAbility;
  var LuaArrayDeep = global.Util.LuaArrayDeep;

  var ENV = global.ENV;
  var EVENTS = global.Const.EVENTS;
  var NET_TABLE = global.Const.NET_TABLE;

  var WARN_UNDEF_VALUE = "Tried to set data with an undefined value";

  var CombosCollection = Class({
    constructor: function CombosCollection() {
      this.data = null;
      this.callbacks = new Callbacks();
      this.netTable = new NetTable(NET_TABLE.MAIN);
      this.logger = new Logger({
        level: ENV.development ? Logger.DEBUG : Logger.INFO,
        progname: "combos_collection",
      });

      this.listenToNetTableChange();
    },

    sendReloadToServer: function () {
      CustomEvents.SendServer(EVENTS.COMBOS_RELOAD);
    },

    loadFromNetTable: function () {
      return this.netTable.Get(NET_TABLE.KEYS.MAIN.COMBOS);
    },

    listenToNetTableChange: function () {
      return this.netTable.OnKeyChange(NET_TABLE.KEYS.MAIN.COMBOS, this.onNetTableChange.bind(this));
    },

    onNetTableChange: function (key, value) {
      if (key !== NET_TABLE.KEYS.MAIN.COMBOS) {
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
      _.forEach(this.data, function (combo) {
        LuaArrayDeep(combo, { inplace: true });

        combo.l10n = L10n.LocalizeComboProperties(combo);
        combo.l10n.name = L10n.LocalizeComboKey(combo, "name");

        _.forEach(combo.sequence, function (step) {
          step.isOrbAbility = IsOrbAbility(step.name);
          step.isInvocationAbility = IsInvocationAbility(step.name);
          step.isItem = IsItemAbility(step.name);
        });
      });
    },

    Load: function () {
      this.logger.debug("Load()");

      if (!this.data) {
        this.set(this.loadFromNetTable());
        return true;
      }

      return false;
    },

    Reload: function () {
      this.logger.debug("Reload()");
      this.data = null;
      this.sendReloadToServer();
      return this.Load();
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

  global.CombosCollection = CombosCollection;
})(GameUI.CustomUIConfig(), this);
