"use strict";

(function (global /*, context */) {
  var _ = global.lodash;
  var Class = global.Class;

  var PROPERTIES = global.Const.COMBO_PROPERTIES;
  var SORT_ORDER = ["heroLevel", "difficultyRating", "id"];

  function isEmptyFilterValue(value) {
    return value === "" || value == null;
  }

  function isProperty(property) {
    return property in PROPERTIES;
  }

  function matchesTags(combo, tags) {
    return _.intersection(combo.tags, tags).length > 0;
  }

  function matchesItem(combo, item) {
    return _.find(combo.sequence, ["name", item]);
  }

  function matchesAbility(combo, ability) {
    return _.find(combo.sequence, ["name", ability]);
  }

  function filterByProperty(seq, property, value) {
    if (!isProperty(property) || isEmptyFilterValue(value)) {
      return seq;
    }

    return seq.filter(_.matchesProperty(property, value));
  }

  function filterByTags(seq, tags) {
    if (_.isEmpty(tags)) {
      return seq;
    }

    return seq.filter(_.chain(matchesTags).partialRight(tags).unary().value());
  }

  function filterByItem(seq, item) {
    if (_.isEmpty(item)) {
      return seq;
    }

    return seq.filter(_.chain(matchesItem).partialRight(item).unary().value());
  }

  function filterByAbility(seq, ability) {
    if (_.isEmpty(ability)) {
      return seq;
    }

    return seq.filter(_.chain(matchesAbility).partialRight(ability).unary().value());
  }

  var CombosView = Class({
    constructor: function CombosView(combos) {
      this.setCombos(combos);
    },

    setCombos: function (combos) {
      this.combos = combos;
      this.setView(combos);
    },

    setView: function (view) {
      this.view = view;
      this.sort();
    },

    sort: function () {
      this.view = _.sortBy(this.view, SORT_ORDER);
    },

    Length: function () {
      return this.view.length;
    },

    Entries: function () {
      return this.view;
    },

    Filter: function (filters) {
      var seq = _.chain(this.combos);

      _.each(filters, function (value, property) {
        seq = filterByProperty(seq, property, value);
      });

      seq = filterByTags(seq, filters.tags);
      seq = filterByItem(seq, filters.item);
      seq = filterByAbility(seq, filters.ability);

      this.setView(seq.value());
    },
  });

  global.CombosView = CombosView;
})(GameUI.CustomUIConfig(), this);
