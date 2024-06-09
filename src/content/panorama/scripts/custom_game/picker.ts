import camelCase from "lodash-es/camelCase";

import type {
  Combo,
  ComboId,
  Properties,
  PropertyDescriptor,
} from "@invokation/panorama-lib/combo";
import {
  DamageRating,
  DifficultyRating,
  PROPERTIES,
  Property,
  Specialty,
  Stance,
  StaticId,
} from "@invokation/panorama-lib/combo";
import type { Filters } from "@invokation/panorama-lib/combo/combos_view";
import { CombosView } from "@invokation/panorama-lib/combo/combos_view";
import type {
  ComboFinished,
  ComboStarted,
  ComboStopped,
  PopupAbilityPickerSubmit,
  PopupItemPickerSubmit,
} from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent, GameEvent } from "@invokation/panorama-lib/custom_events";
import * as l10n from "@invokation/panorama-lib/l10n";
import { SoundEvent, createLabel } from "@invokation/panorama-lib/panorama";
import type { Action } from "@invokation/panorama-lib/sequence";
import {
  AddOptionAction,
  NoopAction,
  ParallelSequence,
  RunFunctionAction,
  SelectOptionAction,
  Sequence,
  SetAttributeAction,
} from "@invokation/panorama-lib/sequence";
import { parseEnumValue } from "@invokation/panorama-lib/util/enum";
import { pascalCase } from "@invokation/panorama-lib/util/pascalCase";
import { uniqueId } from "@invokation/panorama-lib/util/uniqueId";

import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";
import type { PickerCombo, PickerComboOutputs } from "./picker/combo";
import type { TagSelect, TagSelectOutputs } from "./ui/tag_select";

export interface PickerElements extends Elements {
  btnFreestyle: Button;
  btnReload: Button;
  btnResetFilters: Button;
  btnShowAbilityFilter: Button;
  btnShowItemFilter: Button;
  btnToggle: Button;
  btnToggleFilters: ToggleButton;
  combos: Panel;
  filterAbilityImage: AbilityImage;
  filterAbilityResetBtn: Panel;
  filterDamageRating: DropDown;
  filterDifficultyRating: DropDown;
  filterItemImg: ItemImage;
  filterItemResetBtn: Panel;
  filterSpecialty: DropDown;
  filterStance: DropDown;
  filterTagsContainer: Panel;
  filterTagsResetBtn: Panel;
  slideout: Panel;
}

enum PanelId {
  TagSelect = "PickerFilterTags",
  PopupItemPicker = "PickerPopupItemPicker",
  PopupInvokerAbilityPicker = "PickerPopupInvokerAbilityPicker",
}

enum CssClass {
  ComboPanel = "PickerCombo",
  DrawerClosed = "DrawerClosed",
  FiltersClosed = "FiltersClosed",
}

const { COMBOS } = GameUI.CustomUIConfig().invk;

const COMBO_PANEL_ID_PREFIX = "PickerCombo";
const PROPERTY_FILTER_ATTRIBUTE = "value";
const PROPERTY_FILTER_OPTION_DEFAULT = "all";
const PROPERTY_FILTER_NOT_SELECTED = {
  [Property.Stance]: "",
  [Property.Specialty]: "",
  [Property.DamageRating]: -1,
  [Property.DifficultyRating]: -1,
} as const;

export type { Picker };

class Picker extends Component<PickerElements> {
  combosView: CombosView | undefined;
  pickerCombos: Map<ComboId, PickerCombo> = new Map();
  finishedCombos: Map<ComboId, boolean> = new Map();
  tagSelect: TagSelect | undefined;
  filterTags: Set<string> = new Set();
  filtering = false;
  popupItemPickerChannel: string;
  popupAbilityPickerChannel: string;

