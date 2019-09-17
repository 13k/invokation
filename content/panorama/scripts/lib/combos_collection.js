"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var Class = global.Class;
  var Logger = global.Logger;
  var NetTable = global.NetTable;
  var CustomEvents = global.CustomEvents;
  var IsOrbAbility = global.Util.IsOrbAbility;
  var IsInvocationAbility = global.Util.IsInvocationAbility;
  var IsItemAbility = global.Util.IsItemAbility;
  var LuaListDeep = global.Util.LuaListDeep;

  var ENV = global.ENV;
  var EVENTS = global.Const.EVENTS;

  var NET_TABLE_KEY = "combos";

  var WARN_UNDEF_COMBOS_VALUE = "Tried to set combos to an undefined value";

  var CombosCollection = Class({
    constructor: function CombosCollection() {
      this.combos = null;
      this.onChangeCallbacks = [];
      this.netTable = new NetTable();
      this.logger = new Logger({
        level: ENV.development ? Logger.DEBUG : Logger.INFO,
        progname: "combos_collection",
      });

      this.listenToNetTableChange();
    },

    loadFromNetTable: function() {
      return this.netTable.Get(NET_TABLE_KEY);
    },

    listenToNetTableChange: function() {
      return this.netTable.OnKeyChange(NET_TABLE_KEY, this.onNetTableChange.bind(this));
    },

    sendReloadToServer: function() {
      CustomEvents.SendServer(EVENTS.COMBOS_RELOAD);
    },

    setCombos: function(value) {
      if (!value) {
        this.logger.warning(WARN_UNDEF_COMBOS_VALUE);
        return;
      }

      this.combos = value;
      this.onCombosChange();
    },

    onCombosChange: function() {
      this.normalize();
      _.over(this.onChangeCallbacks)(this.combos);
    },

    normalize: function() {
      _.forEach(this.combos, function(combo) {
        LuaListDeep(combo, { inplace: true });

        combo.l10n = L10n.LocalizeComboProperties(combo);
        combo.l10n.name = L10n.LocalizeComboKey(combo, "name");

        _.forEach(combo.sequence, function(step) {
          step.isOrbAbility = IsOrbAbility(step.name);
          step.isInvocationAbility = IsInvocationAbility(step.name);
          step.isItem = IsItemAbility(step.name);
        });
      });
    },

    onNetTableChange: function(key, value) {
      if (key !== NET_TABLE_KEY) {
        return;
      }

      this.logger.debug("onNetTableChange()");
      this.setCombos(value);
    },

    Load: function() {
      this.logger.debug("Load()");

      if (!this.combos) {
        this.setCombos(this.loadFromNetTable());
        return true;
      }

      return false;
    },

    Reload: function() {
      this.logger.debug("Reload()");
      this.combos = null;
      this.sendReloadToServer();
      return this.Load();
    },

    OnChange: function(fn) {
      this.onChangeCallbacks.push(fn);

      // This is kinda of a hack. When first registering an OnChange callback,
      // call it immediately if combos are already loaded.
      if (this.combos) {
        fn(this.combos);
      }
    },

    Entries: function() {
      return _.values(this.combos);
    },

    Get: function(id) {
      return this.combos[id];
    },

    Each: function(fn) {
      return _.forOwn(this.combos, fn);
    },
  });

  global.CombosCollection = CombosCollection;
})(GameUI.CustomUIConfig(), this);
