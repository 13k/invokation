"use strict";

(function(C) {
  var Logger = C.Logger,
    NetTable = C.NetTable,
    CustomEvents = C.CustomEvents,
    LuaListTableToArray = C.Util.LuaListTableToArray,
    IsOrbAbility = C.Util.IsOrbAbility,
    IsInvocationAbility = C.Util.IsInvocationAbility,
    IsItemAbility = C.Util.IsItemAbility,
    EVENTS = C.EVENTS;

  var NET_TABLE_KEY = "combos";

  var SPECIALTIES_KEYS = ["qw", "qe"];
  var STANCES_KEYS = ["offensive", "defensive"];
  var DAMAGE_RATINGS_KEYS = [0, 1, 2, 3, 4, 5];
  var DIFFICULTY_RATINGS_KEYS = [1, 2, 3, 4, 5];

  var SPECIALTIES = {};
  var STANCES = {};
  var DAMAGE_RATINGS = {};
  var DIFFICULTY_RATINGS = {};

  var module = function CombosCollection() {
    this.combos = null;
    this.onChangeCallbacks = [];
    this.logger = new Logger({ progname: "combos_collection" });
    this.netTable = new NetTable();

    this._listenToNetTableChange();
  };

  module.prototype._loadFromNetTable = function() {
    return this.netTable.Get(NET_TABLE_KEY);
  };

  module.prototype._listenToNetTableChange = function() {
    return this.netTable.OnKeyChange(NET_TABLE_KEY, this._onNetTableChange.bind(this));
  };

  module.prototype._sendReloadToServer = function() {
    CustomEvents.SendServer(EVENTS.COMBOS_RELOAD);
  };

  module.prototype._setCombos = function(value) {
    if (!value) {
      this.logger.warning("Tried to set combos to an undefined value");
      return;
    }

    this.combos = value;
    this._onCombosChange();
  };

  module.prototype._onCombosChange = function() {
    var self = this;

    this._normalize();

    $.Each(this.onChangeCallbacks, function(fn) {
      fn(self.combos);
    });
  };

  module.prototype._normalize = function() {
    $.Each(this.combos, function(combo) {
      combo.l10n = {};
      combo.l10n.name = $.Localize("#" + combo.id);
      combo.l10n.specialty = SPECIALTIES[combo.specialty];
      combo.l10n.stance = STANCES[combo.stance];
      combo.l10n.damageRating = DAMAGE_RATINGS[combo.damageRating];
      combo.l10n.difficultyRating = DIFFICULTY_RATINGS[combo.difficultyRating];

      combo.items = LuaListTableToArray(combo.items);
      combo.sequence = LuaListTableToArray(combo.sequence);

      $.Each(combo.sequence, function(step) {
        step.isOrbAbility = IsOrbAbility(step.name);
        step.isInvocationAbility = IsInvocationAbility(step.name);
        step.isItem = IsItemAbility(step.name);
        step.next = LuaListTableToArray(step.next);
      });
    });
  };

  module.prototype._onNetTableChange = function(key, value) {
    if (key !== NET_TABLE_KEY) {
      return;
    }

    this.logger.debug("_onNetTableChange()");

    this._setCombos(value);
  };

  module.prototype.Load = function() {
    this.logger.debug("Load()");

    if (!this.combos) {
      this._setCombos(this._loadFromNetTable());
      return true;
    }

    return false;
  };

  module.prototype.Reload = function() {
    this.logger.debug("Reload()");
    this.combos = null;
    this._sendReloadToServer();
    return this.Load();
  };

  module.prototype.OnChange = function(fn) {
    this.onChangeCallbacks.push(fn);

    // This is kinda of a hack. When first registering an OnChange callback,
    // call it immediately if combos are already loaded.
    if (this.combos) {
      fn(this.combos);
    }
  };

  module.prototype.forEach = function(fn) {
    return $.Each(this.combos, fn);
  };

  module.prototype.Get = function(id) {
    return this.combos[id];
  };

  $.Each(SPECIALTIES_KEYS, function(key) {
    SPECIALTIES[key] = $.Localize("#invokation_combo_specialty_" + key);
  });

  $.Each(STANCES_KEYS, function(key) {
    STANCES[key] = $.Localize("#invokation_combo_stance_" + key);
  });

  $.Each(DAMAGE_RATINGS_KEYS, function(key) {
    DAMAGE_RATINGS[key] = $.Localize("#invokation_combo_tooltip_damage_rating_" + key);
  });

  $.Each(DIFFICULTY_RATINGS_KEYS, function(key) {
    DIFFICULTY_RATINGS[key] = $.Localize("#invokation_combo_tooltip_difficulty_rating_" + key);
  });

  C.CombosCollection = module;
})(GameUI.CustomUIConfig());
