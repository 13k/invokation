"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _, CombosView, L10n, COMBOS } = global;
  const { EVENTS, COMBO_PROPERTIES, FREESTYLE_COMBO_ID, LAYOUTS } = global.Const;
  const {
    Sequence,
    ParallelSequence,
    RunFunctionAction,
    SetAttributeAction,
    AddOptionAction,
    SelectOptionAction,
  } = global.Sequence;

  const DYN_ELEMS = {
    COMBO_PANEL: {
      idPrefix: "combo",
      cssClass: "combo",
    },
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

  const comboPanelId = ({ id }) => `${DYN_ELEMS.COMBO_PANEL.idPrefix}-${id}`;
  const isNumericProperty = (property) => COMBO_PROPERTIES_TYPES[property] === "number";
  const propertyFilterAttr = (property) => _.camelCase(`filter_${property}`);
  const propertyFilterOptionId = (property, value) =>
    _.chain(`filter_${property}_${value}`).camelCase().upperFirst().value();

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

      this.popupItemPickerChannel = _.uniqueId("popup_item_picker_");
      this.popupAbilityPickerChannel = _.uniqueId("popup_ability_picker_");
      this.finishedCombos = {};

      this.enableFiltering();
      this.renderFilters();
      this.bindEvents();
      this.debug("init");
    }

    // ----- Event handlers -----

    onPickerToggle(payload) {
      this.debug("onPickerToggle()", payload);
      this.Toggle();
    }

    onCombosChange() {
      this.debug("onCombosChange()");
      this.combosView = new CombosView(COMBOS.Entries());
      this.$filterTags.component.Input("SetOptions", { options: this.comboTags() });
      this.renderCombos();
    }

    onComboSelect(payload) {
      this.debug("onComboSelect()", payload);
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

    // ----- Helpers -----

    bindEvents() {
      COMBOS.OnChange(this.handler("onCombosChange"));
    }

    selectCombo(id) {
      this.debug("selectCombo()", id);
      // this.close();
      this.playSound(SOUNDS.SELECT);
      this.renderViewer(id);
    }

    startCombo(id) {
      this.debug("startCombo()", id);
      this.sendServer(EVENTS.COMBO_START, { id });
    }

    finishCombo(id) {
      this.debug("finishCombo()", id);
      this.finishedCombos[id] = true;
      this.markComboPanelAsFinished(id);
    }

    markComboPanelAsFinished(id) {
      this.comboPanels[id].component.Input("SetFinished");
    }

    renderViewer(id) {
      this.sendClientSide(EVENTS.VIEWER_RENDER, { id });
    }

    comboTags() {
      return _.chain(this.combosView.Entries()).map("tags").flatten().uniq().sort().value();
    }

    isClosed() {
      return this.$ctx.BHasClass(CLASSES.CLOSED);
    }

    resetComboPanels() {
      this.comboPanels = {};
    }

    createComboPanel(parent, combo) {
      const { cssClass } = DYN_ELEMS.COMBO_PANEL;
      const id = comboPanelId(combo);
      const panel = this.createComponent(parent, id, LAYOUTS.PICKER.COMBO_PANEL, {
        classes: [cssClass],
        outputs: {
          OnShowDetails: "onComboSelect",
          OnPlay: "onComboPlay",
        },
      });

      panel.component.Input("SetCombo", combo);

      this.comboPanels[combo.id] = panel;

      if (this.finishedCombos[combo.id]) {
        this.markComboPanelAsFinished(combo.id);
      }

      return panel;
    }

    createPropertyFilterOption(parent, property, value) {
      const id = propertyFilterOptionId(property, value);
      const panel = $.CreatePanel("Label", parent, id);
      let text;

      if (value === PROPERTY_FILTER_OPTION_DEFAULT) {
        text = $.Localize(L10N_KEYS.PROPERTY_FILTER_OPTION_DEFAULT);
        value = "";
      } else {
        text = L10n.LocalizeComboPropertiesKey(property, String(value));
      }

      panel.text = text;
      panel.SetAttributeString("value", value);

      return panel;
    }

    createTagsFilter() {
      const { id } = DYN_ELEMS.TAG_SELECT;

      this.$filterTags = this.createComponent(
        this.$filterTagsContainer,
        id,
        LAYOUTS.UI.TAG_SELECT,
        {
          outputs: {
            OnChange: "onFilterTagsChange",
          },
        }
      );

      return this.$filterTags;
    }

    resetTagsFilter() {
      this.$filterTags.component.Input("Clear");
    }

    enableFiltering() {
      this.filtering = true;
    }

    disableFiltering() {
      this.filtering = false;
    }

    filter() {
      const propertyFilterValue = _.chain(this.propertyFilterValue)
        .bind(this)
        .unary()
        .rearg([1])
        .value();

      const filters = _.mapValues(COMBO_PROPERTIES, propertyFilterValue);

      filters.tags = this.tagsFilterValue();
      filters.item = this.itemFilterValue();
      filters.ability = this.abilityFilterValue();

      this.debug("filter()", filters);

      this.combosView.Filter(filters);
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

    resetCombosAction() {
      return new Sequence().RunFunction(() => this.resetComboPanels()).RemoveChildren(this.$combos);
    }

    renderCombosAction() {
      return new Sequence().Action(this.resetCombosAction()).Action(this.createComboPanelsAction());
    }

    createComboPanelsAction() {
      return new Sequence().Action(
        _.map(this.combosView.Entries(), (combo) =>
          this.createComboPanelAction(this.$combos, combo)
        )
      );
    }

    createComboPanelAction(parent, combo) {
      return new RunFunctionAction(() => this.createComboPanel(parent, combo));
    }

    renderFiltersAction() {
      return new ParallelSequence()
        .Action(this.renderPropertyFiltersAction())
        .Action(this.renderTagsFilterAction());
    }

    renderPropertyFiltersAction() {
      const renderPropertyFilterAction = _.chain(this.renderPropertyFilterAction)
        .bind(this)
        .ary(2)
        .rearg([1, 0])
        .value();

      return new ParallelSequence().Action(_.map(COMBO_PROPERTIES, renderPropertyFilterAction));
    }

    renderPropertyFilterAction(property, values) {
      values = _.concat([PROPERTY_FILTER_OPTION_DEFAULT], values);

      const dropDown = this.propertyFilter(property);
      const renderPropertyFilterOptionAction = _.chain(this.renderPropertyFilterOptionAction)
        .bind(this, property)
        .unary()
        .value();

      return new Sequence()
        .RemoveAllOptions(dropDown)
        .Action(_.map(values, renderPropertyFilterOptionAction));
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

      return new AddOptionAction(dropDown, createPropertyFilterOption);
    }

    resetPropertyFiltersAction() {
      const resetPropertyFilterAction = _.chain(this.resetPropertyFilterAction)
        .bind(this)
        .unary()
        .rearg([1])
        .value();

      return new ParallelSequence().Action(_.map(COMBO_PROPERTIES, resetPropertyFilterAction));
    }

    resetPropertyFilterAction(property) {
      return new SelectOptionAction(
        this.propertyFilter(property),
        propertyFilterOptionId(property, PROPERTY_FILTER_OPTION_DEFAULT)
      );
    }

    renderTagsFilterAction() {
      return new RunFunctionAction(() => this.createTagsFilter());
    }

    resetTagsFilterAction() {
      return new RunFunctionAction(() => this.resetTagsFilter());
    }

    setItemFilterAction(name) {
      return new SetAttributeAction(this.$filterItemImage, "itemname", name);
    }

    resetItemFilterAction() {
      return new ParallelSequence()
        .Disable(this.$filterItemResetButton)
        .Action(this.setItemFilterAction(""));
    }

    setAbilityFilterAction(name) {
      return new SetAttributeAction(this.$filterAbilityImage, "abilityname", name);
    }

    resetAbilityFilterAction() {
      return new ParallelSequence()
        .Disable(this.$filterAbilityResetButton)
        .Action(this.setAbilityFilterAction(""));
    }

    // ----- Action runners -----

    renderCombos() {
      const seq = this.renderCombosAction();

      this.debugFn(() => [
        "renderCombos()",
        { combos: this.combosView.Length(), actions: seq.size() },
      ]);

      return seq.Start();
    }

    renderFilters() {
      const seq = this.renderFiltersAction();

      this.debugFn(() => ["renderFilters()", { actions: seq.size() }]);

      return seq.Start();
    }

    open() {
      if (!this.isClosed()) {
        return;
      }

      const seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.OPEN)
        .RemoveClass(this.$ctx, CLASSES.CLOSED)
        .RunFunction(() => this.hideActionPanelUI());

      this.debugFn(() => ["open()", { actions: seq.size() }]);

      return seq.Start();
    }

    close() {
      if (this.isClosed()) {
        return;
      }

      const seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.CLOSE)
        .AddClass(this.$ctx, CLASSES.CLOSED)
        .RunFunction(() => this.showActionPanelUI());

      this.debugFn(() => ["close()", { actions: seq.size() }]);

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

      this.debugFn(() => ["filterByTags()", { tags: this.filterTags, actions: seq.size() }]);

      return seq.Start();
    }

    filterByItem(name) {
      const seq = new Sequence()
        .Action(this.setItemFilterAction(name))
        .Enable(this.$filterItemResetButton)
        .RunFunction(() => this.Filter());

      this.debugFn(() => ["filterByItem()", { item: name, actions: seq.size() }]);

      return seq.Start();
    }

    filterByAbility(name) {
      const seq = new Sequence()
        .Action(this.setAbilityFilterAction(name))
        .Enable(this.$filterAbilityResetButton)
        .RunFunction(() => this.Filter());

      this.debugFn(() => ["filterByAbility()", { ability: name, actions: seq.size() }]);

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

      this.debugFn(() => ["resetFilters()", { actions: seq.size() }]);

      return seq.Start();
    }

    resetItemFilter() {
      const seq = new Sequence()
        .Action(this.resetItemFilterAction())
        .RunFunction(() => this.Filter());

      this.debugFn(() => ["resetItemFilter()", { actions: seq.size() }]);

      return seq.Start();
    }

    resetAbilityFilter() {
      const seq = new Sequence()
        .Action(this.resetAbilityFilterAction())
        .RunFunction(() => this.Filter());

      this.debugFn(() => ["resetAbilityFilter()", { actions: seq.size() }]);

      return seq.Start();
    }

    // ----- UI methods -----

    Reload() {
      this.debug("Reload()");
      COMBOS.Reload();
    }

    Toggle() {
      if (this.isClosed()) {
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
      const { id } = DYN_ELEMS.ITEM_PICKER;

      return this.showPopup(this.$filterItemImage, id, LAYOUTS.POPUPS.ITEM_PICKER, {
        channel: this.popupItemPickerChannel,
      });
    }

    ShowAbilityFilter() {
      const { id } = DYN_ELEMS.ABILITY_PICKER;

      return this.showPopup(this.$filterAbilityImage, id, LAYOUTS.POPUPS.INVOKER_ABILITY_PICKER, {
        channel: this.popupAbilityPickerChannel,
      });
    }

    Filter() {
      if (!this.filtering) {
        return;
      }

      this.filter();

      return this.renderCombos();
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

  context.picker = new Picker();
  context.picker.open();
})(GameUI.CustomUIConfig(), this);
