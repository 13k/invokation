"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var Sequence = global.Sequence.Sequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var COMBO_STEP_LAYOUT = "file://{resources}/layout/custom_game/viewer_combo_step.xml";

  var L10N_FALLBACK_IDS = {
    description: "invokation_viewer_description_lorem",
  };

  var Viewer = CreateComponent({
    constructor: function Viewer() {
      Viewer.super.call(this, {
        elements: {
          container: "Container",
          titleLabel: "Title",
          scrollPanel: "ScrollPanel",
          descriptionLabel: "Description",
          sequenceContainer: "SequenceContainer",
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
      this.debug("render()");

      return new Sequence()
        .Action(this.renderInfoAction())
        .Action(this.renderSequenceAction())
        .ScrollToTop(this.$scrollPanel);
    },

    renderInfoAction: function() {
      var title = _.chain(this.combo.l10n.name)
        .split(" - ")
        .map(function(line, i) {
          var heading = i === 0 ? "h1" : "h3";
          return "<" + heading + ">" + line + "</" + heading + ">";
        })
        .join("")
        .value();

      var descriptionL10nID = this.combo.id + "__description";
      var description = this.localizeFallback(descriptionL10nID, L10N_FALLBACK_IDS.description);

      return new Sequence()
        .SetAttribute(this.$titleLabel, "text", title)
        .SetAttribute(this.$descriptionLabel, "text", description);
    },

    resetSequenceAction: function() {
      var removeChildren = this.$sequenceContainer.RemoveAndDeleteChildren.bind(
        this.$sequenceContainer
      );

      return new RunFunctionAction(removeChildren);
    },

    renderSequenceAction: function() {
      var actions = _.map(
        this.combo.sequence,
        _.bind(this.createStepPanelAction, this, this.$sequenceContainer)
      );

      return new Sequence().RemoveChildren(this.$sequenceContainer).Action(actions);
    },

    createStepPanelAction: function(parent, step) {
      return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
    },

    view: function(combo) {
      this.combo = combo;

      return new Sequence()
        .Action(this.renderAction())
        .Action(this.openAction())
        .Start();
    },

    openAction: function() {
      return new Sequence()
        .RemoveClass(this.$ctx, "Closed")
        .AddClass(this.$container, "Initialize");
    },

    closeAction: function() {
      return new Sequence()
        .RemoveClass(this.$container, "Initialize")
        .AddClass(this.$ctx, "Closed");
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
