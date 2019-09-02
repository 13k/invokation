"use strict";

(function(global, context) {
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
      var descriptionL10nID = this.combo.id + "__" + this.step.id.toString();
      this.$descriptionLabel.text = this.localizeFallback(
        descriptionL10nID,
        L10N_FALLBACK_IDS.description
      );
    },
  });

  context.comboStep = new ViewerComboStep();
})(GameUI.CustomUIConfig(), this);
