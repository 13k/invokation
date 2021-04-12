// const { Component } = context;
// const { lodash: _, CombosView, L10n, COMBOS } = global;
// const { COMPONENTS, EVENTS, COMBO_PROPERTIES, FREESTYLE_COMBO_ID } = global.Const;
// const { Sequence, ParallelSequence } = global.Sequence;

import { Component } from "./lib/component";

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
  PROPERTY_FILTER_OPTION_DEFAULT: "invokation_picker_filter_option_all",
};

const COMBO_PROPERTIES_TYPES = _.mapValues(COMBO_PROPERTIES, (values) => typeof values[0]);
const PROPERTY_FILTER_OPTION_DEFAULT = "all";

const isNumericProperty = (property) => COMBO_PROPERTIES_TYPES[property] === "number";
const propertyFilterAttr = (property) => _.camelCase(`filter_${property}`);
const propertyFilterOptionId = (property, value) => `filter-${property}-${value}`;

class Picker extends Component {
  constructor() {
    super({
      elements: {
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
      },
      customEvents: {
        "!PICKER_TOGGLE": "onPickerToggle",
        "!COMBO_STARTED": "onComboStarted",
        "!COMBO_STOPPED": "onComboStopped",
        "!COMBO_FINISHED": "onComboFinished",
        "!POPUP_ITEM_PICKER_SUBMIT": "onPopupItemPickerSubmit",
        "!POPUP_ABILITY_PICKER_SUBMIT": "onPopupAbilityPickerSubmit",
      },
    });

    this._combos = new CombosView();
    this.popupItemPickerChannel = _.uniqueId("popup_item_picker_");
    this.popupAbilityPickerChannel = _.uniqueId("popup_ability_picker_");

    this.enableFiltering();
    this.renderCombos();
    this.renderFilters();
    this.bindEvents();
  }

  // ----- Handlers -----

  onPickerToggle(payload) {
    this.debug("onPickerToggle()", payload);
    this.Toggle();
  }

  onCombosChange() {
    this.debug("onCombosChange()");
    this.combos = COMBOS.Entries();
  }

  onComboSelected(payload) {
    this.debug("onComboSelected()", payload);
    this.selectCombo(payload.id);
  }

  onComboPlay(payload) {
    this.debug("onComboPlay()", payload);
    this.startCombo(payload.id);
  }

  onComboStarted() {
    this.debug("onComboStarted()");
    this.close();
  }

  onComboStopped() {
    this.debug("onComboStopped()");
    this.open();
  }

