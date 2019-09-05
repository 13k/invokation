"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var FREESTYLE_COMBO_ID = global.Const.FREESTYLE_COMBO_ID;
  var COMBOS = global.COMBOS;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var SetAttributeAction = global.Sequence.SetAttributeAction;
  var SelectOptionAction = global.Sequence.SelectOptionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var CreateComponent = context.CreateComponent;

  var COMBO_PANEL_LAYOUT = "file://{resources}/layout/custom_game/picker_combo.xml";

  var POPUP_ITEM_PICKER_LAYOUT =
    "file://{resources}/layout/custom_game/popups/popup_item_picker.xml";

  var POPUP_INVOKER_ABILITY_PICKER_LAYOUT =
    "file://{resources}/layout/custom_game/popups/popup_invoker_ability_picker.xml";

  var COMBOS_COLUMN_SNIPPET = "CombosColumn";
  var COMBOS_COLUMN_TITLE_ID = "PickerCombosColumnTitle";
  var COMBOS_COLUMN_CONTAINER_ID = "PickerCombosColumnContainer";

  var PICKER_CATEGORIES = ["laning_phase", "ganking_solo_pick", "teamfight", "late_game"];

  var DRAWER_CLOSED_CLASS = "DrawerClosed";
  var FILTERS_CLOSED_CLASS = "FiltersClosed";

  var SOUNDS = {
    OPEN: "Shop.PanelUp",
    CLOSE: "Shop.PanelDown",
    FILTERS_OPEN: "ui_rollover_md_up",
    FILTERS_CLOSE: "ui_rollover_md_down",
  };

  var FILTERS = {
    category: {
      PickerFilterCategoryAll: null,
      PickerFilterCategoryLaningPhase: "laning_phase",
      PickerFilterCategoryGankingSoloPick: "ganking_solo_pick",
      PickerFilterCategoryTeamfight: "teamfight",
      PickerFilterCategoryLateGame: "late_game",
    },
    specialty: {
      PickerFilterSpecialtyAll: null,
      PickerFilterSpecialtyQuasWex: "qw",
      PickerFilterSpecialtyQuasExort: "qe",
    },
    stance: {
      PickerFilterStanceAll: null,
      PickerFilterStanceDefensive: "defensive",
      PickerFilterStanceOffensive: "offensive",
    },
    damageRating: {
      PickerFilterDamageRatingAll: null,
      PickerFilterDamageRating0: "0",
      PickerFilterDamageRating1: "1",
      PickerFilterDamageRating2: "2",
      PickerFilterDamageRating3: "3",
      PickerFilterDamageRating4: "4",
      PickerFilterDamageRating5: "5",
    },
    difficultyRating: {
      PickerFilterDifficultyRatingAll: null,
      PickerFilterDifficultyRating1: "1",
      PickerFilterDifficultyRating2: "2",
      PickerFilterDifficultyRating3: "3",
      PickerFilterDifficultyRating4: "4",
      PickerFilterDifficultyRating5: "5",
    },
  };

  function filterCombos(combos, filters) {
    var combosSeq = _.chain(combos);

    _.each(filters, function(value, property) {
      if (property === "item" || property === "ability" || value == null || value === "") {
        return;
      }

      combosSeq = combosSeq.filter(_.matchesProperty(property, value));
    });

    if (!_.isEmpty(filters.item)) {
      combosSeq = combosSeq.filter(function(combo) {
        return _.includes(combo.items, filters.item);
      });
    }

    if (!_.isEmpty(filters.ability)) {
      combosSeq = combosSeq.filter(function(combo) {
        return _.find(combo.sequence, ["name", filters.ability]);
      });
    }

    return combosSeq.value();
  }

  function filterPropertyElementID(property, value) {
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
          filterCategory: "PickerFilterCategory",
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
          "!POPUP_ITEM_PICKER_SUBMIT": "onPopupItemPickerSubmit",
          "!POPUP_ABILITY_PICKER_SUBMIT": "onPopupAbilityPickerSubmit",
        },
      });

      this.popupItemPickerChannel = _.uniqueId("popup_item_picker_");
      this.popupAbilityPickerChannel = _.uniqueId("popup_ability_picker_");

      this.enableFiltering();
      this.bindEvents();
      this.debug("init");
    },

    // ----- Event handlers -----

    onCombosChange: function() {
      this.debug("onCombosChange()");
      this.combos = COMBOS.combos;
      this.render();
    },

    onComboDetailsShow: function(payload) {
      this.debug("onComboDetailsShow()", payload);
      this.close();
      this.renderViewer(payload.combo);
    },

    onComboPlay: function(payload) {
      this.debug("onComboPlay()", payload);
      this.startCombo(payload.combo);
    },

    onComboStarted: function() {
      this.debug("onComboStarted()");
      this.close();
    },

    onComboStopped: function() {
      this.debug("onComboStopped()");
      this.open();
    },

    onPopupItemPickerSubmit: function(payload) {
      if (payload.channel !== this.popupItemPickerChannel) {
        return;
      }

      this.debug("onPopupItemPickerSubmit()", payload);

      if (!_.isEmpty(payload.item)) {
        this.filterByItem(payload.item);
      }
    },

    onPopupAbilityPickerSubmit: function(payload) {
      if (payload.channel !== this.popupAbilityPickerChannel) {
        return;
      }

      this.debug("onPopupAbilityPickerSubmit()", payload);

      if (!_.isEmpty(payload.ability)) {
        this.filterByAbility(payload.ability);
      }
    },

    // ----- Helpers -----

    bindEvents: function() {
      COMBOS.OnChange(this.onCombosChange.bind(this));
    },

    groupCombos: function() {
      var sorter = _.chain(_.sortBy)
        .partial(_, ["heroLevel", "id"])
        .unary()
        .value();

      this.groupedCombos = _.chain(this.combos)
        .groupBy("category")
        .mapValues(sorter)
        .toPairs()
        .sortBy(function(pair) {
          return _.indexOf(PICKER_CATEGORIES, pair[0]);
        })
        .value();
    },

    resetCombos: function() {
      this.comboColumns = {};
    },

    startCombo: function(combo) {
      this.debug("startCombo()", combo.id);
      this.sendServer(EVENTS.COMBO_START, { combo: combo.id });
    },

    renderViewer: function(combo) {
      this.sendClientSide(EVENTS.VIEWER_RENDER, { combo: combo });
    },

    isClosed: function() {
      return this.$slideout.BHasClass(DRAWER_CLOSED_CLASS);
    },

    isFiltersPanelClosed: function() {
      return this.$slideout.BHasClass(FILTERS_CLOSED_CLASS);
    },

    createCombosColumn: function(parent, category) {
      var id = "combos_column_" + category;
      var panel = CreatePanelWithLayoutSnippet(parent, id, COMBOS_COLUMN_SNIPPET);
      var panelTitle = panel.FindChildTraverse(COMBOS_COLUMN_TITLE_ID);

      panel.AddClass(category);
      panelTitle.text = $.Localize("#invokation_combo_category_" + category);
      this.comboColumns[category] = panel;

      return panel;
    },

    createComboPanel: function(category, combo) {
      var columnPanel = this.comboColumns[category];
      var parent = columnPanel.FindChildTraverse(COMBOS_COLUMN_CONTAINER_ID);
      var panel = CreatePanelWithLayout(parent, combo.id, COMBO_PANEL_LAYOUT);

      panel.component.Outputs({
        OnShowDetails: this.handler("onComboDetailsShow"),
        OnPlay: this.handler("onComboPlay"),
      });

      panel.component.Input("SetCombo", combo);

      return panel;
    },

    filter: function() {
      var transformFilters = function(filters, _, property) {
        filters[property] = this.propertyFilterValue(property);
      }.bind(this);

      var filters = _.transform(FILTERS, transformFilters);

      if (filters.damageRating != null) {
        filters.damageRating = parseInt(filters.damageRating);
      }

      if (filters.difficultyRating != null) {
        filters.difficultyRating = parseInt(filters.difficultyRating);
      }

      filters.item = this.getItemFilter();
      filters.ability = this.getAbilityFilter();

      this.debug("filter()", filters);
      this.combos = filterCombos(COMBOS.combos, filters);
    },

    propertyFilterValue: function(property) {
      var dropDown = this.element(_.camelCase("filter_" + property));
      return _.get(FILTERS, [property, dropDown.GetSelected().id]);
    },

    getItemFilter: function() {
      return this.$filterItemImage.itemname;
    },

    getAbilityFilter: function() {
      return this.$filterAbilityImage.abilityname;
    },

    // ----- Actions -----

    renderCombosAction: function() {
      return new Sequence().Action(this.resetCombosAction()).Action(this.createComboPanelsAction());
    },

    resetCombosAction: function() {
      return new Sequence().RemoveChildren(this.$combos).RunFunction(this, this.resetCombos);
    },

    createComboPanelsAction: function() {
      var actions = _.map(
        this.groupedCombos,
        _.bind(this.createCombosColumnAction, this, this.$combos)
      );

      return new Sequence().Action(actions);
    },

    createCombosColumnAction: function(parent, pair) {
      var category = pair[0];
      var combos = pair[1];
      var actions = _.map(combos, _.bind(this.createComboPanelAction, this, category));

      return new Sequence()
        .RunFunction(this, this.createCombosColumn, parent, category)
        .Action(actions);
    },

    createComboPanelAction: function(category, combo) {
      return new RunFunctionAction(this, this.createComboPanel, category, combo);
    },

    enableFiltering: function() {
      this.filtering = true;
    },

    disableFiltering: function() {
      this.filtering = false;
    },

    resetPropertyFilterAction: function(property) {
      var defaultId = filterPropertyElementID(property, "all");
      var dropDown = this.element(_.camelCase("filter_" + property));
      return new SelectOptionAction(dropDown, defaultId);
    },

    resetPropertyFiltersAction: function() {
      var resetPropertyFilterAction = _.chain(this.resetPropertyFilterAction)
        .bind(this)
        .rearg([1, 0])
        .ary(2)
        .value();

      var actions = _.map(FILTERS, resetPropertyFilterAction);

      return new ParallelSequence().Action(actions);
    },

    setItemFilterAction: function(name) {
      return new SetAttributeAction(this.$filterItemImage, "itemname", name);
    },

    resetItemFilterAction: function() {
      return new ParallelSequence()
        .Disable(this.$filterItemResetButton)
        .Action(this.setItemFilterAction(""));
    },

    setAbilityFilterAction: function(name) {
      return new SetAttributeAction(this.$filterAbilityImage, "abilityname", name);
    },

    resetAbilityFilterAction: function() {
      return new ParallelSequence()
        .Disable(this.$filterAbilityResetButton)
        .Action(this.setAbilityFilterAction(""));
    },

    // ----- Action runners -----

    render: function() {
      this.groupCombos();

      var seq = this.renderCombosAction();

      this.debugFn(function() {
        return ["render()", { combos: this.combos.length, actions: seq.size() }];
      });

      return seq.Start();
    },

    open: function() {
      if (!this.isClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.OPEN)
        .RemoveClass(this.$slideout, DRAWER_CLOSED_CLASS);

      this.debugFn(function() {
        return ["open()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    close: function() {
      if (this.isClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.CLOSE)
        .AddClass(this.$slideout, DRAWER_CLOSED_CLASS);

      this.debugFn(function() {
        return ["close()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    openFilters: function() {
      if (!this.isFiltersPanelClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.FILTERS_OPEN)
        .RemoveClass(this.$slideout, FILTERS_CLOSED_CLASS);

      this.debugFn(function() {
        return ["openFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    closeFilters: function() {
      if (this.isFiltersPanelClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect(SOUNDS.FILTERS_CLOSE)
        .AddClass(this.$slideout, FILTERS_CLOSED_CLASS);

      this.debugFn(function() {
        return ["closeFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    filterByItem: function(name) {
      var seq = new Sequence()
        .Action(this.setItemFilterAction(name))
        .Enable(this.$filterItemResetButton)
        .RunFunction(this, this.Filter);

      this.debugFn(function() {
        return ["filterByItem()", { item: name, actions: seq.size() }];
      });

      return seq.Start();
    },

    filterByAbility: function(name) {
      var seq = new Sequence()
        .Action(this.setAbilityFilterAction(name))
        .Enable(this.$filterAbilityResetButton)
        .RunFunction(this, this.Filter);

      this.debugFn(function() {
        return ["filterByAbility()", { ability: name, actions: seq.size() }];
      });

      return seq.Start();
    },

    resetFilters: function() {
      var seq = new Sequence()
        .RunFunction(this, this.disableFiltering)
        .Action(this.resetPropertyFiltersAction())
        .Action(this.resetItemFilterAction())
        .Action(this.resetAbilityFilterAction())
        .RunFunction(this, this.enableFiltering)
        .RunFunction(this, this.Filter);

      this.debugFn(function() {
        return ["resetFilters()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    resetItemFilter: function() {
      var seq = new Sequence().Action(this.resetItemFilterAction()).RunFunction(this, this.Filter);

      this.debugFn(function() {
        return ["resetItemFilter()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    resetAbilityFilter: function() {
      var seq = new Sequence()
        .Action(this.resetAbilityFilterAction())
        .RunFunction(this, this.Filter);

      this.debugFn(function() {
        return ["resetAbilityFilter()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    // ----- UI methods -----

    Reload: function() {
      this.debug("Reload()");
      COMBOS.Reload();
    },

    Toggle: function() {
      if (this.isClosed()) {
        this.open();
      } else {
        this.close();
      }
    },

    Freestyle: function() {
      this.debug("Freestyle()");
      this.startCombo({ id: FREESTYLE_COMBO_ID });
    },

    ToggleFilters: function() {
      if (this.isFiltersPanelClosed()) {
        this.openFilters();
      } else {
        this.closeFilters();
      }
    },

    Filter: function() {
      if (!this.filtering) {
        return;
      }

      this.filter();
      return this.render();
    },

    ResetFilters: function() {
      return this.resetFilters();
    },

    ShowItemFilter: function() {
      return this.showPopup(
        this.$filterItemImage,
        "PickerPopupItemPicker",
        POPUP_ITEM_PICKER_LAYOUT,
        { channel: this.popupItemPickerChannel }
      );
    },

    ResetItemFilter: function() {
      return this.resetItemFilter();
    },

    ShowAbilityFilter: function() {
      return this.showPopup(
        this.$filterAbilityImage,
        "PickerPopupInvokerAbilityPicker",
        POPUP_INVOKER_ABILITY_PICKER_LAYOUT,
        { channel: this.popupAbilityPickerChannel }
      );
    },

    ResetAbilityFilter: function() {
      return this.resetAbilityFilter();
    },
  });

  context.picker = new Picker();
  context.picker.open();
})(GameUI.CustomUIConfig(), this);