  constructor() {
    super({
      elements: {
        btnFreestyle: "BtnFreestyle",
        btnReload: "BtnReload",
        btnResetFilters: "BtnResetFilters",
        btnShowAbilityFilter: "BtnShowAbilityFilter",
        btnShowItemFilter: "BtnShowItemFilter",
        btnToggle: "BtnToggle",
        btnToggleFilters: "BtnToggleFilters",
        combos: "PickerCombos",
        filterAbilityImage: "PickerFilterAbilityImage",
        filterAbilityResetBtn: "PickerFilterAbilityResetButton",
        filterDamageRating: "PickerFilterDamageRating",
        filterDifficultyRating: "PickerFilterDifficultyRating",
        filterItemImg: "PickerFilterItemImage",
        filterItemResetBtn: "PickerFilterItemResetButton",
        filterSpecialty: "PickerFilterSpecialty",
        filterStance: "PickerFilterStance",
        filterTagsContainer: "PickerFilterTagsContainer",
        filterTagsResetBtn: "PickerFilterTagsResetButton",
        slideout: "PickerSlideout",
      },
      customEvents: {
        [CustomGameEvent.ComboStarted]: (payload) => this.onComboStarted(payload),
        [CustomGameEvent.ComboStopped]: (payload) => this.onComboStopped(payload),
        [CustomGameEvent.ComboFinish]: (payload) => this.onComboFinished(payload),
        [GameEvent.PopupItemPickerSubmit]: (payload) => this.onPopupItemPickerSubmit(payload),
        [GameEvent.PopupAbilityPickerSubmit]: (payload) => this.onPopupAbilityPickerSubmit(payload),
      },
      panelEvents: {
        btnFreestyle: { onactivate: () => this.onBtnFreestyle() },
        btnReload: { onactivate: () => this.onBtnReload() },
        btnResetFilters: { onactivate: () => this.onBtnResetFilters() },
        btnShowAbilityFilter: { onactivate: () => this.onBtnShowAbilityFilter() },
        btnShowItemFilter: { onactivate: () => this.onBtnShowItemFilter() },
        btnToggle: { onactivate: () => this.onBtnToggle() },
        btnToggleFilters: { onactivate: () => this.onBtnToggleFilters() },
        filterAbilityResetBtn: { onactivate: () => this.onBtnResetAbilityFilter() },
        filterDamageRating: { oninputsubmit: () => this.onFilterSubmit() },
        filterDifficultyRating: { oninputsubmit: () => this.onFilterSubmit() },
        filterItemResetBtn: { onactivate: () => this.onBtnResetItemFilter() },
        filterSpecialty: { oninputsubmit: () => this.onFilterSubmit() },
        filterStance: { oninputsubmit: () => this.onFilterSubmit() },
        filterTagsResetBtn: { onactivate: () => this.onBtnResetTagsFilter() },
      },
    });

    this.popupItemPickerChannel = uniqueId("popup_item_picker_");
    this.popupAbilityPickerChannel = uniqueId("popup_ability_picker_");

    this.enableFiltering();
    this.renderFilters();
    this.bindEvents();
    this.debug("init");
  }

  // ----- Event handlers -----

  onCombosChange(): void {
    this.debug("onCombosChange()");

    if (this.tagSelect == null) {
      this.warn("Undefined tagSelect");
      return;
    }

    this.combosView = new CombosView([...COMBOS]);
    this.tagSelect.sendInputs({ setOptions: { options: this.allTags() } });
    this.renderCombos();
  }

  onComboDetailsShow(payload: PickerComboOutputs["onShowDetails"]): void {
    this.debug("onComboDetailsShow()", payload);
    this.close();
    this.renderViewer(payload.id);
  }

  onComboPlay(payload: PickerComboOutputs["onPlay"]): void {
    this.debug("onComboPlay()", payload);
    this.startCombo(payload.id);
  }

  onComboStarted(payload: NetworkedData<ComboStarted>): void {
    this.debug("onComboStarted()", payload);
    this.close();
  }

  onComboStopped(payload: NetworkedData<ComboStopped>): void {
    this.debug("onComboStopped()", payload);
    this.open();
  }

  onComboFinished(payload: NetworkedData<ComboFinished>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboFinished()", payload);
    this.finishCombo(payload.id);
  }

  onPopupItemPickerSubmit(payload: NetworkedData<PopupItemPickerSubmit>): void {
    if (payload.channel !== this.popupItemPickerChannel) {
      return;
    }

    this.debug("onPopupItemPickerSubmit()", payload);

    if (payload.item.length > 0) {
      this.filterByItem(payload.item);
    }
  }

  onPopupAbilityPickerSubmit(payload: NetworkedData<PopupAbilityPickerSubmit>): void {
    if (payload.channel !== this.popupAbilityPickerChannel) {
      return;
    }

    this.debug("onPopupAbilityPickerSubmit()", payload);

    if (payload.ability.length > 0) {
      this.filterByAbility(payload.ability);
    }
  }

  onFilterTagsChange(payload: TagSelectOutputs["onChange"]): void {
    this.debug("onFilterTagsChange()", payload);
    this.filterByTags(payload.tags);
  }

