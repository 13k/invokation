"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var PROPERTIES_LAYOUT = "file://{resources}/layout/custom_game/viewer_properties.xml";
  var COMBO_STEP_LAYOUT = "file://{resources}/layout/custom_game/viewer_combo_step.xml";
  var PROPERTIES_ID = "ViewerProperties";

  var L10N_FALLBACK_IDS = {
    description: "invokation_viewer_description_lorem",
  };

  function htmlTitle(title) {
    return _.chain(title)
      .split(" - ")
      .map(function(line, i) {
        var heading = i === 0 ? "h1" : "h3";
        return "<" + heading + ">" + line + "</" + heading + ">";
      })
      .join("")
      .value();
  }

  var Viewer = CreateComponent({
    constructor: function Viewer() {
      Viewer.super.call(this, {
        elements: {
          scrollPanel: "ViewerScrollPanel",
          propertiesSection: "ViewerPropertiesSection",
          titleLabel: "ViewerTitle",
          descriptionLabel: "ViewerDescription",
          sequence: "ViewerSequence",
        },
        customEvents: {
          "!VIEWER_RENDER": "onViewerRender",
          "!COMBO_STARTED": "onComboStarted",
        },
      });

      this.debug("init");
    },

    onComboStarted: function() {
      this.debug("onComboStarted()");
      this.Close();
    },

    onViewerRender: function(payload) {
      this.debug("onViewerRender()", payload);
      this.view(payload.combo);
    },

    createStepPanel: function(parent, step) {
      var id = "combo_step_" + step.id + "_" + step.name;
      var panel = CreatePanelWithLayout(parent, id, COMBO_STEP_LAYOUT);

      panel.component.Input("SetStep", { combo: this.combo, step: step });

      return panel;
    },

    renderAction: function() {
      return new Sequence()
        .Action(this.renderInfoAction())
        .Action(this.renderPropertiesAction())
        .Action(this.renderSequenceAction())
        .ScrollToTop(this.$scrollPanel);
    },

    renderInfoAction: function() {
      var title = htmlTitle(this.combo.l10n.name);
      var descriptionL10nID = this.combo.id + "__description";
      var description = this.localizeFallback(descriptionL10nID, L10N_FALLBACK_IDS.description);

      return new ParallelSequence()
        .SetAttribute(this.$titleLabel, "text", title)
        .SetAttribute(this.$descriptionLabel, "text", description);
    },

    renderPropertiesAction: function() {
      return new Sequence()
        .RemoveChildren(this.$propertiesSection)
        .RunFunction(this, this.createPropertiesPanel);
    },

    createPropertiesPanel: function() {
      var panel = CreatePanelWithLayout(this.$propertiesSection, PROPERTIES_ID, PROPERTIES_LAYOUT);

      panel.component.Input("SetCombo", this.combo);

      return panel;
    },

    renderSequenceAction: function() {
      var actions = _.map(
        this.combo.sequence,
        _.bind(this.createStepPanelAction, this, this.$sequence)
      );

      return new Sequence().RemoveChildren(this.$sequence).Action(actions);
    },

    createStepPanelAction: function(parent, step) {
      return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
    },

    view: function(combo) {
      this.combo = combo;

      var seq = new Sequence().Action(this.renderAction()).Action(this.openAction());

      this.debugFn(function() {
        return ["view()", { id: this.combo.id, actions: seq.size() }];
      });

      return seq.Start();
    },

    openAction: function() {
      return new Sequence().RemoveClass(this.$ctx, "Hide");
    },

    closeAction: function() {
      return new Sequence().AddClass(this.$ctx, "Hide");
    },

    startCombo: function() {
      this.debug("startCombo()", this.combo.id);
      this.sendServer(EVENTS.COMBO_START, { combo: this.combo.id });
    },

    Close: function() {
      return this.closeAction().Start();
    },

    Play: function() {
      this.debug("Play()");
      this.startCombo();
    },

    Reload: function() {
      this.debug("Reload()");
      return this.renderAction().Start();
    },
  });

  context.viewer = new Viewer();
})(GameUI.CustomUIConfig(), this);
