"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var FREESTYLE_COMBO_ID = global.Const.FREESTYLE_COMBO_ID;
  var COMBOS = global.COMBOS;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreatePanelWithLayoutSnippet = global.Util.CreatePanelWithLayoutSnippet;
  var CreateComponent = context.CreateComponent;

  var COMBO_PANEL_LAYOUT = "file://{resources}/layout/custom_game/picker_combo.xml";
  var COMBOS_COLUMN_SNIPPET = "CombosColumn";
  var COMBOS_COLUMN_TITLE_ID = "PickerCombosColumnTitle";
  var COMBOS_COLUMN_CONTAINER_ID = "PickerCombosColumnContainer";

  var PICKER_COLUMNS = ["laning_phase", "ganking_solo_pick", "teamfight", "late_game"];

  var Picker = CreateComponent({
    constructor: function Picker() {
      Picker.super.call(this, {
        elements: {
          slideout: "PickerSlideout",
          combosContainer: "PickerCombosContainer",
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

    // ----- Helpers -----

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
      return this.$slideout.BHasClass("DrawerClosed");
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

    // ----- Actions -----

    renderCombosAction: function() {
      return new Sequence().Action(this.resetCombosAction()).Action(this.createComboPanelsAction());
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

    // ----- Action runners -----

    render: function() {
      this.groupCombos();

      var seq = this.renderCombosAction();

      this.debugFn(function() {
        return ["render()", { combos: COMBOS.combos.length, actions: seq.size() }];
      });

      return seq.Start();
    },

    open: function() {
      if (!this.isClosed()) {
        return;
      }

      var seq = new ParallelSequence()
        .PlaySoundEffect("Shop.PanelUp")
        .RemoveClass(this.$slideout, "DrawerClosed");

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
        .PlaySoundEffect("Shop.PanelDown")
        .AddClass(this.$slideout, "DrawerClosed");

      this.debugFn(function() {
        return ["close()", { actions: seq.size() }];
      });

      return seq.Start();
    },

    // ----- UI methods -----

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

    Reload: function() {
      this.debug("Reload()");
      COMBOS.Reload();
    },
  });

  context.picker = new Picker();
  context.picker.open();
})(GameUI.CustomUIConfig(), this);