  onBtnReload(): void {
    this.debug("Reload()");
    COMBOS.reload();
  }

  onBtnToggle(): void {
    if (this.isClosed()) {
      this.open();
    } else {
      this.close();
    }
  }

  onBtnFreestyle(): void {
    this.debug("Freestyle()");
    this.startCombo(StaticId.Freestyle);
  }

  onBtnToggleFilters(): void {
    if (this.isFiltersPanelClosed()) {
      this.openFilters();
    } else {
      this.closeFilters();
    }
  }

  onFilterSubmit(): void {
    if (!this.filtering) {
      return;
    }

    if (this.filter()) {
      this.renderCombos();
    }
  }

  onBtnResetFilters(): void {
    this.resetFilters();
  }

  onBtnResetTagsFilter(): void {
    this.resetTagsFilter();
  }

  onBtnShowItemFilter(): void {
    this.showPopup(this.elements.filterItemImg, LayoutId.PopupItemPicker, PanelId.PopupItemPicker, {
      channel: this.popupItemPickerChannel,
    });
  }

  onBtnResetItemFilter(): void {
    this.resetItemFilter();
  }

  onBtnShowAbilityFilter(): void {
    this.showPopup(
      this.elements.filterAbilityImage,
      LayoutId.PopupInvokerAbilityPicker,
      PanelId.PopupInvokerAbilityPicker,
      { channel: this.popupAbilityPickerChannel },
    );
  }

  onBtnResetAbilityFilter(): void {
    this.resetAbilityFilter();
  }

  // ----- Helpers -----

  bindEvents(): void {
    COMBOS.onChange(this.onCombosChange.bind(this));
  }

  startCombo(id: ComboId): void {
    this.debug("startCombo()", id);
    this.sendServer(CustomGameEvent.ComboStart, { id });
  }

  finishCombo(id: ComboId): void {
    this.debug("finishCombo()", id);
    this.finishedCombos.set(id, true);
    this.markComboPanelAsFinished(id);
  }

  markComboPanelAsFinished(id: ComboId): void {
    this.getPickerCombo(id).sendInputs({ setFinished: undefined });
  }

  renderViewer(id: ComboId): void {
    this.sendClientSide(GameEvent.ViewerRender, { id });
  }

  allTags(): Set<string> {
    const tagset: Set<string> = new Set();

    if (this.combosView == null) {
      return tagset;
    }

    for (const combo of this.combosView) {
      for (const tag of combo.tagset) {
        tagset.add(tag);
      }
    }

    return tagset;
  }

  isClosed(): boolean {
    return this.elements.slideout.BHasClass(CssClass.DrawerClosed);
  }

  isFiltersPanelClosed(): boolean {
    return this.elements.slideout.BHasClass(CssClass.FiltersClosed);
  }

  getPickerCombo(id: ComboId): PickerCombo {
    const pickerCombo = this.pickerCombos.get(id);

    if (pickerCombo == null) {
      throw new Error(`Could not find PickerCombo for id ${id}`);
    }

    return pickerCombo;
  }

  resetPickerCombos(): void {
    this.pickerCombos.clear();
  }

  createComboPanel(parent: Panel, combo: Combo): void {
    const id = comboPanelId(combo);
    const component = this.create(LayoutId.PickerCombo, id, parent);

    const panel = component.panel;

    panel.AddClass(CssClass.ComboPanel);

    component.registerOutputs({
      onShowDetails: this.onComboDetailsShow.bind(this),
      onPlay: this.onComboPlay.bind(this),
    });

    component.sendInputs({ setCombo: combo });

    this.pickerCombos.set(combo.id, component);

    if (this.finishedCombos.get(combo.id)) {
      this.markComboPanelAsFinished(combo.id);
    }
  }

  createPropertyFilterOption<K extends keyof Properties>(
    parent: Panel,
    prop: K,
    value: Properties[K] | undefined,
  ): LabelPanel {
    const id = propertyFilterOptionId(prop, value);
    let text: string;

    if (value == null) {
      text = l10n.l(l10n.Key.PickerDefaultOption);
    } else {
      text = l10n.comboPropValue(prop, value);
    }

    const panel = createLabel(parent, id, text);

    setPropertyFilterAttr(panel, prop, value);

    return panel;
  }

