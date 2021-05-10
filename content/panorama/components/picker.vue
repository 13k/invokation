<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/picker.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/picker.css" />
  </styles>

  <Panel class="root closed" hittest="false">
    <Panel class="picker" hittest="false">
      <Panel id="combos" hittest="false" />

      <Panel class="filters" hittest="false">
        <Panel class="filter-row" hittest="false">
          <Label class="filter-label" text="#invokation_combo_properties__specialty" hittest="false" />
          <DropDown id="filter-specialty" oninputsubmit="picker.Filter()" />
        </Panel>

        <Panel class="filter-row" hittest="false">
          <Label class="filter-label" text="#invokation_combo_properties__stance" hittest="false" />
          <DropDown id="filter-stance" oninputsubmit="picker.Filter()" />
        </Panel>

        <Panel class="filter-row" hittest="false">
          <Label class="filter-label" text="#invokation_combo_properties__damage_rating" hittest="false" />
          <DropDown id="filter-damage-rating" oninputsubmit="picker.Filter()" />
        </Panel>

        <Panel class="filter-row" hittest="false">
          <Label class="filter-label" text="#invokation_combo_properties__difficulty_rating" hittest="false" />
          <DropDown id="filter-difficulty-rating" oninputsubmit="picker.Filter()" />
        </Panel>

        <Panel class="filter-row popup-picker-row" hittest="false">
          <Panel class="popup-picker-column">
            <Panel class="LeftRightFlow">
              <Label class="popup-picker-label" text="#invokation_picker_filter_item" hittest="false" />
              <Button id="filter-item-reset-button" class="filter-reset-button CloseButton" disabled="true" onactivate="picker.ResetItemFilter()" onmouseover="UIShowTextTooltip(#invokation_picker_tooltip_filter_item_reset)" onmouseout="UIHideTextTooltip()" />
            </Panel>

            <Button class="popup-picker-icon-button" onactivate="picker.ShowItemFilter()">
              <DOTAItemImage id="filter-item-image" />
            </Button>
          </Panel>

          <Panel class="popup-picker-column">
            <Panel class="LeftRightFlow">
              <Label class="popup-picker-label" text="#invokation_picker_filter_ability" hittest="false" />
              <Button id="filter-ability-reset-button" class="filter-reset-button CloseButton" disabled="true" onactivate="picker.ResetAbilityFilter()" onmouseover="UIShowTextTooltip(#invokation_picker_tooltip_filter_ability_reset)" onmouseout="UIHideTextTooltip()" />
            </Panel>

            <Button class="popup-picker-icon-button" onactivate="picker.ShowAbilityFilter()">
              <DOTAAbilityImage id="filter-ability-image" />
            </Button>
          </Panel>
        </Panel>

        <Panel class="filter-row" hittest="false">
          <Panel class="LeftRightFlow">
            <Label class="filter-label" text="#invokation_combo_properties__tags" hittest="false" />
            <Button id="filter-tags-reset-button" class="filter-reset-button CloseButton" disabled="true" onactivate="picker.ResetTagsFilter()" onmouseover="UIShowTextTooltip(#invokation_picker_tooltip_filter_tags_reset)" onmouseout="UIHideTextTooltip()" />
          </Panel>
          <Panel id="filter-tags-container" />
        </Panel>

        <Panel class="filter-row buttons-row" hittest="false">
          <Button class="filters-reset-button ButtonDark" onactivate="picker.ResetFilters()">
            <Label text="#invokation_picker_filters_reset" hittest="false" />
          </Button>
        </Panel>
      </Panel>

      <Panel class="content">
        <Panel class="content-header">
          <Button class="RefreshButton" onactivate="picker.Reload()" />
          <Button class="CloseButton" onactivate="picker.Toggle()" />

          <Button class="freestyle-button" onactivate="picker.Freestyle()">
            <Label class="freestyle-label" text="#invokation_picker_freestyle_play" hittest="false" />
          </Button>
        </Panel>

        <Panel class="content-body">
          <Label class="placeholder" text="#invokation_picker_selection_placeholder" />

          <Panel class="description">
            <Panel class="description-bg" />
            <Panel class="description-body" />
          </Panel>

          <DOTAScenePanel class="body-fx" map="scenes/diretide/diretide_moreinfo_fog" camera="shot_camera" particleonly="true" hittest="false" />
        </Panel>
      </Panel>
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import { transform, uniqueId } from "lodash";

