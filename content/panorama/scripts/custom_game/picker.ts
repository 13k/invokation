import { transform, uniqueId } from "lodash";
import { COMBOS } from "./custom_ui_manifest";
import type { Combo, ComboID } from "./lib/combo";
import { COMBO_TRAITS, FREESTYLE_COMBO_ID, TraitProperty } from "./lib/combo";
import type { ChangeEvent as CombosChangeEvent } from "./lib/combos_collection";
import { CombosView, Filters } from "./lib/combos_view";
import { Component } from "./lib/component";
import { ComponentLayout, COMPONENTS } from "./lib/const/component";
import {
  ComboFinishedEvent,
  ComboStartedEvent,
  ComboStoppedEvent,
  CustomEvent,
  PickerToggleEvent,
  PopupAbilityPickerSubmitEvent,
  PopupItemPickerSubmitEvent,
} from "./lib/const/events";
import type { PanelWithComponent } from "./lib/const/panorama";
import { CustomEvents } from "./lib/custom_events";
import { L10N_TRAIT_PROPERTIES, localizeComboPropertiesKey } from "./lib/l10n";
import { Action, ParallelSequence, SerialSequence } from "./lib/sequence";
import { UI } from "./lib/ui";
import { UIEvents } from "./lib/ui_events";
import type {
  Inputs as PickerCombosInputs,
  Outputs as PickerCombosOutputs,
  PickerCombos,
} from "./picker_combos";
import type {
  Inputs as UITagSelectInputs,
  Outputs as UITagSelectOutputs,
  UITagSelect,
} from "./ui/tag_select";

export type Inputs = never;
export type Outputs = never;

interface Elements {
  combos: CombosPanel;
  filterTagsContainer: Panel;
  filterTagsResetButton: Button;
  filterSpecialty: DropDown;
  filterStance: DropDown;
  filterDamageRating: DropDown;
  filterDifficultyRating: DropDown;
  filterItemImage: ItemImage;
  filterItemResetButton: Button;
  filterAbilityImage: AbilityImage;
  filterAbilityResetButton: Button;
}

type CombosPanel = PanelWithComponent<PickerCombos>;
type FilterTagsPanel = PanelWithComponent<UITagSelect>;

// const START_OPEN_DELAY = 1.0;

const DYN_ELEMS = {
  TAG_SELECT: {
    id: "filter-tags-select",
  },
  ITEM_PICKER: {
    id: "filter-item-picker",
  },
  ABILITY_PICKER: {
    id: "filter-ability-picker",
  },
};

const CLASSES = {
  CLOSED: "closed",
  COMBO_SELECTED: "combo-selected",
};

const SOUNDS = {
  OPEN: "Shop.PanelUp",
  CLOSE: "Shop.PanelDown",
  SELECT: "ui.books.pageturns",
};

const L10N_KEYS = {
  TRAIT_FILTER_OPTION_DEFAULT: "invokation_picker_filter_option_all",
};

const TRAIT_FILTER_OPTION_DEFAULT = "all";

const traitFilterOptionID = (trait: TraitProperty, value: string) => `filter-${trait}-${value}`;

