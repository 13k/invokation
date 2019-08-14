"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var COMBO_PROPERTIES = global.Const.COMBO_PROPERTIES;
  var Class = global.Class;
  var Logger = global.Logger;
  var NetTable = global.NetTable;
  var CustomEvents = global.CustomEvents;
  var IsOrbAbility = global.Util.IsOrbAbility;
  var IsInvocationAbility = global.Util.IsInvocationAbility;
  var IsItemAbility = global.Util.IsItemAbility;
  var LuaListDeep = global.Util.LuaListDeep;

  var NET_TABLE_KEY = "combos";

  var PROPERTIES_L10N = _.mapValues(COMBO_PROPERTIES, function(values, property) {
    var propertyL10nKey = function(value) {
      return "#invokation_combo_properties_" + _.snakeCase(property) + "__" + value;
    };

    var localize = _.flow(
      propertyL10nKey,
      $.Localize
    );

    return _.zipObject(values, _.map(values, localize));
  });

  var CombosCollection = Class({
    constructor: function CombosCollection() {
      this.combos = null;
      this.onChangeCallbacks = [];
      this.logger = new Logger({ progname: "combos_collection" });
      this.netTable = new NetTable();

      this._listenToNetTableChange();
    },

    _loadFromNetTable: function() {
      return this.netTable.Get(NET_TABLE_KEY);
    },

    _listenToNetTableChange: function() {
      return this.netTable.OnKeyChange(NET_TABLE_KEY, this._onNetTableChange.bind(this));
    },

    _sendReloadToServer: function() {
      CustomEvents.SendServer(EVENTS.COMBOS_RELOAD);
    },

    _setCombos: function(value) {
      if (!value) {
        this.logger.warning("Tried to set combos to an undefined value");
        return;
      }

      this.combos = value;
      this._onCombosChange();
    },

    _onCombosChange: function() {
      this._normalize();
      _.over(this.onChangeCallbacks)(this.combos);
    },

    _normalize: function() {
      _.forEach(this.combos, function(combo) {
        LuaListDeep(combo, { inplace: true });

        combo.l10n = _.transform(PROPERTIES_L10N, function(comboL10n, localized, property) {
          comboL10n[property] = localized[combo[property]];
        });

        combo.l10n.name = $.Localize("#" + combo.id);

        _.forEach(combo.sequence, function(step) {
          step.isOrbAbility = IsOrbAbility(step.name);
          step.isInvocationAbility = IsInvocationAbility(step.name);
          step.isItem = IsItemAbility(step.name);
        });
      });
    },

    _onNetTableChange: function(key, value) {
      if (key !== NET_TABLE_KEY) {
        return;
      }

      this.logger.debug("_onNetTableChange()");
      this._setCombos(value);
    },

    Load: function() {
      this.logger.debug("Load()");

      if (!this.combos) {
        this._setCombos(this._loadFromNetTable());
        return true;
      }

      return false;
    },

    Reload: function() {
      this.logger.debug("Reload()");
      this.combos = null;
      this._sendReloadToServer();
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

    forEach: function(fn) {
      return _.forEach(this.combos, fn);
    },

    Get: function(id) {
      return this.combos[id];
    },
  });

  global.CombosCollection = CombosCollection;
})(GameUI.CustomUIConfig(), this);