  onComboFinished(payload) {
    if (payload.id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboFinished()", payload);
    this.finishCombo(payload.id);
  }

  onFilterTagsChange(payload) {
    this.debug("onFilterTagsChange()", payload);
    this.filterByTags(payload.tags);
  }

  onPopupItemPickerSubmit(payload) {
    const { channel, item } = payload;

    if (channel !== this.popupItemPickerChannel) {
      return;
    }

    this.debug("onPopupItemPickerSubmit()", payload);

    if (!_.isEmpty(item)) {
      this.filterByItem(item);
    }
  }

  onPopupAbilityPickerSubmit(payload) {
    const { channel, ability } = payload;

    if (channel !== this.popupAbilityPickerChannel) {
      return;
    }

    this.debug("onPopupAbilityPickerSubmit()", payload);

    if (!_.isEmpty(ability)) {
      this.filterByAbility(ability);
    }
  }

  // ----- Properties -----

  get isClosed() {
    return this.$ctx.BHasClass(CLASSES.CLOSED);
  }

  get combos() {
    return this._combos;
  }

  set combos(combos) {
    this._combos = new CombosView(combos);

    this.updateTagsFilter();
    this.updateCombos();
  }

  get comboTags() {
    return _.chain(this.combos.entries).map("tags").flatten().uniq().sort().value();
  }

  // ----- Helpers -----

  bindEvents() {
    COMBOS.OnChange(this.handler("onCombosChange"));
  }

  createCombos() {
    const { layout, outputs } = COMPONENTS.PICKER.COMBOS;

    return this.loadComponent(this.$combos, layout, {
      outputs: {
        [outputs.ON_SELECT]: "onComboSelected",
      },
    });
  }

  updateCombos() {
    const { inputs } = COMPONENTS.PICKER.COMBOS;

    this.$combos.component.Input(inputs.SET_COMBOS, { combos: this.combos });
  }

  startCombo(id) {
    this.debug("startCombo()", { id });
    this.sendServer(EVENTS.COMBO_START, { id });
  }

  finishCombo(id) {
    this.debug("finishCombo()", { id });

    const { inputs } = COMPONENTS.PICKER.COMBOS;

    this.$combos.Input(inputs.SET_FINISHED, { id });
  }

  createPropertyFilterOption(parent, property, value) {
    const id = propertyFilterOptionId(property, value);
    let text;

    if (value === PROPERTY_FILTER_OPTION_DEFAULT) {
      text = $.Localize(L10N_KEYS.PROPERTY_FILTER_OPTION_DEFAULT);
      value = "";
    } else {
      text = L10n.LocalizeComboPropertiesKey(property, String(value));
    }

    return this.createLabel(parent, id, text, {
      attrs: { value },
    });
  }

  createTagsFilter() {
    const { layout, outputs } = COMPONENTS.UI.TAG_SELECT;
    const { id } = DYN_ELEMS.TAG_SELECT;

    this.$filterTags = this.createComponent(this.$filterTagsContainer, id, layout, {
      outputs: {
        [outputs.ON_CHANGE]: "onFilterTagsChange",
      },
    });

    return this.$filterTags;
  }

  updateTagsFilter() {
    const { inputs } = COMPONENTS.UI.TAG_SELECT;

    this.$filterTags.component.Input(inputs.SET_OPTIONS, { options: this.comboTags });
  }

  resetTagsFilter() {
    const { inputs } = COMPONENTS.UI.TAG_SELECT;

    this.$filterTags.component.Input(inputs.CLEAR);
  }

  enableFiltering() {
    this.filtering = true;
  }

  disableFiltering() {
    this.filtering = false;
  }

  filter() {
    const filters = _.mapValues(COMBO_PROPERTIES, (_, prop) => this.propertyFilterValue(prop));

    filters.tags = this.tagsFilterValue();
    filters.item = this.itemFilterValue();
    filters.ability = this.abilityFilterValue();

    this.debug("filter()", filters);

    this.combos.filter(filters);
  }

  propertyFilter(property) {
    return this.element(propertyFilterAttr(property));
  }

  propertyFilterValue(property) {
    let value = _.chain(this)
      .invoke("propertyFilter", property)
      .invoke("GetSelected")
      .invoke("GetAttributeString", "value", "")
      .value();

    if (!_.isEmpty(value) && isNumericProperty(property)) {
      value = parseInt(value);
    }

    return value;
  }

  tagsFilterValue() {
    return this.filterTags;
  }

  itemFilterValue() {
    return this.$filterItemImage.itemname;
  }

  abilityFilterValue() {
    return this.$filterAbilityImage.abilityname;
  }

  // ----- Actions -----

  renderCombosAction() {
    return new Sequence().RunFunction(() => this.createCombos());
  }

  renderFiltersAction() {
    return new ParallelSequence()
      .Action(this.renderPropertyFiltersAction())
      .Action(this.renderTagsFilterAction());
  }

  renderPropertyFiltersAction() {
    const actions = _.map(COMBO_PROPERTIES, (values, prop) =>
      this.renderPropertyFilterAction(prop, values)
    );

    return new ParallelSequence().Action(actions);
  }

  renderPropertyFilterAction(property, values) {
    values = _.concat([PROPERTY_FILTER_OPTION_DEFAULT], values);

    const dropDown = this.propertyFilter(property);
    const actions = values.map((value) => this.renderPropertyFilterOptionAction(property, value));

    return new Sequence().RemoveAllOptions(dropDown).Action(actions);
  }

  renderPropertyFilterOptionAction(property, value) {
    const dropDown = this.propertyFilter(property);
    const createPropertyFilterOption = _.bind(
      this.createPropertyFilterOption,
      this,
      dropDown,
      property,
      value
    );

    return new Sequence().AddOption(dropDown, createPropertyFilterOption);
  }

  resetPropertyFiltersAction() {
    const actions = _.map(COMBO_PROPERTIES, (_, prop) => this.resetPropertyFilterAction(prop));

    return new ParallelSequence().Action(actions);
  }

  resetPropertyFilterAction(property) {
    return new Sequence().SelectOption(
      this.propertyFilter(property),
      propertyFilterOptionId(property, PROPERTY_FILTER_OPTION_DEFAULT)
    );
  }

  renderTagsFilterAction() {
    return new Sequence().RunFunction(() => this.createTagsFilter());
  }

  resetTagsFilterAction() {
    return new Sequence().RunFunction(() => this.resetTagsFilter());
  }

  setItemFilterAction(name) {
    return new Sequence().SetItemImage(this.$filterItemImage, { name });
  }

  resetItemFilterAction() {
    return new ParallelSequence()
      .Disable(this.$filterItemResetButton)
      .Action(this.setItemFilterAction(""));
  }

  setAbilityFilterAction(name) {
    return new Sequence().SetAbilityImage(this.$filterAbilityImage, { name });
  }

  resetAbilityFilterAction() {
    return new ParallelSequence()
      .Disable(this.$filterAbilityResetButton)
      .Action(this.setAbilityFilterAction(""));
  }

  renderViewerAction() {
    // TODO: actually render viewer inside content panel
    // return new Sequence().RunFunction(() =>
    //   this.sendClientSide(EVENTS.VIEWER_RENDER, { id: this.selectedCombo })
    // );
    return new Sequence();
  }

  // ----- Action runners -----

  renderCombos() {
    const seq = new Sequence().Action(this.renderCombosAction());

    this.debugFn(() => ["renderCombos()", { combos: this.combos.all.length, actions: seq.length }]);

    return seq.Start();
  }

  renderFilters() {
    const seq = new Sequence().Action(this.renderFiltersAction());

    this.debugFn(() => ["renderFilters()", { actions: seq.length }]);

    return seq.Start();
  }

  open() {
    if (!this.isClosed) {
      return;
    }

    const seq = new ParallelSequence()
      .PlaySoundEffect(SOUNDS.OPEN)
      .RemoveClass(this.$ctx, CLASSES.CLOSED)
      .RunFunction(() => this.hideActionPanelUI());

    this.debugFn(() => ["open()", { actions: seq.length }]);

    return seq.Start();
  }

  close() {
    if (this.isClosed) {
      return;
    }

    const seq = new ParallelSequence()
      .PlaySoundEffect(SOUNDS.CLOSE)
      .AddClass(this.$ctx, CLASSES.CLOSED)
      .RunFunction(() => this.showActionPanelUI());

    this.debugFn(() => ["close()", { actions: seq.length }]);

    return seq.Start();
  }

  selectCombo(id) {
    const seq = new Sequence().Action(this.renderViewerAction()).PlaySoundEffect(SOUNDS.SELECT);

    this.debugFn(() => ["selectCombo()", { id, actions: seq.length }]);

    return seq.Start();
  }

  filterByTags(tags) {
    this.filterTags = tags;
    const seq = new Sequence();

    if (_.isEmpty(this.filterTags)) {
      seq.Disable(this.$filterTagsResetButton);
    } else {
      seq.Enable(this.$filterTagsResetButton);
    }

    seq.RunFunction(() => this.Filter());

    this.debugFn(() => ["filterByTags()", { tags: this.filterTags, actions: seq.length }]);

    return seq.Start();
  }

  filterByItem(name) {
    const seq = new Sequence()
      .Action(this.setItemFilterAction(name))
      .Enable(this.$filterItemResetButton)
      .RunFunction(() => this.Filter());

    this.debugFn(() => ["filterByItem()", { item: name, actions: seq.length }]);

    return seq.Start();
  }

  filterByAbility(name) {
    const seq = new Sequence()
      .Action(this.setAbilityFilterAction(name))
      .Enable(this.$filterAbilityResetButton)
      .RunFunction(() => this.Filter());

    this.debugFn(() => ["filterByAbility()", { ability: name, actions: seq.length }]);

    return seq.Start();
  }

  resetFilters() {
    const seq = new Sequence()
      .RunFunction(() => this.disableFiltering())
      .Action(this.resetPropertyFiltersAction())
      .Action(this.resetTagsFilterAction())
      .Action(this.resetItemFilterAction())
      .Action(this.resetAbilityFilterAction())
      .RunFunction(() => this.enableFiltering())
      .RunFunction(() => this.Filter());

    this.debugFn(() => ["resetFilters()", { actions: seq.length }]);

    return seq.Start();
  }

  resetItemFilter() {
    const seq = new Sequence()
      .Action(this.resetItemFilterAction())
      .RunFunction(() => this.Filter());

    this.debugFn(() => ["resetItemFilter()", { actions: seq.length }]);

    return seq.Start();
  }

  resetAbilityFilter() {
    const seq = new Sequence()
      .Action(this.resetAbilityFilterAction())
      .RunFunction(() => this.Filter());

    this.debugFn(() => ["resetAbilityFilter()", { actions: seq.length }]);

    return seq.Start();
  }

  // ----- UI methods -----

  Reload() {
    this.debug("Reload()");
    COMBOS.Reload();
  }

  Toggle() {
    if (this.isClosed) {
      this.open();
    } else {
      this.close();
    }
  }

  Freestyle() {
    this.debug("Freestyle()");
    this.startCombo(FREESTYLE_COMBO_ID);
  }

  ShowItemFilter() {
    const { layout } = COMPONENTS.POPUPS.ITEM_PICKER;
    const { id } = DYN_ELEMS.ITEM_PICKER;

    return this.showPopup(this.$filterItemImage, id, layout, {
      channel: this.popupItemPickerChannel,
    });
  }

  ShowAbilityFilter() {
    const { layout } = COMPONENTS.POPUPS.INVOKER_ABILITY_PICKER;
    const { id } = DYN_ELEMS.ABILITY_PICKER;

    return this.showPopup(this.$filterAbilityImage, id, layout, {
      channel: this.popupAbilityPickerChannel,
    });
  }

  Filter() {
    if (!this.filtering) {
      return;
    }

    this.filter();
  }

  ResetFilters() {
    return this.resetFilters();
  }

  ResetTagsFilter() {
    return this.resetTagsFilter();
  }

  ResetItemFilter() {
    return this.resetItemFilter();
  }

  ResetAbilityFilter() {
    return this.resetAbilityFilter();
  }
}

//   context.picker = new Picker();

//   new Sequence()
//     .Wait(START_OPEN_DELAY)
//     .RunFunction(() => context.picker.open())
//     .Start();
// })(GameUI.CustomUIConfig(), this);
