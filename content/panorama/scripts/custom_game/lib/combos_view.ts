import { find, intersection, matchesProperty, sortBy } from "lodash";
import { Callbacks } from "./callbacks";

const SORT_ORDER: invk.Combo.Property[] = ["heroLevel", "difficultyRating", "id"];

const isFilterValue = (value?: string | null): value is string => value != null && value !== "";

const matchesTags = (tags: string[]) => (combo: invk.Combo.Combo): boolean =>
  intersection(combo.tags, tags).length > 0;

const matchesItem = (item: string) => (combo: invk.Combo.Combo): boolean =>
  !!find(combo.sequence, ["name", item]);

const matchesAbility = (ability: string) => (combo: invk.Combo.Combo): boolean =>
  !!find(combo.sequence, ["name", ability]);

function filterByTrait(
  combos: invk.Combo.Combo[],
  trait: invk.Combo.TraitProperty,
  value?: string | null
): invk.Combo.Combo[] {
  if (!isFilterValue(value)) {
    return combos;
  }

  return combos.filter(matchesProperty(trait, value));
}

function filterByTags(combos: invk.Combo.Combo[], tags?: string[] | null): invk.Combo.Combo[] {
  if (tags == null || tags.length === 0) {
    return combos;
  }

  return combos.filter(matchesTags(tags));
}

function filterByItem(combos: invk.Combo.Combo[], item?: string | null): invk.Combo.Combo[] {
  if (!isFilterValue(item)) {
    return combos;
  }

  return combos.filter(matchesItem(item));
}

function filterByAbility(combos: invk.Combo.Combo[], ability?: string | null): invk.Combo.Combo[] {
  if (!isFilterValue(ability)) {
    return combos;
  }

  return combos.filter(matchesAbility(ability));
}

interface ChangeEvent {
  combos: invk.Combo.Combo[];
  visible: invk.Combo.Combo[];
  hidden: invk.Combo.Combo[];
}

interface CombosViewCallbacks {
  change: ChangeEvent;
}

export type Filters = {
  [Property in invk.Combo.TraitProperty]?: string;
} & {
  tags?: string[];
  ability?: string;
  item?: string;
};

export class CombosView {
  #combos: invk.Combo.Combo[];
  #view: invk.Combo.Combo[];
  #hidden: invk.Combo.Combo[];
  #visible: { [id: string]: boolean };
  #cb: Callbacks<CombosViewCallbacks>;

  constructor(combos: invk.Combo.Combo[]) {
    this.#combos = [];
    this.#view = [];
    this.#hidden = [];
    this.#visible = {};
    this.#cb = new Callbacks();

    this.combos = combos;
  }

  private get _view(): invk.Combo.Combo[] {
    return this.#view;
  }

  private set _view(combos: invk.Combo.Combo[]) {
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

  get combos(): invk.Combo.Combo[] {
    return this.#combos;
  }

  set combos(combos: invk.Combo.Combo[]) {
    combos = combos || [];

    this.#combos = combos;
    this._view = combos;
  }

  get visible(): invk.Combo.Combo[] {
    return this._view;
  }

  get hidden(): invk.Combo.Combo[] {
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

    Object.values(invk.Combo.TraitProperty).forEach((property) => {
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
