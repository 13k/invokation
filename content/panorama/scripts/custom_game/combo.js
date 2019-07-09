"use strict";

var COMBO_STEP_LAYOUT =
  "file://{resources}/layout/custom_game/combo_combo_step.xml";

var START_DELAY = 0.5;
var BOINK_DELAY = 0.2;

var _combo;
var _sequenceContainer;
var _stepsPanels = {};
var _activeSteps = [];

function onComboStarted(payload) {
  L("onComboStarted() - ", payload);
  start(payload);
}

function onComboStopped(payload) {
  L("onComboStopped() - ", payload);
  stop();
}

function onComboProgress(payload) {
  L("onComboProgress() - ", payload);

  var nextSteps = LuaListTableToArray(payload.next);

  L("onComboProgress() - next: ", nextSteps);

  clearFailedStepPanels();
  deactivateStepPanels();
  activateStepPanels(nextSteps);
}

function onComboStepError(payload) {
  L("onComboStepError() - ", payload);

  var expectedSteps = LuaListTableToArray(payload.expected);

  L("onComboStepError() - expected: ", expectedSteps);

  failStepPanels(expectedSteps);
}

function onComboFinished(payload) {
  L("onComboFinished() - ", payload);

  deactivateStepPanels();
}

function renderSequence() {
  var combo = GetContextData("_combo");

  _stepsPanels = {};
  _sequenceContainer.RemoveAndDeleteChildren();

  $.Each(combo.sequence, function(step, i) {
    var panel = createStepPanel(_sequenceContainer, step);

    _stepsPanels[step.id] = panel;

    $.Schedule(BOINK_DELAY * i, function() {
      panel.data.Boink();
    });
  });
}

function createStepPanel(parent, step) {
  var id = "combo_step_" + step.name + "_" + step.id.toString();
  var panel = $.CreatePanel("Panel", parent, id);

  panel.BLoadLayout(COMBO_STEP_LAYOUT, false, false);
  panel.data.SetStep(step);

  return panel;
}

function activateStepPanels(steps) {
  $.Each(steps, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.SetStepActive();
  });
}

function deactivateStepPanels() {
  var combo = GetContextData("_combo");

  $.Each(combo.sequence, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.UnsetStepActive();
  });
}

function failStepPanels(steps) {
  $.Each(steps, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.SetStepError();
  });
}

function clearFailedStepPanels() {
  var combo = GetContextData("_combo");

  $.Each(combo.sequence, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.UnsetStepError();
  });
}

function show() {
  L("show()");
  _combo.RemoveClass("Hide");
}

function hide() {
  L("hide()");
  _combo.AddClass("Hide");
}

function start(payload) {
  var combo = CombosCollection.Get(payload.combo);

  L("start() ", combo);
  SetContextData("_combo", combo);

  $.Schedule(START_DELAY, function() {
    show();
    renderSequence();
    onComboProgress({ next: payload.next });
  });
}

function stop() {
  L("stop()");
  SetContextData("_combo", null);
  hide();
}

function sendStop() {
  CustomEvents.SendServer(EVENT_COMBO_STOP);
}

function sendRestart() {
  var combo = GetContextData("_combo");
  CustomEvents.SendServer(EVENT_COMBO_RESTART, { combo: combo.name });
}

function Restart() {
  L("Restart()");
  sendRestart();
}

function Stop() {
  L("Stop()");
  sendStop();
}

(function() {
  _combo = $("#Combo");
  _sequenceContainer = $("#SequenceContainer");

  CombosCollection.Load();

  CustomEvents.Subscribe(EVENT_COMBO_STARTED, onComboStarted);
  CustomEvents.Subscribe(EVENT_COMBO_STOPPED, onComboStopped);
  CustomEvents.Subscribe(EVENT_COMBO_PROGRESS, onComboProgress);
  CustomEvents.Subscribe(EVENT_COMBO_STEP_ERROR, onComboStepError);
  CustomEvents.Subscribe(EVENT_COMBO_FINISHED, onComboFinished);
})();