  createTagsFilter(): void {
    this.tagSelect = this.create(
      LayoutId.UiTagSelect,
      PanelId.TagSelect,
      this.elements.filterTagsContainer,
    );

    this.tagSelect.registerOutputs({
      onChange: this.onFilterTagsChange.bind(this),
    });
  }

  resetTagsFilter() {
    this.tagSelect?.sendInputs({ clear: undefined });
  }

  enableFiltering() {
    this.filtering = true;
  }

  disableFiltering() {
    this.filtering = false;
  }

  filter(): boolean {
    if (this.combosView == null) {
      this.warn("Tried to filter combos without CombosView");
      return false;
    }

    const filters: Filters = {
      properties: this.propertyFilterValues(),
      tags: this.tagsFilterValue,
      item: this.itemFilterValue,
      ability: this.abilityFilterValue,
    };

    this.debug("filter()", filters);

    return this.combosView.filter(filters);
  }

  propertyFilter(prop: keyof Properties) {
    return this.elements[propertyFilterAttr(prop)];
  }

  propertyFilterValue<K extends keyof Properties>(prop: K): Properties[K] | undefined {
    const dropDown = this.propertyFilter(prop);
    const option = dropDown.GetSelected();

    if (option == null) {
      return undefined;
    }

    switch (prop) {
      case Property.Specialty:
        return parseEnumValue(Specialty, getPropertyFilterAttr(option, prop)) as
          | Properties[K]
          | undefined;
      case Property.Stance:
        return parseEnumValue(Stance, getPropertyFilterAttr(option, prop)) as
          | Properties[K]
          | undefined;
      case Property.DamageRating:
        return parseEnumValue(DamageRating, getPropertyFilterAttr(option, prop)) as
          | Properties[K]
          | undefined;
      case Property.DifficultyRating:
        return parseEnumValue(DifficultyRating, getPropertyFilterAttr(option, prop)) as
          | Properties[K]
          | undefined;
      default: {
        const _check: never = prop;
        throw new Error(`Invalid combo property ${_check}`);
      }
    }
  }

  propertyFilterValues(): Partial<Properties> {
    const setProp = <K extends Property>(
      props: Partial<Properties>,
      prop: K,
      value?: Properties[K],
    ): void => {
      if (value === undefined) {
        return;
      }

      props[prop] = value;
    };

    return Object.values(PROPERTIES).reduce(
      (props, pd) => {
        setProp(props, pd.name, this.propertyFilterValue(pd.name));
        return props;
      },
      {} as Partial<Properties>,
    );
  }

  get tagsFilterValue() {
    return this.filterTags;
  }

  get itemFilterValue(): string {
    return this.elements.filterItemImg.itemname;
  }

  get abilityFilterValue(): string {
    return this.elements.filterAbilityImage.abilityname;
  }

  // ----- Actions -----

  resetCombosAction(): Action {
    return new Sequence()
      .runFn(this.resetPickerCombos.bind(this))
      .removeChildren(this.elements.combos);
  }

  renderCombosSeq(): Sequence {
    return new Sequence().add(this.resetCombosAction()).add(this.createComboPanelsAction());
  }

  createComboPanelsAction(): Action {
    if (this.combosView == null) {
      return new NoopAction();
    }

    const actions = this.combosView.map((combo) =>
      this.elements.combos
        ? this.createComboPanelAction(this.elements.combos, combo)
        : new NoopAction(),
    );

    return new Sequence().add(...actions);
  }

  createComboPanelAction(parent: Panel, combo: Combo): Action {
    return new RunFunctionAction(this.createComboPanel.bind(this), parent, combo);
  }

  renderFiltersSeq(): ParallelSequence {
    return new ParallelSequence()
      .add(this.renderPropertyFiltersAction())
      .add(this.renderTagsFilterAction());
  }

  renderPropertyFiltersAction(): Action {
    const actions = Object.values(PROPERTIES).map((pd) => this.renderPropertyFilterAction(pd));

    return new ParallelSequence().add(...actions);
  }

  renderPropertyFilterAction<K extends keyof Properties>(pd: PropertyDescriptor<K>): Action {
    const dropDown = this.propertyFilter(pd.name);

    if (dropDown == null) {
      throw new Error("dropDown not found");
    }

    const actions = pd.values.map(
      (value) =>
        new AddOptionAction(dropDown, () =>
          this.createPropertyFilterOption(dropDown, pd.name, value),
        ),
    );

    return new Sequence()
      .removeAllOptions(dropDown)
      .addOption(dropDown, () => this.createPropertyFilterOption(dropDown, pd.name, undefined))
      .add(...actions);
  }

