"use strict";

var COMBO_STEP_LAYOUT = "file://{resources}/layout/custom_game/combo_details_step.xml";

var _combo = {};

var _titleLabel;
var _sequenceContainer;

function onComboStarted() {
  L("onComboStarted()");
  close();
}

function onComboDetailsRender(combo) {
  L("onComboDetailsRender() ", combo);
  SetContextData("_combo", combo);
  render();
  open();
}

function render() {
  L("render()");
  renderInfo();
  renderSequence();
}

function renderInfo() {
  var combo = GetContextData("_combo");

  _titleLabel.text = combo.name_l10n;
}

function renderSequence() {
  var combo = GetContextData("_combo");

  _sequenceContainer.RemoveAndDeleteChildren();

  $.Each(combo.sequence, function(step) {
    createStepPanel(_sequenceContainer, step);
  });
}

function createStepPanel(parent, step) {
  var panel = $.CreatePanel("Panel", parent, "combo_step_" + step.name);

  panel.BLoadLayout(COMBO_STEP_LAYOUT, false, false);
  panel.data.SetStep(step);

  return panel;
}

function open() {
  $.GetContextPanel().RemoveClass("Closed");
}

function close() {
  $.GetContextPanel().AddClass("Closed");
}

function startCombo() {
  var combo = GetContextData("_combo");
  L("startCombo() ", combo.name);
  CustomEvents.SendServer(EVENT_COMBO_START, { name: combo.name });
}

function Play() {
  L("Play()");
  startCombo();
}

function Close() {
  close();
}

function Refresh() {
  L("Refresh()");
  render();
}

(function() {
  _titleLabel = $("#Title");
  _sequenceContainer = $("#SequenceContainer");

  CustomEvents.Subscribe(EVENT_COMBO_DETAILS_RENDER, onComboDetailsRender);
  CustomEvents.Subscribe(EVENT_COMBO_STARTED, onComboStarted);

  L("init");
})();