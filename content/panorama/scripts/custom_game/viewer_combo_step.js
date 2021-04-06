"use strict";

((global, context) => {
  const { L10n } = global;
  const { ComboStep } = context;

  const L10N_FALLBACK_IDS = {
    description: "invokation_viewer_step_description_lorem",
  };

  class ViewerComboStep extends ComboStep {
    constructor() {
      super({
        elements: {
          descriptionLabel: "description",
        },
      });
    }

    onStepChange() {
      const descriptionL10nKey = L10n.ComboKey(this.combo, this.step.id);

      this.$descriptionLabel.text = L10n.LocalizeFallback(
        descriptionL10nKey,
        L10N_FALLBACK_IDS.description
      );
    }
  }

  context.comboStep = new ViewerComboStep();
})(GameUI.CustomUIConfig(), this);
