"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  StringLexicalCompare = C.Util.StringLexicalCompare,
  EVENTS = C.EVENTS,
  COMBOS = C.COMBOS;

var PICKER_COLUMNS = [
  "laning_phase",
  "ganking_solo_pick",
  "teamfight",
  "late_game",
];

var COMBO_PANEL_LAYOUT =
  "file://{resources}/layout/custom_game/picker_combo.xml";

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

    this.log("init");
  },

  bindElements: function() {
    this.$slideout = $("#CombosSlideout");
    this.$combosContainer = $("#CombosContainer");
  },

  bindEvents: function() {
    COMBOS.OnChange(this.onCombosChange.bind(this));

    this.subscribe(EVENTS.PICKER_SHOW, this.onPickerShow);
    this.subscribe(EVENTS.COMBO_STARTED, this.onComboStarted);
    this.subscribe(EVENTS.COMBO_STOPPED, this.onComboStopped);
  },

  onCombosChange: function() {
    this.log("onCombosChange()");
    this.groupCombos();
    this.renderCombos();
  },

  onPickerShow: function() {
    this.log("onPickerShow()");
    this.showPicker();
  },

  onComboDetailsShow: function(payload) {
    this.log("onComboDetailsShow() ", payload);
    this.hidePicker();
    this.renderViewer(payload.combo);
  },

  onComboPlay: function(payload) {
    this.log("onComboPlay() ", payload);
    this.startCombo(payload.combo);
  },

  onComboStarted: function() {
    this.log("onComboStarted()");
    this.hidePicker();
  },

  onComboStopped: function() {
    this.log("onComboStopped()");
    this.showPicker();
  },

  startCombo: function(combo) {
    this.log("startCombo() ", combo.id);
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
    this.log("renderCombos()");

    var self = this;
    this.$combosContainer.RemoveAndDeleteChildren();

    $.Each(PICKER_COLUMNS, function(category) {
      var group = self.groupedCombos[category];

      if (!group) {
        return;
      }

      var columnPanel = createCombosColumnPanel(
        self.$combosContainer,
        category
      );

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

  showPicker: function() {
    $.DispatchEvent("PlaySoundEffect", "Shop.PanelUp");
    this.$slideout.RemoveClass("DrawerClosed");
  },

  hidePicker: function() {
    $.DispatchEvent("PlaySoundEffect", "Shop.PanelDown");
    this.$slideout.AddClass("DrawerClosed");
  },

  renderViewer: function(combo) {
    // this.sendServer(EVENTS.VIEWER_RENDER, { combo: combo.id });
    // FIXME: this should send only to the local player
    this.sendAll(EVENTS.VIEWER_RENDER, { combo: combo });
  },

  Toggle: function() {
    if (this.$slideout.BHasClass("DrawerClosed")) {
      this.showPicker();
    } else {
      this.hidePicker();
    }
  },

  Reload: function() {
    this.log("Reload()");
    COMBOS.Reload();
  },
});

var picker = new Picker();
