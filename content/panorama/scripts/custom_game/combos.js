"use strict";

var PICKER_COLUMNS = ["laning_phase", "ganking_solo_pick", "teamfight", "late_game"];

var COMBO_PANEL_LAYOUT = "file://{resources}/layout/custom_game/combos_combo.xml";

var _groupedCombos;

var _slideout;
var _combosContainer;

function onCombosChange() {
  L("onCombosChange()");
  groupCombos();
  renderCombos();
}

function onPickerShow() {
  L("onPickerShow()");
  showPicker();
}

function onComboDetailsShow(combo) {
  L("onComboDetailsShow()");
  hidePicker();
  renderDetails(combo);
}

function onComboPlay(combo) {
  L("onComboPlay()");
  startCombo(combo);
}

function onComboStarted() {
  L("onComboStarted()");
  hidePicker();
}

function onComboStopped() {
  L("onComboStopped()");
  showPicker();
}

function renderDetails(combo) {
  // CustomEvents.SendServer(EVENT_COMBO_DETAILS_RENDER, { name: combo.name });
  // FIXME: this should send only to the local player
  CustomEvents.SendAll(EVENT_COMBO_DETAILS_RENDER, combo);
}

function startCombo(combo) {
  L("startCombo() ", combo.name);
  CustomEvents.SendServer(EVENT_COMBO_START, { name: combo.name });
}

function beginCombo(comboName) {
  var combo = CombosCollection.Get(comboName);
  L("beginCombo() ", comboName, " ", combo);
  SetContextData("_combo", combo);
}

function endCombo() {
  var combo = GetContextData("_combo");
  L("endCombo() ", combo.name);
}

function groupCombos() {
  _groupedCombos = {};

  // group by category
  $.Each(CombosCollection.combos, function(combo, _name) {
    if (!_groupedCombos[combo.category]) {
      _groupedCombos[combo.category] = [];
    }

    _groupedCombos[combo.category].push(combo);
  });

  // sort each group by (hero_level, name)
  $.Each(_groupedCombos, function(group, _category) {
    group.sort(function(left, right) {
      if (left.hero_level === right.hero_level) {
        return StringLexicalCompare(left.name, right.name);
      }

      return left.hero_level - right.hero_level;
    });
  });
}

function renderCombos() {
  L("renderCombos()");

  _combosContainer.RemoveAndDeleteChildren();

  $.Each(PICKER_COLUMNS, function(category) {
    var group = _groupedCombos[category];

    if (!group) { return; }

    var columnPanel = createCombosColumnPanel(category);

    $.Each(group, function(combo) {
      createComboPanel(columnPanel, combo);
    });
  });
}

function createCombosColumnPanel(category) {
  var panel = $.CreatePanel("Panel", _combosContainer, "combos_column_" + category);

  panel.BLoadLayoutSnippet("CombosColumn");
  panel.AddClass(category);

  var panelTitle = panel.FindChildTraverse("Title");
  panelTitle.text = $.Localize("#invokation_combo_category_" + category);

  return panel;
}

function createComboPanel(parent, combo) {
  var panel = $.CreatePanel("Panel", parent, combo.name);

  panel.BLoadLayout(COMBO_PANEL_LAYOUT, false, false);
  panel.data.Callbacks.Update({ onShowDetails: onComboDetailsShow, onPlay: onComboPlay });
  panel.data.SetCombo(combo);

  return panel;
}

function showPicker() {
  $.DispatchEvent("PlaySoundEffect", "Shop.PanelUp");
  _slideout.RemoveClass("DrawerClosed");
}

function hidePicker() {
  $.DispatchEvent("PlaySoundEffect", "Shop.PanelDown");
  _slideout.AddClass("DrawerClosed");
}

function TogglePicker() {
  if (_slideout.BHasClass("DrawerClosed")) {
    showPicker();
  } else {
    hidePicker();
  }
}

function Refresh() {
  L("Refresh()");
  CombosCollection.Reload();
}

(function() {
  _slideout = $("#CombosSlideout");
  _combosContainer = $("#CombosContainer");

  CombosCollection.OnChange(onCombosChange);
  CombosCollection.Load();

  CustomEvents.Subscribe(EVENT_PICKER_SHOW, onPickerShow);
  CustomEvents.Subscribe(EVENT_COMBO_STARTED, onComboStarted);
  CustomEvents.Subscribe(EVENT_COMBO_STOPPED, onComboStopped);

  L("init");
})();