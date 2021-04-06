"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _, L10n, COMBOS } = global;
  const { Sequence, ParallelSequence, RunFunctionAction } = global.Sequence;
  const { CSS_CLASSES, EVENTS, LAYOUTS } = global.Const;

  const CLASSES = {
    CLOSED: CSS_CLASSES.HIDE,
  };

  const PROPERTIES_ID = "viewer-properties";

  const COMBO_STEP_INPUTS = {
    SET_STEP: "SetStep",
  };

  const PROPERTIES_INPUTS = {
    SET_COMBO: "SetCombo",
  };

  const TALENTS_INPUTS = {
    RESET: "Reset",
    SELECT: "Select",
  };

  const L10N_FALLBACK_IDS = {
    description: "invokation_viewer_description_lorem",
  };

  const ORBS = ["quas", "wex", "exort"];

  const stepPanelId = (step) => `combo-step-${step.id}-${step.name}`;

  const htmlTitle = (title) =>
    _.chain(title)
      .split(" - ")
      .map((line, i) => {
        const heading = i === 0 ? "h1" : "h3";
        return `<${heading}>${line}</${heading}>`;
      })
      .join("")
      .value();

  class Viewer extends Component {
    constructor() {
      super({
        elements: {
          scrollPanel: "scroll-panel",
          propertiesSection: "properties-section",
          titleLabel: "title",
          descriptionLabel: "description",
          sequence: "sequence",
          talents: "talents",
          orbQuas: "ability-quas",
          orbQuasLabel: "ability-quas-label",
          orbWex: "ability-wex",
          orbWexLabel: "ability-wex-label",
          orbExort: "ability-exort",
          orbExortLabel: "ability-exort-label",
        },
        customEvents: {
          "!VIEWER_RENDER": "onViewerRender",
          "!COMBO_STARTED": "onComboStarted",
        },
      });

      this.renderTalents();
      this.debug("init");
    }

    // --- Event handlers -----

    onComboStarted() {
      this.debug("onComboStarted()");
      this.close();
    }

    onViewerRender(payload) {
      this.debug("onViewerRender()", payload);
      this.view(payload.id);
    }

    // ----- Helpers -----

    renderTalents() {
      this.$talents.BLoadLayout(LAYOUTS.UI.TALENTS_DISPLAY, false, false);
    }

    resetSelectedTalents() {
      this.$talents.component.Input(TALENTS_INPUTS.RESET);
    }

    selectTalents() {
      this.$talents.component.Input(TALENTS_INPUTS.SELECT, { talents: this.combo.talents });
    }

    startCombo() {
      this.debug("startCombo()", this.combo.id);
      this.sendServer(EVENTS.COMBO_START, { id: this.combo.id });
    }

    createStepPanel(parent, step) {
      const id = stepPanelId(step);

      return this.createComponent(parent, id, LAYOUTS.VIEWER.COMBO_STEP, {
        inputs: {
          [COMBO_STEP_INPUTS.SET_STEP]: { combo: this.combo, step },
        },
      });
    }

    createPropertiesPanel() {
      return this.createComponent(
        this.$propertiesSection,
        PROPERTIES_ID,
        LAYOUTS.VIEWER.PROPERTIES,
        {
          inputs: {
            [PROPERTIES_INPUTS.SET_COMBO]: this.combo,
          },
        }
      );
    }

    // ----- Actions -----

    openAction() {
      return new Sequence().RemoveClass(this.$ctx, CLASSES.CLOSED);
    }

    closeAction() {
      return new Sequence().AddClass(this.$ctx, CLASSES.CLOSED);
    }

    renderAction() {
      return new Sequence()
        .Action(this.renderInfoAction())
        .Action(this.renderPropertiesAction())
        .Action(this.renderTalentsAction())
        .Action(this.renderOrbsAction())
        .Action(this.renderSequenceAction())
        .ScrollToTop(this.$scrollPanel);
    }

    renderInfoAction() {
      const title = htmlTitle(this.combo.l10n.name);
      const descriptionL10nKey = L10n.ComboKey(this.combo, "description");
      const description = L10n.LocalizeFallback(descriptionL10nKey, L10N_FALLBACK_IDS.description);

      return new ParallelSequence()
        .SetAttribute(this.$titleLabel, "text", title)
        .SetAttribute(this.$descriptionLabel, "text", description);
    }

    renderPropertiesAction() {
      return new Sequence()
        .RemoveChildren(this.$propertiesSection)
        .RunFunction(() => this.createPropertiesPanel());
    }

    renderTalentsAction() {
      return new Sequence()
        .RunFunction(() => this.resetSelectedTalents())
        .RunFunction(() => this.selectTalents());
    }

    renderOrbsAction() {
      return new ParallelSequence()
        .SetAttribute(this.$orbQuasLabel, "text", this.combo.orbs[0])
        .SetAttribute(this.$orbWexLabel, "text", this.combo.orbs[1])
        .SetAttribute(this.$orbExortLabel, "text", this.combo.orbs[2]);
    }

    renderSequenceAction() {
      const actions = _.map(
        this.combo.sequence,
        _.bind(this.createStepPanelAction, this, this.$sequence)
      );

      return new Sequence().RemoveChildren(this.$sequence).Action(actions);
    }

    createStepPanelAction(parent, step) {
      return new RunFunctionAction(() => this.createStepPanel(parent, step));
    }

    // ----- Action runners -----

    view(id) {
      this.combo = COMBOS.Get(id);

      const seq = new Sequence().Action(this.renderAction()).Action(this.openAction());

      this.debugFn(() => ["view()", { id: this.combo.id, actions: seq.size() }]);

      return seq.Start();
    }

    close() {
      return this.closeAction().Start();
    }

    // ----- UI methods -----

    Reload() {
      this.debug("Reload()");
      return this.renderAction().Start();
    }

    Close() {
      return this.close();
    }

    Play() {
      return this.startCombo();
    }

    ShowOrbTooltip(orb) {
      const index = ORBS.indexOf(orb);

      if (index >= 0) {
        const attr = _.camelCase(`orb_${orb}`);
        const elem = this.element(attr);

        this.showAbilityTooltip(elem, elem.abilityname, { level: this.combo.orbs[index] });
      }
    }
  }

  context.component = new Viewer();
})(GameUI.CustomUIConfig(), this);
