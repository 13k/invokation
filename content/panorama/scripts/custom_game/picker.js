"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  StringLexicalCompare = C.Util.StringLexicalCompare,
  EVENTS = C.EVENTS,
  COMBOS = C.COMBOS;

var PICKER_COLUMNS = ["laning_phase", "ganking_solo_pick", "teamfight", "late_game"];

var COMBO_PANEL_LAYOUT = "file://{resources}/layout/custom_game/picker_combo.xml";

function createCombosColumnPanel(parent, category) {
  var panel = $.CreatePanel("Panel", parent, "combos_column_" + category);

  panel.BLoadLayoutSnippet("CombosColumn");
  panel.AddClass(category);

  var panelTitle = panel.FindChildTraverse("Title");
  panelTitle.text = $.Localize("#invokation_combo_category_" + category);

  return panel;
}

var Picker = CreateComponent({
  constructor: function Picker() {
    Picker.super.call(this, $.GetContextPanel());

    this.bindElements();
    this.bindEvents();

    this.debug("init");
  },

  bindElements: function() {
    this.$slideout = $("#CombosSlideout");
    this.$combosContainer = $("#CombosContainer");
  },

  bindEvents: function() {
    COMBOS.OnChange(this.onCombosChange.bind(this));

    this.subscribe(EVENTS.COMBO_STARTED, this.onComboStarted);
    this.subscribe(EVENTS.COMBO_STOPPED, this.onComboStopped);
  },

  onCombosChange: function() {
    this.debug("onCombosChange()");
    this.groupCombos();
    this.renderCombos();
  },

  onComboDetailsShow: function(payload) {
    this.debug("onComboDetailsShow() ", payload);
    this.Close();
    this.renderViewer(payload.combo);
  },

  onComboPlay: function(payload) {
    this.debug("onComboPlay() ", payload);
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
    this.debug("startCombo() ", combo.id);
    this.sendServer(EVENTS.COMBO_START, { combo: combo.id });
  },

  groupCombos: function() {
    var self = this;
    this.groupedCombos = {};

    // group by category
    COMBOS.forEach(function(combo, _id) {
      if (!self.groupedCombos[combo.category]) {
        self.groupedCombos[combo.category] = [];
      }

      self.groupedCombos[combo.category].push(combo);
    });

    // sort each group by (heroLevel, id)
    $.Each(this.groupedCombos, function(group, _category) {
      group.sort(function(left, right) {
        if (left.heroLevel === right.heroLevel) {
          return StringLexicalCompare(left.id, right.id);
        }

        return left.heroLevel - right.heroLevel;
      });
    });
  },

  renderCombos: function() {
    this.debug("renderCombos()");

    var self = this;
    this.$combosContainer.RemoveAndDeleteChildren();

    $.Each(PICKER_COLUMNS, function(category) {
      var group = self.groupedCombos[category];

      if (!group) {
        return;
      }

      var columnPanel = createCombosColumnPanel(self.$combosContainer, category);

      $.Each(group, function(combo) {
        self.createComboPanel(columnPanel, combo);
      });
    });
  },

  createComboPanel: function(parent, combo) {
    var panel = $.CreatePanel("Panel", parent, combo.id);

    panel.BLoadLayout(COMBO_PANEL_LAYOUT, false, false);

    panel.component.Outputs({
      OnShowDetails: this.onComboDetailsShow.bind(this),
      OnPlay: this.onComboPlay.bind(this),
    });

    panel.component.Input("SetCombo", combo);

    return panel;
  },

  isClosed: function() {
    return this.$slideout.BHasClass("DrawerClosed");
  },

  Open: function() {
    if (!this.isClosed()) {
      return;
    }

    var seq = new RunParallelActions();

    seq.actions.push(new PlaySoundEffectAction("Shop.PanelUp"));
    seq.actions.push(new RemoveClassAction(this.$slideout, "DrawerClosed"));

    RunSingleAction(seq);
  },

  Close: function() {
    if (this.isClosed()) {
      return;
    }

    var seq = new RunParallelActions();

    seq.actions.push(new PlaySoundEffectAction("Shop.PanelDown"));
    seq.actions.push(new AddClassAction(this.$slideout, "DrawerClosed"));

    RunSingleAction(seq);
  },

  renderViewer: function(combo) {
    this.sendClientSide(EVENTS.VIEWER_RENDER, { combo: combo });
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

var picker = new Picker();

picker.Open();
