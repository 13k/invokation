"use strict";

(function (global, context) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var CombosView = global.CombosView;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var SetAttributeAction = global.Sequence.SetAttributeAction;
  var AddOptionAction = global.Sequence.AddOptionAction;
  var SelectOptionAction = global.Sequence.SelectOptionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var COMBOS = global.COMBOS;
  var EVENTS = global.Const.EVENTS;
  var COMBO_PROPERTIES = global.Const.COMBO_PROPERTIES;
  var FREESTYLE_COMBO_ID = global.Const.FREESTYLE_COMBO_ID;

  var CLASSES = {
    COMBO_PANEL: "PickerCombo",
    DRAWER_CLOSED: "DrawerClosed",
    FILTERS_CLOSED: "FiltersClosed",
  };

  var COMBO_PANEL_ID_PREFIX = "PickerCombo";
  var COMBO_PANEL_LAYOUT = "file://{resources}/layout/custom_game/picker_combo.xml";

  var TAG_SELECT_ID = "PickerFilterTags";
  var TAG_SELECT_LAYOUT = "file://{resources}/layout/custom_game/ui/tag_select.xml";

  var POPUP_ITEM_PICKER_ID = "PickerPopupItemPicker";
  var POPUP_ITEM_PICKER_LAYOUT = "file://{resources}/layout/custom_game/popups/popup_item_picker.xml";

  var POPUP_INVOKER_ABILITY_PICKER_ID = "PickerPopupInvokerAbilityPicker";
  var POPUP_INVOKER_ABILITY_PICKER_LAYOUT =
    "file://{resources}/layout/custom_game/popups/popup_invoker_ability_picker.xml";

  var L10N_KEYS = {
    PROPERTY_FILTER_OPTION_DEFAULT: "invokation_picker_filter_option_all",
  };

  var COMBO_PROPERTIES_TYPES = _.mapValues(COMBO_PROPERTIES, function (values) {
    return typeof values[0];
  });

  var SOUNDS = {
    OPEN: "Shop.PanelUp",
    CLOSE: "Shop.PanelDown",
    FILTERS_OPEN: "ui_rollover_md_up",
    FILTERS_CLOSE: "ui_rollover_md_down",
  };

  var PROPERTY_FILTER_OPTION_DEFAULT = "all";

  function comboPanelId(combo) {
    return COMBO_PANEL_ID_PREFIX + String(combo.id);
  }

  function isNumericProperty(property) {
    return COMBO_PROPERTIES_TYPES[property] === "number";
  }

  function propertyFilterAttr(property) {
    return _.camelCase("filter_" + property);
  }

  function propertyFilterOptionId(property, value) {
    return _.chain("picker_filter_" + property + "_" + String(value))
      .camelCase()
      .upperFirst()
      .value();
  }

  var Picker = CreateComponent({
    constructor: function Picker() {
      Picker.super.call(this, {
        elements: {
          slideout: "PickerSlideout",
          combos: "PickerCombos",
          filterTagsContainer: "PickerFilterTagsContainer",
          filterTagsResetButton: "PickerFilterTagsResetButton",
          filterSpecialty: "PickerFilterSpecialty",
          filterStance: "PickerFilterStance",
          filterDamageRating: "PickerFilterDamageRating",
          filterDifficultyRating: "PickerFilterDifficultyRating",
          filterItemImage: "PickerFilterItemImage",
          filterItemResetButton: "PickerFilterItemResetButton",
          filterAbilityImage: "PickerFilterAbilityImage",
          filterAbilityResetButton: "PickerFilterAbilityResetButton",
        },
        customEvents: {
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
    },

    // ----- Event handlers -----

    onCombosChange: function () {
      this.debug("onCombosChange()");
      this.combosView = new CombosView(COMBOS.Entries());
      this.$filterTags.component.Input("SetOptions", { options: this.comboTags() });
      this.renderCombos();
    },

    onComboDetailsShow: function (payload) {
      this.debug("onComboDetailsShow()", payload);
      this.close();
      this.renderViewer(payload.id);
    },

    onComboPlay: function (payload) {
      this.debug("onComboPlay()", payload);
      this.startCombo(payload.id);
    },

    onComboStarted: function () {
      this.debug("onComboStarted()");
      this.close();
    },

    onComboStopped: function () {
      this.debug("onComboStopped()");
      this.open();
    },

    onComboFinished: function (payload) {
      if (payload.id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboFinished()", payload);
      this.finishCombo(payload.id);
    },

    onFilterTagsChange: function (payload) {
      this.debug("onFilterTagsChange()", payload);
      this.filterByTags(payload.tags);
    },

    onPopupItemPickerSubmit: function (payload) {
      if (payload.channel !== this.popupItemPickerChannel) {
        return;
      }

      this.debug("onPopupItemPickerSubmit()", payload);

      if (!_.isEmpty(payload.item)) {
        this.filterByItem(payload.item);
      }
    },

    onPopupAbilityPickerSubmit: function (payload) {
      if (payload.channel !== this.popupAbilityPickerChannel) {
        return;
      }

      this.debug("onPopupAbilityPickerSubmit()", payload);

      if (!_.isEmpty(payload.ability)) {
        this.filterByAbility(payload.ability);
      }
    },

    // ----- Helpers -----

    bindEvents: function () {
      COMBOS.OnChange(this.handler("onCombosChange"));
    },

    startCombo: function (id) {
      this.debug("startCombo()", id);
      this.sendServer(EVENTS.COMBO_START, { id: id });
    },

    finishCombo: function (id) {
      this.debug("finishCombo()", id);
      this.finishedCombos[id] = true;
      this.markComboPanelAsFinished(id);
    },

    markComboPanelAsFinished: function (id) {
      this.comboPanels[id].component.Input("SetFinished");
    },

    renderViewer: function (id) {
      this.sendClientSide(EVENTS.VIEWER_RENDER, { id: id });
    },

    comboTags: function () {
      return _.chain(this.combosView.Entries()).map("tags").flatten().uniq().sort().value();
    },

    isClosed: function () {
      return this.$slideout.BHasClass(CLASSES.DRAWER_CLOSED);
    },

    isFiltersPanelClosed: function () {
      return this.$slideout.BHasClass(CLASSES.FILTERS_CLOSED);
    },

    resetComboPanels: function () {
      this.comboPanels = {};
    },

    createComboPanel: function (parent, combo) {
      var id = comboPanelId(combo);
      var panel = CreatePanelWithLayout(parent, id, COMBO_PANEL_LAYOUT);

      panel.AddClass(CLASSES.COMBO_PANEL);

      panel.component.Outputs({
        OnShowDetails: this.handler("onComboDetailsShow"),
        OnPlay: this.handler("onComboPlay"),
      });

      panel.component.Input("SetCombo", combo);

      this.comboPanels[combo.id] = panel;

      if (this.finishedCombos[combo.id]) {
        this.markComboPanelAsFinished(combo.id);
      }

      return panel;
    },

    createPropertyFilterOption: function (parent, property, value) {
      var id = propertyFilterOptionId(property, value);
      var panel = $.CreatePanel("Label", parent, id);
      var text;

      if (value === PROPERTY_FILTER_OPTION_DEFAULT) {
        text = $.Localize(L10N_KEYS.PROPERTY_FILTER_OPTION_DEFAULT);
        value = "";
      } else {
        text = L10n.LocalizeComboPropertiesKey(property, value);
      }

      panel.text = text;
      panel.SetAttributeString("value", value);

      return panel;
    },

    createTagsFilter: function () {
      this.$filterTags = CreatePanelWithLayout(this.$filterTagsContainer, TAG_SELECT_ID, TAG_SELECT_LAYOUT);

      this.$filterTags.component.Outputs({
        OnChange: this.handler("onFilterTagsChange"),
      });

      return this.$filterTags;
    },

    resetTagsFilter: function () {
      this.$filterTags.component.Input("Clear");
    },

    enableFiltering: function () {
      this.filtering = true;
    },

    disableFiltering: function () {
      this.filtering = false;
    },

    filter: function () {
      var propertyFilterValue = _.chain(this.propertyFilterValue).bind(this).unary().rearg([1]).value();

      var filters = _.mapValues(COMBO_PROPERTIES, propertyFilterValue);

      filters.tags = this.tagsFilterValue();
      filters.item = this.itemFilterValue();
      filters.ability = this.abilityFilterValue();

      this.debug("filter()", filters);
      this.combosView.Filter(filters);
    },

    propertyFilter: function (property) {
      return this.element(propertyFilterAttr(property));
    },

    propertyFilterValue: function (property) {
      var value = _.chain(this)
        .invoke("propertyFilter", property)
        .invoke("GetSelected")
        .invoke("GetAttributeString", "value", "")
        .value();

      if (!_.isEmpty(value) && isNumericProperty(property)) {
        value = parseInt(value);
      }

      return value;
    },

    tagsFilterValue: function () {
      return this.filterTags;
    },

    itemFilterValue: function () {
      return this.$filterItemImage.itemname;
    },

    abilityFilterValue: function () {
      return this.$filterAbilityImage.abilityname;
    },

    // ----- Actions -----

    resetCombosAction: function () {
      return new Sequence().RunFunction(this, this.resetComboPanels).RemoveChildren(this.$combos);
    },

    renderCombosAction: function () {
      return new Sequence().Action(this.resetCombosAction()).Action(this.createComboPanelsAction());
    },

    createComboPanelsAction: function () {
      var createComboPanelAction = _.bind(this.createComboPanelAction, this, this.$combos);
      return new Sequence().Action(_.map(this.combosView.Entries(), createComboPanelAction));
    },

    createComboPanelAction: function (parent, combo) {
      return new RunFunctionAction(this, this.createComboPanel, parent, combo);
    },

    renderFiltersAction: function () {
      return new ParallelSequence().Action(this.renderPropertyFiltersAction()).Action(this.renderTagsFilterAction());
    },

    renderPropertyFiltersAction: function () {
      var renderPropertyFilterAction = _.chain(this.renderPropertyFilterAction).bind(this).ary(2).rearg([1, 0]).value();

      return new ParallelSequence().Action(_.map(COMBO_PROPERTIES, renderPropertyFilterAction));
    },

    renderPropertyFilterAction: function (property, values) {
      values = _.concat([PROPERTY_FILTER_OPTION_DEFAULT], values);

      var dropDown = this.propertyFilter(property);
      var renderPropertyFilterOptionAction = _.chain(this.renderPropertyFilterOptionAction)
        .bind(this, property)
        .unary()
        .value();

      return new Sequence().RemoveAllOptions(dropDown).Action(_.map(values, renderPropertyFilterOptionAction));
    },

    renderPropertyFilterOptionAction: function (property, value) {
      var dropDown = this.propertyFilter(property);
      var createPropertyFilterOption = _.bind(this.createPropertyFilterOption, this, dropDown, property, value);

      return new AddOptionAction(dropDown, createPropertyFilterOption);
    },

    resetPropertyFiltersAction: function () {
      var resetPropertyFilterAction = _.chain(this.resetPropertyFilterAction).bind(this).unary().rearg([1]).value();

      return new ParallelSequence().Action(_.map(COMBO_PROPERTIES, resetPropertyFilterAction));
    },

    resetPropertyFilterAction: function (property) {
      return new SelectOptionAction(
        this.propertyFilter(property),
        propertyFilterOptionId(property, PROPERTY_FILTER_OPTION_DEFAULT)
      );
    },

    renderTagsFilterAction: function () {
      return new RunFunctionAction(this, this.createTagsFilter);
    },

    resetTagsFilterAction: function () {
      return new RunFunctionAction(this, this.resetTagsFilter);
    },

    setItemFilterAction: function (name) {
      return new SetAttributeAction(this.$filterItemImage, "itemname", name);
    },

    resetItemFilterAction: function () {
      return new ParallelSequence().Disable(this.$filterItemResetButton).Action(this.setItemFilterAction(""));
    },

    setAbilityFilterAction: function (name) {
      return new SetAttributeAction(this.$filterAbilityImage, "abilityname", name);
    },

    resetAbilityFilterAction: function () {
      return new ParallelSequence().Disable(this.$filterAbilityResetButton).Action(this.setAbilityFilterAction(""));
    },

    // ----- Action runners -----

    renderCombos: function () {
      var seq = this.renderCombosAction();

      this.debugFn(function () {
        return ["renderCombos()", { combos: this.combosView.Length(), actions: seq.size() }];
      });

      return seq.Start();
    },

    renderFilters: function () {
      var seq = this.renderFiltersAction();

      this.debugFn(function () {
        return ["renderFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    open: function () {
      if (!this.isClosed()) {
        return;
      }

      var seq = new ParallelSequence().PlaySoundEffect(SOUNDS.OPEN).RemoveClass(this.$slideout, CLASSES.DRAWER_CLOSED);

      this.debugFn(function () {
        return ["open()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    close: function () {
      if (this.isClosed()) {
        return;
      }

      var seq = new ParallelSequence().PlaySoundEffect(SOUNDS.CLOSE).AddClass(this.$slideout, CLASSES.DRAWER_CLOSED);

      this.debugFn(function () {
        return ["close()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    openFilters: function () {
      if (!this.isFiltersPanelClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.FILTERS_OPEN)
        .RemoveClass(this.$slideout, CLASSES.FILTERS_CLOSED);

      this.debugFn(function () {
        return ["openFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    closeFilters: function () {
      if (this.isFiltersPanelClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.FILTERS_CLOSE)
        .AddClass(this.$slideout, CLASSES.FILTERS_CLOSED);

      this.debugFn(function () {
        return ["closeFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    filterByTags: function (tags) {
      this.filterTags = tags;
      var seq = new Sequence();

      if (_.isEmpty(this.filterTags)) {
        seq.Disable(this.$filterTagsResetButton);
      } else {
        seq.Enable(this.$filterTagsResetButton);
      }

      seq.RunFunction(this, this.Filter);

      this.debugFn(function () {
        return ["filterByTags()", { tags: this.filterTags, actions: seq.size() }];
      });

      return seq.Start();
    },

    filterByItem: function (name) {
      var seq = new Sequence()
        .Action(this.setItemFilterAction(name))
        .Enable(this.$filterItemResetButton)
        .RunFunction(this, this.Filter);

      this.debugFn(function () {
        return ["filterByItem()", { item: name, actions: seq.size() }];
      });

      return seq.Start();
    },

    filterByAbility: function (name) {
      var seq = new Sequence()
        .Action(this.setAbilityFilterAction(name))
        .Enable(this.$filterAbilityResetButton)
        .RunFunction(this, this.Filter);

      this.debugFn(function () {
        return ["filterByAbility()", { ability: name, actions: seq.size() }];
      });

      return seq.Start();
    },

    resetFilters: function () {
      var seq = new Sequence()
        .RunFunction(this, this.disableFiltering)
        .Action(this.resetPropertyFiltersAction())
        .Action(this.resetTagsFilterAction())
        .Action(this.resetItemFilterAction())
        .Action(this.resetAbilityFilterAction())
        .RunFunction(this, this.enableFiltering)
        .RunFunction(this, this.Filter);

      this.debugFn(function () {
        return ["resetFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    resetItemFilter: function () {
      var seq = new Sequence().Action(this.resetItemFilterAction()).RunFunction(this, this.Filter);

      this.debugFn(function () {
        return ["resetItemFilter()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    resetAbilityFilter: function () {
      var seq = new Sequence().Action(this.resetAbilityFilterAction()).RunFunction(this, this.Filter);

      this.debugFn(function () {
        return ["resetAbilityFilter()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    // ----- UI methods -----

    Reload: function () {
      this.debug("Reload()");
      COMBOS.Reload();
    },

    Toggle: function () {
      if (this.isClosed()) {
        this.open();
      } else {
        this.close();
      }
    },

    Freestyle: function () {
      this.debug("Freestyle()");
      this.startCombo(FREESTYLE_COMBO_ID);
    },

    ToggleFilters: function () {
      if (this.isFiltersPanelClosed()) {
        this.openFilters();
      } else {
        this.closeFilters();
      }
    },

    Filter: function () {
      if (!this.filtering) {
        return;
      }

      this.filter();
      return this.renderCombos();
    },

    ResetFilters: function () {
      return this.resetFilters();
    },

    ResetTagsFilter: function () {
      return this.resetTagsFilter();
    },

    ShowItemFilter: function () {
      return this.showPopup(this.$filterItemImage, POPUP_ITEM_PICKER_ID, POPUP_ITEM_PICKER_LAYOUT, {
        channel: this.popupItemPickerChannel,
      });
    },

    ResetItemFilter: function () {
      return this.resetItemFilter();
    },

    ShowAbilityFilter: function () {
      return this.showPopup(
        this.$filterAbilityImage,
        POPUP_INVOKER_ABILITY_PICKER_ID,
        POPUP_INVOKER_ABILITY_PICKER_LAYOUT,
        { channel: this.popupAbilityPickerChannel }
      );
    },

    ResetAbilityFilter: function () {
      return this.resetAbilityFilter();
    },
  });

  context.picker = new Picker();
  context.picker.open();
})(GameUI.CustomUIConfig(), this);
