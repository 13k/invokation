"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  EVENTS = C.EVENTS;

var COMBO_STEP_LAYOUT =
  "file://{resources}/layout/custom_game/viewer_combo_step.xml";

var L10N_FALLBACK_IDS = {
  description: "invokation_viewer_description_lorem",
};

var Viewer = CreateComponent({
  constructor: function Viewer() {
    Viewer.super.call(this, $.GetContextPanel());

    this.bindElements();
    this.bindEvents();

    this.log("init");
  },

  bindElements: function() {
    this.$container = $("#Container");
    this.$titleLabel = $("#Title");
    this.$scrollPanel = $("#ScrollPanel");
    this.$descriptionLabel = $("#Description");
    this.$sequenceContainer = $("#SequenceContainer");
    // this.$sequenceInfoLabel = $("#SequenceInfoLabel");
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
    this.$scrollPanel.ScrollToTop();
  },

  renderInfo: function() {
    var lines = this.combo.l10n.name.split(" - ").map(function(line, i) {
      var heading = i === 0 ? "h1" : "h3";
      return "<" + heading + ">" + line + "</" + heading + ">";
    });

    this.$titleLabel.text = lines.join("");

    var descriptionL10nID = this.combo.id + "__description";
    this.$descriptionLabel.text = this.localizeFallback(
      descriptionL10nID,
      L10N_FALLBACK_IDS.description
    );
  },

  renderSequence: function() {
    var self = this;

    this.$sequenceContainer.RemoveAndDeleteChildren();

    $.Each(this.combo.sequence, function(step) {
      self.createStepPanel(self.$sequenceContainer, step);
    });
  },

  createStepPanel: function(parent, step) {
    var panelID = "combo_step_" + step.id + "_" + step.name;
    var panel = $.CreatePanel("Panel", parent, panelID);

    panel.BLoadLayout(COMBO_STEP_LAYOUT, false, false);
    panel.component.Input("SetStep", { combo: this.combo, step: step });

    return panel;
  },

  Open: function() {
    this.$ctx.RemoveClass("Closed");
    this.$container.AddClass("Initialize");
  },

  Close: function() {
    this.$container.RemoveClass("Initialize");
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
