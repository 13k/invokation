"use strict";

var ORB_ABILITIES = {
  invoker_quas: true,
  invoker_wex: true,
  invoker_exort: true,
};

var _grid = new Grid(15);
var _capturing;

var _combatLog;
var _filterOrbs;
var _contents;
var _row;

function onClear() {
  L("onClear()");
  clear();
}

function onGridRowChange(idx) {
  L("onGridRowChange() ", idx);
  addRow(idx);
}

function onAbilityUsed(payload) {
  L("onAbilityUsed() ", payload);

  if (!_capturing) {
    return;
  }

  if (isFilteringOrbs() && isOrbAbility(payload.ability)) {
    return;
  }

  addColumn(payload.ability);
}

function onComboStarted() {
  L("onComboStarted()");
  start();
}

function onComboStopped() {
  L("onComboStopped()");
  stop();
}

function addRow(idx) {
  _row = createRow(_contents, idx);
  scrollToBottom();
}

function addColumn(abilityName) {
  _grid.Add(abilityName);
  createAbilityIcon(_row, abilityName);
  scrollToBottom();
}

function createRow(parent, idx) {
  var panel = $.CreatePanel("Panel", parent, "row_" + idx);
  panel.BLoadLayoutSnippet("CombatLogRow");
  return panel;
}

function createAbilityIcon(parent, abilityName) {
  var snippetName;
  var imageProperty;

  if (abilityName.match(/^item_/)) {
    snippetName = "CombatLogItem";
    imageProperty = "itemname";
  } else {
    snippetName = "CombatLogAbility";
    imageProperty = "abilityname";
  }

  var panel = $.CreatePanel("Panel", parent, "ability_" + abilityName);
  panel.BLoadLayoutSnippet(snippetName);

  var image = panel.FindChildTraverse("Image");
  image[imageProperty] = abilityName;

  return panel;
}

function clear() {
  _row = null;
  _grid.Clear();
  _contents.RemoveAndDeleteChildren();
}

function scrollToBottom() {
  _contents.ScrollToBottom();
}

function startCapturing() {
  _capturing = true;
  CustomEvents.SendServer(EVENT_COMBAT_LOG_CAPTURE_START);
}

function stopCapturing() {
  _capturing = false;
  CustomEvents.SendServer(EVENT_COMBAT_LOG_CAPTURE_STOP);
}

function showCombatLog() {
  _combatLog.RemoveClass("Closed");
}

function hideCombatLog() {
  _combatLog.AddClass("Closed");
}

function isFilteringOrbs() {
  return _filterOrbs.checked;
}

function isOrbAbility(abilityName) {
  return abilityName in ORB_ABILITIES;
}

function start() {
  L("start()");
  clear();
  startCapturing();
  showCombatLog();
}

function stop() {
  L("stop()");
  clear();
  stopCapturing();
  hideCombatLog();
}

function ToggleCombatLog() {
  if (_capturing) {
    stop();
  } else {
    start();
  }
}

function Clear() {
  return clear();
}

(function() {
  _combatLog = $("#CombatLog");
  _contents = $("#CombatLogContents");
  _filterOrbs = $("#FilterOrbs");
  _filterOrbs.checked = true;

  _grid.OnRowChange(onGridRowChange);

  stop();

  CustomEvents.Subscribe(EVENT_COMBAT_LOG_ABILITY_USED, onAbilityUsed);
  CustomEvents.Subscribe(EVENT_COMBAT_LOG_CLEAR, onClear);
  CustomEvents.Subscribe(EVENT_COMBO_STARTED, onComboStarted);
  CustomEvents.Subscribe(EVENT_COMBO_STOPPED, onComboStopped);

  L("init");
})();
