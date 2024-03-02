/// <reference path="combo.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace combo {
    import Combo = invk.combo.Combo;
    import Properties = invk.combo.Properties;
    import Property = invk.combo.Property;

    import matchesAbility = invk.combo.matchesAbility;
    import matchesItem = invk.combo.matchesItem;
    import matchesTags = invk.combo.matchesTags;

    export type PropertiesFilter = Partial<Properties>;

    type Filter = (combo: Combo) => boolean;

    export interface Filters {
      properties?: PropertiesFilter;
      tags?: Set<string>;
      item?: string;
      ability?: string;
    }

    export type SortKey = "id" | "heroLevel" | Property;

    const SORT_ORDER: SortKey[] = [Property.DifficultyRating, "heroLevel", "id"];

    export class CombosView {
      private view: Combo[] = [];

      constructor(
        public combos: Combo[],
        public sortOrder: SortKey[] = SORT_ORDER,
      ) {
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
        this.view.sort((left, right) => {
          for (let i = 0; i < this.sortOrder.length; i++) {
            const attr = this.sortOrder[i];

            if (attr == null) throw "unreachable";

            const leftVal = left[attr];
            const rightVal = right[attr];

            if (leftVal > rightVal) {
              return 1;
            }

            if (leftVal < rightVal) {
              return -1;
            }
          }

          return 0;
        });
      }

      get size(): number {
        return this.view.length;
      }

      [Symbol.iterator](): IterableIterator<Combo> {
        return this.values;
      }

      get values(): IterableIterator<Combo> {
        return this.view.values();
      }

      map<T>(iteratee: (combo: Combo) => T): T[] {
        return this.view.map(iteratee);
      }

      reset(): void {
        this.setCombos(this.combos);
      }

      filter(filterBy: Filters): boolean {
        const filters: (Filter | undefined)[] = [];

        if (filterBy.properties != null) {
          for (const [prop, value] of Object.entries(filterBy.properties)) {
            filters.push(filterByProperty(prop as Property, value));
          }
        }

        filters.push(filterByTags(filterBy.tags));
        filters.push(filterByItem(filterBy.item));
        filters.push(filterByAbility(filterBy.ability));

        const view = this.combos.filter((combo) => {
          for (const filter of filters) {
            if (filter != null && !filter(combo)) return false;
          }

          return true;
        });

        const dirty = this.view.length !== view.length;

        if (dirty) {
          this.setView(view);
        }

        return dirty;
      }
    }

    function filterByProperty<K extends Property>(
      prop: K,
      value: Properties[K] | undefined,
    ): Filter | undefined {
      if (value == null) return undefined;

      return (combo) => combo[prop] === value;
    }

    function filterByTags(tags: Set<string> | undefined): Filter | undefined {
      if (tags == null || tags.size === 0) return undefined;

      return (combo) => matchesTags(combo, tags);
    }

    function filterByItem(item: string | undefined): Filter | undefined {
      if (item == null || item.length === 0) return undefined;

      return (combo) => matchesItem(combo, item) != null;
    }

    function filterByAbility(ability: string | undefined): Filter | undefined {
      if (ability == null || ability.length === 0) return undefined;

      return (combo) => matchesAbility(combo, ability) != null;
    }
  }
}
