"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  EVENTS = C.EVENTS;

var COMBO_STEP_LAYOUT =
  "file://{resources}/layout/custom_game/viewer_combo_step.xml";

function createStepPanel(parent, step) {
  var panelID = "combo_step_" + step.id + "_" + step.name;
  var panel = $.CreatePanel("Panel", parent, panelID);

  panel.BLoadLayout(COMBO_STEP_LAYOUT, false, false);
  panel.component.Input("SetStep", step);

  return panel;
}

var Viewer = CreateComponent({
  constructor: function Viewer() {
    Viewer.super.call(this, $.GetContextPanel());

    this.bindElements();
    this.bindEvents();

    this.log("init");
  },

  bindElements: function() {
    this.$titleLabel = $("#Title");
    this.$sequenceContainer = $("#SequenceContainer");
  },

  bindEvents: function() {
    this.subscribe(EVENTS.VIEWER_RENDER, this.onViewerRender);
    this.subscribe(EVENTS.COMBO_STARTED, this.onComboStarted);
  },

  onComboStarted: function() {
    this.log("onComboStarted()");
    this.Close();
  },

  onViewerRender: function(payload) {
    this.log("onViewerRender() ", payload.combo);
    this.combo = payload.combo;
    this.render();
    this.Open();
  },

  render: function() {
    this.log("render()");
    this.renderInfo();
    this.renderSequence();
  },

  renderInfo: function() {
    this.$titleLabel.text = this.combo.l10n.name;
  },

  renderSequence: function() {
    var self = this;

    this.$sequenceContainer.RemoveAndDeleteChildren();

    $.Each(this.combo.sequence, function(step) {
      createStepPanel(self.$sequenceContainer, step);
    });
  },

  Open: function() {
    this.$ctx.RemoveClass("Closed");
  },

  Close: function() {
    this.$ctx.AddClass("Closed");
  },

  startCombo: function() {
    this.log("startCombo() ", this.combo.id);
    this.sendServer(EVENTS.COMBO_START, { combo: this.combo.id });
  },

  Play: function() {
    this.log("Play()");
    this.startCombo();
  },

  Reload: function() {
    this.log("Reload()");
    this.render();
  },
});

var viewer = new Viewer();
