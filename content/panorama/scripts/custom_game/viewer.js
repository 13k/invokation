"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;
  var RunSequentialActions = context.RunSequentialActions;
  var RunFunctionAction = context.RunFunctionAction;
  var AddClassAction = context.AddClassAction;
  var RemoveClassAction = context.RemoveClassAction;
  var RunSingleAction = context.RunSingleAction;

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

    setTitle: function(title) {
      this.$titleLabel.text = title;
    },

    setDescription: function(description) {
      this.$descriptionLabel.text = description;
    },

    createStepPanel: function(parent, step) {
      var id = "combo_step_" + step.id + "_" + step.name;
      var panel = CreatePanelWithLayout(parent, id, COMBO_STEP_LAYOUT);

      panel.component.Input("SetStep", { combo: this.combo, step: step });

      return panel;
    },

    scrollToTop: function() {
      return this.$scrollPanel.ScrollToTop();
    },

    renderAction: function() {
      this.debug("render()");

      var seq = new RunSequentialActions();

      seq.actions.push(this.renderInfoAction());
      seq.actions.push(this.renderSequenceAction());
      seq.actions.push(this.scrollToTopAction());

      return seq;
    },

    renderInfoAction: function() {
      var seq = new RunSequentialActions();

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

      seq.actions.push(new RunFunctionAction(this.setTitle.bind(this), title));
      seq.actions.push(new RunFunctionAction(this.setDescription.bind(this), description));

      return seq;
    },

    resetSequenceAction: function() {
      var removeChildren = this.$sequenceContainer.RemoveAndDeleteChildren.bind(
        this.$sequenceContainer
      );

      return new RunFunctionAction(removeChildren);
    },

    renderSequenceAction: function() {
      var seq = new RunSequentialActions();

      seq.actions.push(this.resetSequenceAction());
      seq.actions.push.apply(
        seq.actions,
        _.map(
          this.combo.sequence,
          _.bind(this.createStepPanelAction, this, this.$sequenceContainer)
        )
      );

      return seq;
    },

    createStepPanelAction: function(parent, step) {
      return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
    },

    scrollToTopAction: function() {
      return new RunFunctionAction(this.scrollToTop.bind(this));
    },

    view: function(combo) {
      this.combo = combo;

      var seq = new RunSequentialActions();

      seq.actions.push(this.renderAction());
      seq.actions.push(this.openAction());

      return RunSingleAction(seq);
    },

    openAction: function() {
      var seq = new RunSequentialActions();

      seq.actions.push(new RemoveClassAction(this.$ctx, "Closed"));
      seq.actions.push(new AddClassAction(this.$container, "Initialize"));

      return seq;
    },

    closeAction: function() {
      var seq = new RunSequentialActions();

      seq.actions.push(new RemoveClassAction(this.$container, "Initialize"));
      seq.actions.push(new AddClassAction(this.$ctx, "Closed"));

      return seq;
    },

    startCombo: function() {
      this.debug("startCombo()", this.combo.id);
      this.sendServer(EVENTS.COMBO_START, { combo: this.combo.id });
    },

    Close: function() {
      return RunSingleAction(this.closeAction());
    },

    Play: function() {
      this.debug("Play()");
      this.startCombo();
    },

    Reload: function() {
      this.debug("Reload()");
      return RunSingleAction(this.renderAction());
    },
  });

  context.viewer = new Viewer();
})(GameUI.CustomUIConfig(), this);
