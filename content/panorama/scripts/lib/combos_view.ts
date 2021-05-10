import { find, intersection, matchesProperty, sortBy } from "lodash";

import { Callbacks } from "./callbacks";
import type { Combo, Property } from "./combo";
import { TraitProperty } from "./combo";

const SORT_ORDER: Property[] = ["heroLevel", "difficultyRating", "id"];

const isFilterValue = (value?: string | null): value is string => value != null && value !== "";

const matchesTags = (tags: string[]) => (combo: Combo): boolean =>
  intersection(combo.tags, tags).length > 0;

const matchesItem = (item: string) => (combo: Combo): boolean =>
  !!find(combo.sequence, ["name", item]);

const matchesAbility = (ability: string) => (combo: Combo): boolean =>
  !!find(combo.sequence, ["name", ability]);

function filterByTrait(combos: Combo[], trait: TraitProperty, value?: string | null): Combo[] {
  if (!isFilterValue(value)) {
    return combos;
  }

  return combos.filter(matchesProperty(trait, value));
}

function filterByTags(combos: Combo[], tags?: string[] | null): Combo[] {
  if (tags == null || tags.length === 0) {
    return combos;
  }

  return combos.filter(matchesTags(tags));
}

function filterByItem(combos: Combo[], item?: string | null): Combo[] {
  if (!isFilterValue(item)) {
    return combos;
  }

  return combos.filter(matchesItem(item));
}

function filterByAbility(combos: Combo[], ability?: string | null): Combo[] {
  if (!isFilterValue(ability)) {
    return combos;
  }

  return combos.filter(matchesAbility(ability));
}

export interface ChangeEvent {
  combos: Combo[];
  visible: Combo[];
  hidden: Combo[];
}

interface CombosViewCallbacks {
  change: ChangeEvent;
}

export type Filters = {
  [Property in TraitProperty]?: string;
} & {
  tags?: string[];
  ability?: string;
  item?: string;
};

export class CombosView {
  #combos: Combo[];
  #view: Combo[];
  #hidden: Combo[];
  #visible: { [id: string]: boolean };
  #cb: Callbacks<CombosViewCallbacks>;

  constructor(combos?: Combo[]) {
    this.#combos = [];
    this.#view = [];
    this.#hidden = [];
    this.#visible = {};
    this.#cb = new Callbacks();

    if (combos != null) {
      this.combos = combos;
    }
  }

  private get _view(): Combo[] {
    return this.#view;
  }

  private set _view(combos: Combo[]) {
    this.#view = combos;
    this.#visible = Object.fromEntries(combos.map(({ id }): [string, boolean] => [id, true]));
    this.#hidden = this.combos.filter(({ id }) => !this.isVisible(id));

    this.sort();

    this.#cb.run("change", {
      combos: this.combos,
      visible: this.visible,
      hidden: this.hidden,
    });
  }

  get length(): number {
    return this.visible.length;
  }

  get combos(): Combo[] {
    return this.#combos;
  }

  set combos(combos: Combo[]) {
    combos = combos || [];

    this.#combos = combos;
    this._view = combos;
  }

  get visible(): Combo[] {
    return this._view;
  }

  get hidden(): Combo[] {
    return this.#hidden;
  }

  isVisible(id: string): boolean {
    return id in this.#visible;
  }

  sort(): void {
    this.#view = sortBy(this._view, SORT_ORDER);
  }

  filter(filters: Filters): void {
    let combos = this.combos;

    Object.values(TraitProperty).forEach((property) => {
      combos = filterByTrait(combos, property, filters[property]);
    });

    combos = filterByTags(combos, filters.tags);
    combos = filterByItem(combos, filters.item);
    combos = filterByAbility(combos, filters.ability);

    this._view = combos;
  }

  onChange(cb: (ev: ChangeEvent) => void): void {
    this.#cb.on("change", cb);
  }
}