  resetPropertyFiltersAction(): Action {
    const actions = Object.values(PROPERTIES).map((pd) => this.resetPropertyFilterAction(pd.name));

    return new ParallelSequence().add(...actions);
  }

  resetPropertyFilterAction<K extends keyof Properties>(prop: K): Action {
    return new SelectOptionAction(
      this.propertyFilter(prop),
      propertyFilterOptionId(prop, undefined),
    );
  }

  renderTagsFilterAction(): Action {
    return new RunFunctionAction(this.createTagsFilter.bind(this));
  }

  resetTagsFilterAction(): Action {
    return new RunFunctionAction(this.resetTagsFilter.bind(this));
  }

  setItemFilterAction(name: string): Action {
    return new SetAttributeAction(this.elements.filterItemImg, "itemname", name);
  }

  resetItemFilterAction(): Action {
    return new ParallelSequence()
      .disable(this.elements.filterItemResetBtn)
      .add(this.setItemFilterAction(""));
  }

  setAbilityFilterAction(name: string): Action {
    return new SetAttributeAction(this.elements.filterAbilityImage, "abilityname", name);
  }

  resetAbilityFilterAction(): Action {
    return new ParallelSequence()
      .disable(this.elements.filterAbilityResetBtn)
      .add(this.setAbilityFilterAction(""));
  }

  // ----- Action runners -----

  renderCombos(): void {
    if (this.combosView == null) {
      this.warn("Tried to renderCombos() without CombosView");
      return;
    }

    const size = this.combosView.size;
    const seq = this.renderCombosSeq();

    this.debugFn(() => ["renderCombos()", { combos: size, actions: seq.deepSize() }]);

    seq.run();
  }

  renderFilters(): void {
    const seq = this.renderFiltersSeq();

    this.debugFn(() => ["renderFilters()", { actions: seq.deepSize() }]);

    seq.run();
  }

  open(): void {
    if (!this.isClosed()) {
      return;
    }

    const seq = new ParallelSequence()
      .playSoundEffect(SoundEvent.ShopOpen)
      .removeClass(this.elements.slideout, CssClass.DrawerClosed);

    this.debugFn(() => ["open()", { actions: seq.deepSize() }]);

    seq.run();
  }

  close(): void {
    if (this.isClosed()) {
      return;
    }

    const seq = new ParallelSequence()
      .playSoundEffect(SoundEvent.ShopClose)
      .addClass(this.elements.slideout, CssClass.DrawerClosed);

    this.debugFn(() => ["close()", { actions: seq.deepSize() }]);

    seq.run();
  }

  openFilters(): void {
    if (!this.isFiltersPanelClosed()) {
      return;
    }

    const seq = new ParallelSequence()
      .playSoundEffect(SoundEvent.UiRolloverUp)
      .removeClass(this.elements.slideout, CssClass.FiltersClosed);

    this.debugFn(() => ["openFilters()", { actions: seq.deepSize() }]);

    seq.run();
  }

  closeFilters(): void {
    if (this.isFiltersPanelClosed()) {
      return;
    }

    const seq = new ParallelSequence()
      .playSoundEffect(SoundEvent.UiRolloverDown)
      .addClass(this.elements.slideout, CssClass.FiltersClosed);

    this.debugFn(() => ["closeFilters()", { actions: seq.deepSize() }]);

    seq.run();
  }

  filterByTags(tags: Set<string>): void {
    this.filterTags = tags;

    const seq = new Sequence();

    if (this.filterTags.size === 0) {
      seq.disable(this.elements.filterTagsResetBtn);
    } else {
      seq.enable(this.elements.filterTagsResetBtn);
    }

    seq.runFn(this.onFilterSubmit.bind(this));

    this.debugFn(() => ["filterByTags()", { tags: this.filterTags, actions: seq.deepSize() }]);

    seq.run();
  }

  filterByItem(name: string): void {
    const seq = new Sequence()
      .add(this.setItemFilterAction(name))
      .enable(this.elements.filterItemResetBtn)
      .runFn(this.onFilterSubmit.bind(this));

    this.debugFn(() => ["filterByItem()", { item: name, actions: seq.deepSize() }]);

    seq.run();
  }

