"use strict";

var _netTable = new NetTable();

var NET_TABLE_KEY = "combos";

var SPECIALTIES_KEYS = ["qw", "qe"];
var STANCES_KEYS = ["offensive", "defensive"];
var DAMAGE_RATINGS_KEYS = [0, 1, 2, 3, 4, 5];
var DIFFICULTY_RATINGS_KEYS = [1, 2, 3, 4, 5];

var SPECIALTIES = {};
var STANCES = {};
var DAMAGE_RATINGS = {};
var DIFFICULTY_RATINGS = {};

function loadFromNetTable() {
  return _netTable.Get(NET_TABLE_KEY);
}

function listenToNetTableChange() {
  return _netTable.OnKeyChange(
    NET_TABLE_KEY,
    CombosCollection._onNetTableChange.bind(CombosCollection)
  );
}

function sendReloadToServer() {
  CustomEvents.SendServer(EVENT_COMBOS_RELOAD);
}

var CombosCollection = {
  combos: null,
  _onChangeCallbacks: [],

  _setCombos: function(value) {
    this.combos = value;
    this._onCombosChange();
  },

  _onCombosChange: function() {
    var self = this;

    this._normalize();

    $.Each(this._onChangeCallbacks, function(fn) {
      fn(self.combos);
    });
  },

  _normalize: function() {
    $.Each(this.combos, function(combo) {
      combo.name_l10n = $.Localize("#" + combo.id);
      combo.sequence = LuaListTableToArray(combo.sequence);
      combo.specialty_l10n = SPECIALTIES[combo.specialty];
      combo.stance_l10n = STANCES[combo.stance];
      combo.damage_rating_l10n = DAMAGE_RATINGS[combo.damage_rating];
      combo.difficulty_rating_l10n =
        DIFFICULTY_RATINGS[combo.difficulty_rating];
    });
  },

  _onNetTableChange: function(key, value) {
    if (key !== NET_TABLE_KEY) {
      return;
    }

    $.Msg("[combos_collection] _onNetTableChange()");

    this._setCombos(value);
  },

  Load: function() {
    $.Msg("[combos_collection] Load()");

    if (!this.combos) {
      this._setCombos(loadFromNetTable());
    }
  },

  Reload: function() {
    $.Msg("[combos_collection] Reload()");
    this.combos = null;
    sendReloadToServer();
    return this.Load();
  },

  OnChange: function(fn) {
    this._onChangeCallbacks.push(fn);
  },

  Get: function(name) {
    return this.combos[name];
  },
};

(function() {
  $.Each(SPECIALTIES_KEYS, function(key) {
    SPECIALTIES[key] = $.Localize("#invokation_combo_specialty_" + key);
  });

  $.Each(STANCES_KEYS, function(key) {
    STANCES[key] = $.Localize("#invokation_combo_stance_" + key);
  });

  $.Each(DAMAGE_RATINGS_KEYS, function(key) {
    DAMAGE_RATINGS[key] = $.Localize(
      "#invokation_combo_tooltip_damage_rating_" + key
    );
  });

  $.Each(DIFFICULTY_RATINGS_KEYS, function(key) {
    DIFFICULTY_RATINGS[key] = $.Localize(
      "#invokation_combo_tooltip_difficulty_rating_" + key
    );
  });

  listenToNetTableChange();
})();
