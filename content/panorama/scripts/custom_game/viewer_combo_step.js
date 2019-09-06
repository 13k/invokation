"use strict";

(function(global, context) {
  var L10n = global.L10n;
  var Class = global.Class;
  var ComboStep = context.ComboStep;

  var L10N_FALLBACK_IDS = {
    description: "invokation_viewer_step_description_lorem",
  };

  var ViewerComboStep = Class(ComboStep, {
    constructor: function ViewerComboStep() {
      ViewerComboStep.super.call(this, {
        elements: {
          descriptionLabel: "ViewerComboStepDescription",
        },
      });
    },

    onStepChange: function() {
      var descriptionL10nKey = L10n.ComboKey(this.combo, this.step.id);
      this.$descriptionLabel.text = L10n.LocalizeFallback(
        descriptionL10nKey,
        L10N_FALLBACK_IDS.description
      );
    },
  });

  context.comboStep = new ViewerComboStep();
})(GameUI.CustomUIConfig(), this);
