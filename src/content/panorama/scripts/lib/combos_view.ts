/// <reference path="./combo.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace CombosView {
    const {
      Combo: { matchesAbility, matchesItem, matchesTags, Property },
    } = invk;

    import Combo = invk.Combo.Combo;
    import Properties = invk.Combo.Properties;

    export type PropertiesFilter = Partial<Properties>;

    export interface Filters {
      properties?: PropertiesFilter;
      tags?: string[];
      item?: string;
      ability?: string;
    }

    type CombosChain = _.CollectionChain<Combo>;

    const SORT_ORDER = ["heroLevel", "difficultyRating", "id"];

    export class CombosView {
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

        seq = filterByProperties(seq, filters.properties);
        seq = filterByTags(seq, filters.tags);
        seq = filterByItem(seq, filters.item);
        seq = filterByAbility(seq, filters.ability);

        this.setView(seq.value());
      }
    }

    const filterByProperties = (seq: CombosChain, properties?: PropertiesFilter) =>
      _.isEmpty(properties)
        ? seq
        : _.reduce(Property, (seq, prop) => filterByProperty(seq, prop, properties[prop]), seq);

    const filterByProperty = <K extends keyof Properties>(
      seq: CombosChain,
      prop: K,
      value?: Properties[K]
    ) => (value == null ? seq : seq.filter(_.matchesProperty(prop, value)));

    const filterByTags = (seq: CombosChain, tags?: string[]) =>
      _.isEmpty(tags) ? seq : seq.filter(_.chain(matchesTags).partialRight(tags).unary().value());

    const filterByItem = (seq: CombosChain, item?: string) =>
      _.isEmpty(item) ? seq : seq.filter(_.chain(matchesItem).partialRight(item).unary().value());

    const filterByAbility = (seq: CombosChain, ability?: string) =>
      _.isEmpty(ability)
        ? seq
        : seq.filter(_.chain(matchesAbility).partialRight(ability).unary().value());
  }
}
