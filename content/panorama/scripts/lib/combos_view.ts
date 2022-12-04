import type { Combo, Properties } from "./combo";

type ComboCollectionChain = _.CollectionChain<Combo>;

const {
  lodash: _,

  Const: { COMBO_PROPERTIES: PROPERTIES },
} = CustomUIConfig;

export interface Filters extends Partial<Properties> {
  tags?: string[];
  item?: string;
  ability?: string;
}

const SORT_ORDER = ["heroLevel", "difficultyRating", "id"];

function isEmptyFilterValue(value: string | null): boolean {
  return value === "" || value == null;
}

function isProperty(property: string): boolean {
  return property in PROPERTIES;
}

function matchesTags(combo: Combo, tags: string[]) {
  return _.intersection(combo.tags, tags).length > 0;
}

function matchesItem(combo: Combo, item: string) {
  return _.find(combo.sequence, ["name", item]);
}

function matchesAbility(combo: Combo, ability: string) {
  return _.find(combo.sequence, ["name", ability]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterByProperty(seq: ComboCollectionChain, property: string, value: any) {
  if (!isProperty(property) || isEmptyFilterValue(value)) {
    return seq;
  }

  return seq.filter(_.matchesProperty(property, value));
}

function filterByTags(seq: ComboCollectionChain, tags?: string[]) {
  if (_.isEmpty(tags)) {
    return seq;
  }

  return seq.filter(_.chain(matchesTags).partialRight(tags).unary().value());
}

function filterByItem(seq: ComboCollectionChain, item?: string) {
  if (_.isEmpty(item)) {
    return seq;
  }

  return seq.filter(_.chain(matchesItem).partialRight(item).unary().value());
}

function filterByAbility(seq: ComboCollectionChain, ability?: string) {
  if (_.isEmpty(ability)) {
    return seq;
  }

  return seq.filter(_.chain(matchesAbility).partialRight(ability).unary().value());
}

class CombosView {
  private view: Combo[] = [];

  constructor(public combos: Combo[], private sortOrder = SORT_ORDER) {
    this.setCombos(combos);
  }

  private setCombos(combos: Combo[]) {
    this.combos = combos;
    this.setView(combos);
  }

  private setView(view: Combo[]) {
    this.view = view;
    this.sort();
  }

  private sort() {
    this.view = _.sortBy(this.view, this.sortOrder);
  }

  get size(): number {
    return this.view.length;
  }

  get entries(): Combo[] {
    return this.view;
  }

  filter(filters: Filters): void {
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

export type { CombosView };

CustomUIConfig.CombosView = CombosView;
