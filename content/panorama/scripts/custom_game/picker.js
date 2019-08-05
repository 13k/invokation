"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var COMBOS = global.COMBOS;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var CreateComponent = context.CreateComponent;

  var PICKER_COLUMNS = ["laning_phase", "ganking_solo_pick", "teamfight", "late_game"];

  var COMBO_PANEL_LAYOUT = "file://{resources}/layout/custom_game/picker_combo.xml";

  var Picker = CreateComponent({
    constructor: function Picker() {
      Picker.super.call(this, {
        elements: {
          slideout: "CombosSlideout",
          combosContainer: "CombosContainer",
        },
        customEvents: {
          "!COMBO_STARTED": "onComboStarted",
          "!COMBO_STOPPED": "onComboStopped",
        },
      });

      this.bindEvents();
      this.debug("init");
    },

    bindEvents: function() {
      COMBOS.OnChange(this.onCombosChange.bind(this));
    },

    onCombosChange: function() {
      this.debug("onCombosChange()");
      this.groupCombos();
      this.renderCombos();
    },

    onComboDetailsShow: function(payload) {
      this.debug("onComboDetailsShow()", payload);
      this.Close();
      this.renderViewer(payload.combo);
    },

    onComboPlay: function(payload) {
      this.debug("onComboPlay()", payload);
      this.startCombo(payload.combo);
    },

    onComboStarted: function() {
      this.debug("onComboStarted()");
      this.Close();
    },

    onComboStopped: function() {
      this.debug("onComboStopped()");
      this.Open();
    },

    startCombo: function(combo) {
      this.debug("startCombo()", combo.id);
      this.sendServer(EVENTS.COMBO_START, { combo: combo.id });
    },

    groupCombos: function() {
      var sorter = _.chain(_.sortBy)
        .partial(_, ["heroLevel", "id"])
        .unary()
        .value();

      this.groupedCombos = _.chain(COMBOS.combos)
        .groupBy("category")
        .mapValues(sorter)
        .toPairs()
        .sortBy(function(pair) {
          return _.indexOf(PICKER_COLUMNS, pair[0]);
        })
        .value();
    },

    renderCombos: function() {
      this.debug("renderCombos()");

      return new Sequence()
        .Action(this.resetCombosAction())
        .Action(this.createComboPanelsAction())
        .Start();
    },

    resetCombos: function() {
      this.comboColumns = {};
    },

    resetCombosAction: function() {
      return new Sequence()
        .RemoveChildren(this.$combosContainer)
        .RunFunction(this, this.resetCombos);
    },

    createComboPanelsAction: function() {
      var actions = _.map(
        this.groupedCombos,
        _.bind(this.createCombosColumnAction, this, this.$combosContainer)
      );

      return new Sequence().Action(actions);
    },

    createCombosColumn: function(parent, category) {
      var id = "combos_column_" + category;
      var panel = CreatePanelWithLayoutSnippet(parent, id, "CombosColumn");
      panel.AddClass(category);

      var panelTitle = panel.FindChildTraverse("Title");
      panelTitle.text = $.Localize("#invokation_combo_category_" + category);

      this.comboColumns[category] = panel;

      return panel;
    },

    createCombosColumnAction: function(parent, pair) {
      var category = pair[0];
      var combos = pair[1];
      var actions = _.map(combos, _.bind(this.createComboPanelAction, this, category));

      return new Sequence()
        .RunFunction(this, this.createCombosColumn, parent, category)
        .Action(actions);
    },

    createComboPanel: function(category, combo) {
      var parent = this.comboColumns[category];
      var panel = CreatePanelWithLayout(parent, combo.id, COMBO_PANEL_LAYOUT);

      panel.component.Outputs({
        OnShowDetails: this.onComboDetailsShow.bind(this),
        OnPlay: this.onComboPlay.bind(this),
      });

      panel.component.Input("SetCombo", combo);

      return panel;
    },

    createComboPanelAction: function(category, combo) {
      return new RunFunctionAction(this, this.createComboPanel, category, combo);
    },

    renderViewer: function(combo) {
      this.sendClientSide(EVENTS.VIEWER_RENDER, { combo: combo });
    },

    isClosed: function() {
      return this.$slideout.BHasClass("DrawerClosed");
    },

    Open: function() {
      if (!this.isClosed()) {
        return;
      }

      return new ParallelSequence()
        .PlaySoundEffect("Shop.PanelUp")
        .RemoveClass(this.$slideout, "DrawerClosed")
        .Start();
    },

    Close: function() {
      if (this.isClosed()) {
        return;
      }

      return new ParallelSequence()
        .PlaySoundEffect("Shop.PanelDown")
        .AddClass(this.$slideout, "DrawerClosed")
        .Start();
    },

    Toggle: function() {
      if (this.isClosed()) {
        this.Open();
      } else {
        this.Close();
      }
    },

    Reload: function() {
      this.debug("Reload()");
      COMBOS.Reload();
    },
  });

  context.picker = new Picker();
  context.picker.Open();
})(GameUI.CustomUIConfig(), this);