  filterByAbility(name: string): void {
    const seq = new Sequence()
      .add(this.setAbilityFilterAction(name))
      .enable(this.elements.filterAbilityResetBtn)
      .runFn(this.onFilterSubmit.bind(this));

    this.debugFn(() => ["filterByAbility()", { ability: name, actions: seq.deepSize() }]);

    seq.run();
  }

  resetFilters(): void {
    const seq = new Sequence()
      .runFn(this.disableFiltering.bind(this))
      .add(this.resetPropertyFiltersAction())
      .add(this.resetTagsFilterAction())
      .add(this.resetItemFilterAction())
      .add(this.resetAbilityFilterAction())
      .runFn(this.enableFiltering.bind(this))
      .runFn(this.onFilterSubmit.bind(this));

    this.debugFn(() => ["resetFilters()", { actions: seq.deepSize() }]);

    seq.run();
  }

  resetItemFilter(): void {
    const seq = new Sequence()
      .add(this.resetItemFilterAction())
      .runFn(this.onFilterSubmit.bind(this));

    this.debugFn(() => ["resetItemFilter()", { actions: seq.deepSize() }]);

    seq.run();
  }

  resetAbilityFilter(): void {
    const seq = new Sequence()
      .add(this.resetAbilityFilterAction())
      .runFn(this.onFilterSubmit.bind(this));

    this.debugFn(() => ["resetAbilityFilter()", { actions: seq.deepSize() }]);

    seq.run();
  }
}

const comboPanelId = (c: Combo) => `${COMBO_PANEL_ID_PREFIX}${c.id}`;

const propertyFilterAttr = <K extends keyof Properties>(k: K): `filter${Capitalize<K>}` =>
  camelCase(`filter_${k}`) as `filter${Capitalize<K>}`;

const propertyFilterOptionId = <K extends keyof Properties>(
  prop: K,
  value?: Properties[K],
): string => {
  const valueId = value == null ? PROPERTY_FILTER_OPTION_DEFAULT : value.toString();

  return pascalCase(`picker_filter_${prop}_${valueId}`);
};

const setPropertyFilterAttr = <K extends keyof Properties>(
  panel: Panel,
  prop: K,
  value?: Properties[K],
): void => {
  switch (prop) {
    case Property.Stance: {
      panel.SetAttributeString(
        PROPERTY_FILTER_ATTRIBUTE,
        (value == null ? PROPERTY_FILTER_NOT_SELECTED[Property.Stance] : value) as string,
      );
      break;
    }
    case Property.Specialty: {
      panel.SetAttributeString(
        PROPERTY_FILTER_ATTRIBUTE,
        (value == null ? PROPERTY_FILTER_NOT_SELECTED[Property.Specialty] : value) as string,
      );
      break;
    }
    case Property.DamageRating: {
      panel.SetAttributeInt(
        PROPERTY_FILTER_ATTRIBUTE,
        (value == null ? PROPERTY_FILTER_NOT_SELECTED[Property.DamageRating] : value) as number,
      );
      break;
    }
    case Property.DifficultyRating: {
      panel.SetAttributeInt(
        PROPERTY_FILTER_ATTRIBUTE,
        (value == null ? PROPERTY_FILTER_NOT_SELECTED[Property.DifficultyRating] : value) as number,
      );
      break;
    }
    default: {
      const _check: never = prop;
      throw new Error(`Invalid property ${_check}`);
    }
  }
};

const getPropertyFilterAttr = <K extends keyof Properties>(panel: Panel, prop: K) => {
  switch (prop) {
    case Property.Stance:
      return panel.GetAttributeString(
        PROPERTY_FILTER_ATTRIBUTE,
        PROPERTY_FILTER_NOT_SELECTED[Property.Stance],
      );
    case Property.Specialty:
      return panel.GetAttributeString(
        PROPERTY_FILTER_ATTRIBUTE,
        PROPERTY_FILTER_NOT_SELECTED[Property.Specialty],
      );
    case Property.DamageRating:
      return panel.GetAttributeInt(
        PROPERTY_FILTER_ATTRIBUTE,
        PROPERTY_FILTER_NOT_SELECTED[Property.DamageRating],
      );
    case Property.DifficultyRating:
      return panel.GetAttributeInt(
        PROPERTY_FILTER_ATTRIBUTE,
        PROPERTY_FILTER_NOT_SELECTED[Property.DifficultyRating],
      );
    default: {
      const _check: never = prop;
      throw new Error(`Invalid property ${_check}`);
    }
  }
};

(() => {
  const component = new Picker();

  component.open();
})();
