"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;
  const { COMBO_PROPERTIES } = global.Const;

  const SORT_ORDER = ["heroLevel", "difficultyRating", "id"];

  const isEmptyFilterValue = (value) => value === "" || value == null;
  const isProperty = (property) => property in COMBO_PROPERTIES;
  const matchesTags = (combo, tags) => _.intersection(combo.tags, tags).length > 0;
  const matchesItem = (combo, item) => _.find(combo.sequence, ["name", item]);
  const matchesAbility = (combo, ability) => _.find(combo.sequence, ["name", ability]);

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

  class CombosView {
    constructor(combos) {
      this.setCombos(combos);
    }

    setCombos(combos) {
      this.combos = combos;
      this.setView(combos);
    }

    setView(view) {
      this.view = view;
      this.sort();
    }

    sort() {
      this.view = _.sortBy(this.view, SORT_ORDER);
    }

    Length() {
      return this.view.length;
    }

    Entries() {
      return this.view;
    }

    Filter(filters) {
      let seq = _.chain(this.combos);

      _.each(filters, (value, property) => {
        seq = filterByProperty(seq, property, value);
      });

      seq = filterByTags(seq, filters.tags);
      seq = filterByItem(seq, filters.item);
      seq = filterByAbility(seq, filters.ability);

      this.setView(seq.value());
    }
  }

  global.CombosView = CombosView;
})(GameUI.CustomUIConfig(), this);
