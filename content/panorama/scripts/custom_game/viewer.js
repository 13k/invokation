"use strict";

(function(global, context) {
  var _ = global.lodash;
  var L10n = global.L10n;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

  var COMBOS = global.COMBOS;
  var EVENTS = global.Const.EVENTS;

  var CLASSES = {
    CLOSED: "Hide",
  };

  var COMBO_STEP_LAYOUT = "file://{resources}/layout/custom_game/viewer_combo_step.xml";
  var TALENTS_DISPLAY_LAYOUT = "file://{resources}/layout/custom_game/ui/talents_display.xml";
  var PROPERTIES_LAYOUT = "file://{resources}/layout/custom_game/viewer_properties.xml";
  var PROPERTIES_ID = "ViewerProperties";

  var L10N_FALLBACK_IDS = {
    description: "invokation_viewer_description_lorem",
  };

  var ORBS = ["quas", "wex", "exort"];

  function stepPanelId(step) {
    return "combo_step_" + step.id + "_" + step.name;
  }

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
          talents: "ViewerTalents",
          orbQuas: "ViewerOrbQuas",
          orbQuasLabel: "ViewerOrbQuasLabel",
          orbWex: "ViewerOrbWex",
          orbWexLabel: "ViewerOrbWexLabel",
          orbExort: "ViewerOrbExort",
          orbExortLabel: "ViewerOrbExortLabel",
        },
        customEvents: {
          "!VIEWER_RENDER": "onViewerRender",
          "!COMBO_STARTED": "onComboStarted",
        },
      });

      this.renderTalents();
      this.debug("init");
    },

    // --- Event handlers -----

    onComboStarted: function() {
      this.debug("onComboStarted()");
      this.close();
    },

    onViewerRender: function(payload) {
      this.debug("onViewerRender()", payload);
      this.view(payload.id);
    },

    // ----- Helpers -----

    renderTalents: function() {
      this.$talents.BLoadLayout(TALENTS_DISPLAY_LAYOUT, false, false);
    },

    resetSelectedTalents: function() {
      this.$talents.component.Input("Reset");
    },

    selectTalents: function() {
      this.$talents.component.Input("Select", { talents: this.combo.talents });
    },

    startCombo: function() {
      this.debug("startCombo()", this.combo.id);
      this.sendServer(EVENTS.COMBO_START, { id: this.combo.id });
    },

    createStepPanel: function(parent, step) {
      var id = stepPanelId(step);
      var panel = CreatePanelWithLayout(parent, id, COMBO_STEP_LAYOUT);

      panel.component.Input("SetStep", { combo: this.combo, step: step });

      return panel;
    },

    createPropertiesPanel: function() {
      var panel = CreatePanelWithLayout(this.$propertiesSection, PROPERTIES_ID, PROPERTIES_LAYOUT);

      panel.component.Input("SetCombo", this.combo);

      return panel;
    },

    // ----- Actions -----

    openAction: function() {
      return new Sequence().RemoveClass(this.$ctx, CLASSES.CLOSED);
    },

    closeAction: function() {
      return new Sequence().AddClass(this.$ctx, CLASSES.CLOSED);
    },

    renderAction: function() {
      return new Sequence()
        .Action(this.renderInfoAction())
        .Action(this.renderPropertiesAction())
        .Action(this.renderTalentsAction())
        .Action(this.renderOrbsAction())
        .Action(this.renderSequenceAction())
        .ScrollToTop(this.$scrollPanel);
    },

    renderInfoAction: function() {
      var title = htmlTitle(this.combo.l10n.name);
      var descriptionL10nKey = L10n.ComboKey(this.combo, "description");
      var description = L10n.LocalizeFallback(descriptionL10nKey, L10N_FALLBACK_IDS.description);

      return new ParallelSequence()
        .SetAttribute(this.$titleLabel, "text", title)
        .SetAttribute(this.$descriptionLabel, "text", description);
    },

    renderPropertiesAction: function() {
      return new Sequence()
        .RemoveChildren(this.$propertiesSection)
        .RunFunction(this, this.createPropertiesPanel);
    },

    renderTalentsAction: function() {
      return new Sequence()
        .RunFunction(this, this.resetSelectedTalents)
        .RunFunction(this, this.selectTalents);
    },

    renderOrbsAction: function() {
      return new ParallelSequence()
        .SetAttribute(this.$orbQuasLabel, "text", this.combo.orbs[0])
        .SetAttribute(this.$orbWexLabel, "text", this.combo.orbs[1])
        .SetAttribute(this.$orbExortLabel, "text", this.combo.orbs[2]);
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

    // ----- Action runners -----

    view: function(id) {
      this.combo = COMBOS.Get(id);

      var seq = new Sequence().Action(this.renderAction()).Action(this.openAction());

      this.debugFn(function() {
        return ["view()", { id: this.combo.id, actions: seq.size() }];
      });

      return seq.Start();
    },

    close: function() {
      return this.closeAction().Start();
    },

    // ----- UI methods -----

    Reload: function() {
      this.debug("Reload()");
      return this.renderAction().Start();
    },

    Close: function() {
      return this.close();
    },

    Play: function() {
      return this.startCombo();
    },

    ShowOrbTooltip: function(orb) {
      var index = ORBS.indexOf(orb);

      if (index >= 0) {
        var attr = _.chain("orb_")
          .concat(orb)
          .camelCase()
          .value();
        var elem = this.element(attr);
        this.showAbilityTooltip(elem, elem.abilityname, { level: this.combo.orbs[index] });
      }
    },
  });

  context.component = new Viewer();
})(GameUI.CustomUIConfig(), this);