export class Picker extends Component {
  #elements: Elements;
  #combos: CombosView;
  #filtering = false;
  #tags: string[] = [];
  #filterTags?: FilterTagsPanel;
  #popupItemPickerChannel: string;
  #popupAbilityPickerChannel: string;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      combos: "combos",
      filterTagsContainer: "filter-tags-container",
      filterTagsResetButton: "filter-tags-reset-button",
      filterSpecialty: "filter-specialty",
      filterStance: "filter-stance",
      filterDamageRating: "filter-damage-rating",
      filterDifficultyRating: "filter-difficulty-rating",
      filterItemImage: "filter-item-image",
      filterItemResetButton: "filter-item-reset-button",
      filterAbilityImage: "filter-ability-image",
      filterAbilityResetButton: "filter-ability-reset-button",
    });

    this.#combos = new CombosView();
    this.#popupItemPickerChannel = uniqueId("popup_item_picker_");
    this.#popupAbilityPickerChannel = uniqueId("popup_ability_picker_");

    this.enableFiltering();
    this.renderCombos();
    this.renderFilters();
    this.bindEvents();
  }

  // ----- Handlers -----

  onPickerToggle(payload: NetworkedData<PickerToggleEvent>): void {
    this.debug("onPickerToggle()", payload);
    this.toggle();
  }

  onCombosChange(ev: CombosChangeEvent): void {
    this.debugFn(() => ["onCombosChange()", { count: ev.combos.length }]);
    this.setCombos(COMBOS.combos);
  }

  onComboSelected(payload: PickerCombosOutputs["OnSelect"]): void {
    this.debug("onComboSelected()", payload);
    this.selectCombo(payload.id);
  }

  onComboPlay(payload: { id: ComboID }): void {
    this.debug("onComboPlay()", payload);
    this.startCombo(payload.id);
  }

  onComboStarted(payload: NetworkedData<ComboStartedEvent>): void {
    this.debug("onComboStarted()", payload);
    this.close();
  }

  onComboStopped(payload: NetworkedData<ComboStoppedEvent>): void {
    this.debug("onComboStopped()", payload);
    this.open();
  }

  onComboFinished(payload: NetworkedData<ComboFinishedEvent>): void {
    if (payload.id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboFinished()", payload);
    this.finishCombo(payload.id);
  }

  onFilterTagsChange(payload: UITagSelectOutputs["OnChange"]): void {
    this.debug("onFilterTagsChange()", payload);
    this.filterByTags(payload.tags);
  }

  onPopupItemPickerSubmit(payload: NetworkedData<PopupItemPickerSubmitEvent>): void {
    const { channel, item } = payload;

    if (channel !== this.#popupItemPickerChannel) {
      return;
    }

    this.debug("onPopupItemPickerSubmit()", payload);

    if (typeof item === "string" && item.length > 0) {
      this.filterByItem(item);
    }
  }

  onPopupAbilityPickerSubmit(payload: NetworkedData<PopupAbilityPickerSubmitEvent>): void {
    const { channel, ability } = payload;

    if (channel !== this.#popupAbilityPickerChannel) {
      return;
    }

    this.debug("onPopupAbilityPickerSubmit()", payload);

    if (typeof ability === "string" && ability.length > 0) {
      this.filterByAbility(ability);
    }
  }

  // ----- Properties -----

  get isClosed(): boolean {
    return this.ctx.BHasClass(CLASSES.CLOSED);
  }

  setCombos(combos: Combo[]): void {
    this.#combos = new CombosView(combos);

    this.updateTagsFilter();
    this.updateCombos();
  }

  get comboTags(): string[] {
    const uniq: Record<string, boolean> = {};

    this.#combos.visible.forEach((combo) => {
      combo.tags.forEach((tag) => {
        uniq[tag] = true;
      });
    });

    return Object.keys(uniq).sort();
  }

  // ----- Helpers -----

  bindEvents(): void {
    this.onCustomEvent(CustomEvent.PICKER_TOGGLE, this.onPickerToggle);
    this.onCustomEvent(CustomEvent.COMBO_STARTED, this.onComboStarted);
    this.onCustomEvent(CustomEvent.COMBO_STOPPED, this.onComboStopped);
    this.onCustomEvent(CustomEvent.COMBO_FINISHED, this.onComboFinished);
    this.onCustomEvent(CustomEvent.POPUP_ITEM_PICKER_SUBMIT, this.onPopupItemPickerSubmit);
    this.onCustomEvent(CustomEvent.POPUP_ABILITY_PICKER_SUBMIT, this.onPopupAbilityPickerSubmit);

    COMBOS.onChange(this.onCombosChange.bind(this));
  }

  createCombos(): void {
    const { outputs } = COMPONENTS.PICKER_COMBOS;

    this.loadComponent(this.#elements.combos, ComponentLayout.PickerCombos, {
      outputs: {
        [outputs.ON_SELECT]: this.onComboSelected,
      },
    });
  }

  updateCombos(): void {
    const { inputs } = COMPONENTS.PICKER_COMBOS;
    const payload: PickerCombosInputs["SetCombos"] = { combos: this.#combos };

    this.debugFn(() => ["updateCombos()", { count: this.#combos.length }]);

    this.#elements.combos.component.input(inputs.SET_COMBOS, payload);
  }

  startCombo(id: ComboID): void {
    this.debug("startCombo()", { id });

    CustomEvents.sendServer(CustomEvent.COMBO_START, { id });
  }

  finishCombo(id: ComboID): void {
    const { inputs } = COMPONENTS.PICKER_COMBOS;
    const payload: PickerCombosInputs["SetFinished"] = { id };

    this.debug("finishCombo()", payload);

    this.#elements.combos.component.input(inputs.SET_FINISHED, { id });
  }

  createTraitFilterOption(parent: Panel, trait: TraitProperty, value: string): Panel {
    const id = traitFilterOptionID(trait, value);
    let text;

    if (value === TRAIT_FILTER_OPTION_DEFAULT) {
      text = $.Localize(L10N_KEYS.TRAIT_FILTER_OPTION_DEFAULT);
      value = "";
    } else {
      text = localizeComboPropertiesKey(L10N_TRAIT_PROPERTIES[trait], value);
    }

    return this.createLabel(parent, id, text, {
      attrs: { value },
    });
  }

  createTagsFilter(): void {
    const { outputs } = COMPONENTS.UI_TAG_SELECT;
    const { id } = DYN_ELEMS.TAG_SELECT;

    this.#filterTags = this.createComponent(
      this.#elements.filterTagsContainer,
      id,
      ComponentLayout.UITagSelect,
      {
        outputs: {
          [outputs.ON_CHANGE]: this.onFilterTagsChange,
        },
      }
    );
  }

  updateTagsFilter(): void {
    if (this.#filterTags == null) {
      throw Error(`Picker.updateTagsFilter called without UITagSelect component`);
    }

    const { inputs } = COMPONENTS.UI_TAG_SELECT;
    const payload: UITagSelectInputs["SetOptions"] = { options: this.comboTags };

    this.#filterTags.component.input(inputs.SET_OPTIONS, payload);
  }

  resetTagsFilter(): void {
    if (this.#filterTags == null) {
      throw Error(`Picker.resetTagsFilter called without UITagSelect component`);
    }

    const { inputs } = COMPONENTS.UI_TAG_SELECT;

    this.#filterTags.component.input(inputs.CLEAR);
  }

  enableFiltering(): void {
    this.#filtering = true;
  }

  disableFiltering(): void {
    this.#filtering = false;
  }

  filter(): void {
    if (!this.#filtering) return;

    const traitFilters = transform(
      TraitProperty,
      (f, trait) => {
        f[trait] = this.dropDownFilterValue(this.traitFilter(trait));
      },
      {} as Filters
    );

    const filters: Filters = {
      ...traitFilters,
      tags: this.tagsFilterValue,
      item: this.itemFilterValue,
      ability: this.abilityFilterValue,
    };

    this.debug("filter()", filters);

    this.#combos.filter(filters);
  }

  traitFilter(trait: TraitProperty): DropDown {
    switch (trait) {
      case TraitProperty.Specialty:
        return this.#elements.filterSpecialty;
      case TraitProperty.Stance:
        return this.#elements.filterStance;
      case TraitProperty.DamageRating:
        return this.#elements.filterDamageRating;
      case TraitProperty.DifficultyRating:
        return this.#elements.filterDifficultyRating;
    }
  }

  dropDownFilterValue(dropDown: DropDown): string {
    return dropDown.GetSelected()?.GetAttributeString("value", "") ?? "";
  }

  get tagsFilterValue(): string[] {
    return this.#tags;
  }

  get itemFilterValue(): string {
    return this.#elements.filterItemImage.itemname;
  }

  get abilityFilterValue(): string {
    return this.#elements.filterAbilityImage.abilityname;
  }

  // ----- Actions -----

  renderCombosAction(): Action {
    return new SerialSequence().RunFunction(() => this.createCombos());
  }

  renderFiltersAction(): Action {
    return new ParallelSequence()
      .Action(this.renderTraitFiltersAction())
      .Action(this.renderTagsFilterAction());
  }

  renderTraitFiltersAction(): Action {
    const actions = Object.entries(COMBO_TRAITS).map(([trait, values]) => {
      const strValues = values.map((v: unknown) => String(v));

      return this.renderTraitFilterAction(trait as TraitProperty, strValues);
    });

    return new ParallelSequence().Action(...actions);
  }

  renderTraitFilterAction(trait: TraitProperty, values: string[]): Action {
    values = [TRAIT_FILTER_OPTION_DEFAULT, ...values];

    const dropDown = this.traitFilter(trait);
    const actions = values.map((value) => this.renderTraitFilterOptionAction(trait, value));

    return new SerialSequence().RemoveAllOptions(dropDown).Action(...actions);
  }

  renderTraitFilterOptionAction(trait: TraitProperty, value: string): Action {
    const dropDown = this.traitFilter(trait);

    return new SerialSequence().AddOption(
      dropDown,
      this.createTraitFilterOption(dropDown, trait, value)
    );
  }

  resetTraitFiltersAction(): Action {
    const actions = Object.keys(COMBO_TRAITS).map((t) =>
      this.resetTraitFilterAction(t as TraitProperty)
    );

    return new ParallelSequence().Action(...actions);
  }

  resetTraitFilterAction(trait: TraitProperty): Action {
    const dropDown = this.traitFilter(trait);

    return new SerialSequence().SelectOption(
      dropDown,
      traitFilterOptionID(trait, TRAIT_FILTER_OPTION_DEFAULT)
    );
  }

  renderTagsFilterAction(): Action {
    return new SerialSequence().RunFunction(() => this.createTagsFilter());
  }

  resetTagsFilterAction(): Action {
    return new SerialSequence().RunFunction(() => this.resetTagsFilter());
  }

  setItemFilterAction(itemname: string): Action {
    return new SerialSequence().SetItemImage(this.#elements.filterItemImage as ItemImage, {
      itemname,
    });
  }

  resetItemFilterAction(): Action {
    return new ParallelSequence()
      .Disable(this.#elements.filterItemResetButton)
      .Action(this.setItemFilterAction(""));
  }

  setAbilityFilterAction(abilityname: string): Action {
    return new SerialSequence().SetAbilityImage(this.#elements.filterAbilityImage as AbilityImage, {
      abilityname,
    });
  }

  resetAbilityFilterAction(): Action {
    return new ParallelSequence()
      .Disable(this.#elements.filterAbilityResetButton)
      .Action(this.setAbilityFilterAction(""));
  }

  renderViewerAction(): Action {
    // TODO: actually render viewer inside content panel
    // return new Sequence().RunFunction(() =>
    //   this.sendClientSide(CustomEvent.VIEWER_RENDER, { id: this.selectedCombo })
    // );
    return new SerialSequence();
  }

  // ----- Action runners -----

  renderCombos(): void {
    const seq = new SerialSequence().Action(this.renderCombosAction());

    this.debugFn(() => ["renderCombos()", { combos: this.#combos.length, actions: seq.length }]);

    seq.run();
  }

  renderFilters(): void {
    const seq = new SerialSequence().Action(this.renderFiltersAction());

    this.debugFn(() => ["renderFilters()", { actions: seq.length }]);

    seq.run();
  }

  open(): void {
    if (!this.isClosed) return;

    const seq = new ParallelSequence()
      .PlaySoundEffect(SOUNDS.OPEN)
      .RemoveClass(this.ctx, CLASSES.CLOSED)
      .RunFunction(() => UI.hideActionPanelUI());

    this.debugFn(() => ["open()", { actions: seq.length }]);

    seq.run();
  }

  close(): void {
    if (this.isClosed) return;

    const seq = new ParallelSequence()
      .PlaySoundEffect(SOUNDS.CLOSE)
      .AddClass(this.ctx, CLASSES.CLOSED)
      .RunFunction(() => UI.showActionPanelUI());

    this.debugFn(() => ["close()", { actions: seq.length }]);

    seq.run();
  }

  selectCombo(id: ComboID): void {
    const seq = new SerialSequence()
      .Action(this.renderViewerAction())
      .PlaySoundEffect(SOUNDS.SELECT);

    this.debugFn(() => ["selectCombo()", { id, actions: seq.length }]);

    seq.run();
  }

  filterByTags(tags: string[]): void {
    this.#tags = tags;

    const seq = new SerialSequence();

    if (this.#tags.length > 0) {
      seq.Disable(this.#elements.filterTagsResetButton);
    } else {
      seq.Enable(this.#elements.filterTagsResetButton);
    }

    seq.RunFunction(() => this.filter());

    this.debugFn(() => ["filterByTags()", { tags: this.#tags, actions: seq.length }]);

    seq.run();
  }

  filterByItem(name: string): void {
    const seq = new SerialSequence()
      .Action(this.setItemFilterAction(name))
      .Enable(this.#elements.filterItemResetButton)
      .RunFunction(() => this.filter());

    this.debugFn(() => ["filterByItem()", { item: name, actions: seq.length }]);

    seq.run();
  }

  filterByAbility(name: string): void {
    const seq = new SerialSequence()
      .Action(this.setAbilityFilterAction(name))
      .Enable(this.#elements.filterAbilityResetButton)
      .RunFunction(() => this.filter());

    this.debugFn(() => ["filterByAbility()", { ability: name, actions: seq.length }]);

    seq.run();
  }

  resetFilters(): void {
    const seq = new SerialSequence()
      .RunFunction(() => this.disableFiltering())
      .Action(this.resetTraitFiltersAction())
      .Action(this.resetTagsFilterAction())
      .Action(this.resetItemFilterAction())
      .Action(this.resetAbilityFilterAction())
      .RunFunction(() => this.enableFiltering())
      .RunFunction(() => this.filter());

    this.debugFn(() => ["resetFilters()", { actions: seq.length }]);

    seq.run();
  }

  resetItemFilter(): void {
    const seq = new SerialSequence()
      .Action(this.resetItemFilterAction())
      .RunFunction(() => this.filter());

    this.debugFn(() => ["resetItemFilter()", { actions: seq.length }]);

    seq.run();
  }

  resetAbilityFilter(): void {
    const seq = new SerialSequence()
      .Action(this.resetAbilityFilterAction())
      .RunFunction(() => this.filter());

    this.debugFn(() => ["resetAbilityFilter()", { actions: seq.length }]);

    seq.run();
  }

  // ----- UI methods -----

  reload(): void {
    this.debug("reload()");
    COMBOS.reload();
  }

  toggle(): void {
    if (this.isClosed) {
      this.open();
    } else {
      this.close();
    }
  }

  freestyle(): void {
    this.debug("freestyle()");
    this.startCombo(FREESTYLE_COMBO_ID);
  }

  showItemFilter(): void {
    const { layout } = COMPONENTS.POPUP_ITEM_PICKER;
    const { id } = DYN_ELEMS.ITEM_PICKER;

    UIEvents.showPopup(id, layout, {
      channel: this.#popupItemPickerChannel,
    });
  }

  showAbilityFilter(): void {
    const { layout } = COMPONENTS.POPUP_INVOKER_ABILITY_PICKER;
    const { id } = DYN_ELEMS.ABILITY_PICKER;

    UIEvents.showPopup(id, layout, {
      channel: this.#popupAbilityPickerChannel,
    });
  }
}

//   context.picker = new Picker();

//   new Sequence()
//     .Wait(START_OPEN_DELAY)
//     .RunFunction(() => context.picker.open())
//     .Start();
// })(GameUI.CustomUIConfig(), this);