import type { Combo, ComboID } from "../scripts/lib/combo";
import { COMBO_TRAITS, FREESTYLE_COMBO_ID, TraitProperty } from "../scripts/lib/combo";
import type { ChangeEvent as CombosChangeEvent } from "../scripts/lib/combos_collection";
import { CombosView, Filters } from "../scripts/lib/combos_view";
import { Component } from "../scripts/lib/component";
import { ComponentLayout, COMPONENTS } from "../scripts/lib/const/component";
import {
  ComboFinishedEvent,
  ComboStartedEvent,
  ComboStoppedEvent,
  CustomEvent,
  PickerToggleEvent,
  PopupAbilityPickerSubmitEvent,
  PopupItemPickerSubmitEvent,
} from "../scripts/lib/const/events";
import type { PanelWithComponent } from "../scripts/lib/const/panorama";
import { CustomEvents } from "../scripts/lib/custom_events";
import { L10N_TRAIT_PROPERTIES, localizeComboPropertiesKey } from "../scripts/lib/l10n";
import { Action, ParallelSequence, SerialSequence } from "../scripts/lib/sequence";
import { UI } from "../scripts/lib/ui";
import { UIEvents } from "../scripts/lib/ui_events";
import type PickerCombos from "./picker_combos.vue";
import type {
  Inputs as PickerCombosInputs,
  Outputs as PickerCombosOutputs,
} from "./picker_combos.vue";
import type UITagSelect from "./ui/tag_select.vue";
import type {
  Inputs as UITagSelectInputs,
  Outputs as UITagSelectOutputs,
} from "./ui/tag_select.vue";

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

const START_OPEN_DELAY = 1.0;

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

export default class Picker extends Component {
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
    this.setCombos(UI.config.combos.combos);
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

    UI.config.combos.onChange(this.onCombosChange.bind(this));
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
    UI.config.combos.reload();
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

global.picker = new Picker();

(() => {
  new SerialSequence()
    .Wait(START_OPEN_DELAY)
    .RunFunction(() => global.picker.open())
    .run();
})();
</script>

<style lang="scss">
@use "../styles/variables";

$combos-width: 320px;
$combo-width: 290px;
$filters-width: 240px;
$filter-row-width: 220px;
$paper-width: 637px;
$paper-height: 834px;

.root {
  width: 1392px;
  height: 964px;
  margin-top: 32px;
  align: center middle;
  opacity: 1;
  transition-delay: 0s;
  transition-timing-function: ease-in-out;
  transition-duration: 0.35s;
  transition-property: opacity;

  &.closed {
    opacity: 0;
    transition-delay: 0s;
    transition-duration: 0s;
    transition-property: opacity;
  }
}

.picker {
  width: 100%;
  height: 100%;
  background-image: variables.$bg-picker;
  background-repeat: no-repeat;
  background-size: 100%;
  border: 2px solid rgba(27, 32, 36, 0.75);
  border-radius: 2px;
  flow-children: right;
  // box-shadow: -6px -6px 12px 12px rgba(27, 32, 36, 0.75);
}

#combos {
  width: $combos-width;
  height: 100%;
}

.filters {
  width: $filters-width;
  height: 100%;
  padding: 10px;
  overflow: noclip scroll;
  flow-children: down;

  .filter-row {
    flow-children: down;
    width: $filter-row-width;
    margin-top: 10px;

    &.popup-picker-row {
      flow-children: right;
    }

    &.buttons-row {
      flow-children: right;
      width: fit-children;
      margin-top: 30px;
      horizontal-align: center;
    }
  }

  .filter-label {
    margin-bottom: 4px;
  }

  .filter-reset-button {
    width: 12px;
    height: 12px;
    margin: 0 0 0 6px;
    padding: 0;
    vertical-align: center;
    wash-color: #ff808088;

    &:hover {
      wash-color: #ff8080;
    }

    &:disabled {
      visibility: collapse;
    }
  }

  .popup-picker-column {
    flow-children: down;
    margin-right: 10px;
  }

  .popup-picker-label {
    margin: 0 0 4px;
    padding: 0;
    vertical-align: center;
  }

  .popup-picker-icon-button {
    background-color: gradient(linear, 0% 0%, 0% 100%, from(#373d45), to(#4d5860));
    border-style: solid;
    border-width: 1px;
    border-top-color: #555;
    border-right-color: #404040;
    border-bottom-color: #333;
    border-left-color: #494949;
  }

  .filters-reset-button {
    min-width: 142px;
  }
}

#filter-tags-container {
  width: 100%;
}

#filter-item-image {
  width: 40px;
  height: 40px;
  align: center center;
}

#filter-ability-image {
  width: 40px;
  height: 40px;
  align: center center;
}

.content {
  flow-children: down;
  width: 1056px;
  height: 100%;
  box-shadow: inset 4px 0 8px 4px #000000b8;
}

.content-header {
  width: 100%;
  height: 64px;
  background-color: gradient(linear, 100% 0%, 0% 0%, from(#0d121788), to(#070a0c88));

  .RefreshButton {
    width: 24px;
    height: 24px;
    margin: 8px 40px 0 0;
    background-size: 100%;
    visibility: collapse;
    horizontal-align: right;
    wash-color: #777;

    &:hover {
      wash-color: variables.$color-text-exort;
    }
  }

  .CloseButton {
    width: 24px;
    height: 24px;
    margin: 8px 8px 0 0;
    horizontal-align: right;
    wash-color: #fff;
    background-size: 100%;

    &:hover {
      wash-color: variables.$color-accent-wex;
    }
  }
}

.development .content-header {
  .RefreshButton {
    visibility: visible;
  }
}

.freestyle-button {
  width: 170px;
  height: 50px;
  margin-top: 14px;
  horizontal-align: middle;
  background-image: variables.$hud-invoker-card;
  background-repeat: no-repeat;
  background-size: 100%;
  transition-timing-function: ease-in-out;
  transition-duration: 0.18s;
  transition-property: brightness, saturation;

  &:hover {
    brightness: 2;
    saturation: 1.3;
  }

  &:active {
    pre-transform-scale2d: 0.975;
  }

  .freestyle-label {
    margin-top: 2px;
    color: #000;
    font-weight: bold;
    letter-spacing: 2px;
    text-align: center;
    text-transform: uppercase;
    text-overflow: shrink;
    text-shadow: 0 0 3px 3 #0003;
    align: center center;
  }

  &:hover .freestyle-label {
    color: #ccc;
  }
}

.content-body {
  width: 100%;
  height: fill-parent-flow(1);
  border-top: 1px solid #000;

  .placeholder {
    max-height: 80px;
    color: variables.$color-text-blue-grey-bright;
    font-weight: semi-bold;
    font-size: 28px;
    letter-spacing: 2px;
    text-align: center;
    text-transform: uppercase;
    opacity: 1;
    transition-delay: 0s;
    transition-timing-function: ease-in-out;
    transition-duration: 0.35s;
    transition-property: opacity;
    align: center center;
  }

  .body-fx {
    width: 100%;
    height: 33%;
    vertical-align: bottom;
    brightness: 3;
    hue-rotation: 60deg;
    animation-name: qwe-hue-rotation;
    animation-duration: 30s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .description {
    width: 100%;
    height: 100%;
    border-top: 1px solid #0000;
    opacity: 0;
    transition-delay: 0s;
    transition-duration: 0s;
    transition-property: opacity;
    flow-children: none;
  }

  .description-bg {
    width: $paper-width;
    height: $paper-height;
    align: center center;
    background-image: variables.$bg-viewer;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: contain;
  }
}

.combo-selected .content-body {
  .placeholder {
    opacity: 0;
    transition-delay: 0s;
    transition-duration: 0s;
    transition-property: opacity;
  }

  .description {
    opacity: 1;
    transition-delay: 0s;
    transition-timing-function: ease-in-out;
    transition-duration: 0.35s;
    transition-property: opacity;
  }
}

@keyframes qwe-hue-rotation {
  0% {
    hue-rotation: 60deg;
  }

  30% {
    hue-rotation: 60deg;
  }

  33% {
    hue-rotation: 145deg;
  }

  63% {
    hue-rotation: 145deg;
  }

  66% {
    hue-rotation: 275deg;
  }

  98% {
    hue-rotation: 275deg;
  }

  100% {
    hue-rotation: 360deg;
  }
}
</style>
