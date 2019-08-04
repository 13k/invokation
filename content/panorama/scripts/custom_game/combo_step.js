// Abstract ComboStep component.
// Should be included in actual component layout and subclassed.

"use strict";

(function(global, context) {
  var _ = global.lodash;
  var CreateItemImage = global.Util.CreateItemImage;
  var CreateAbilityImage = global.Util.CreateAbilityImage;
  var CreateComponent = context.CreateComponent;

  var ComboStep = CreateComponent({
    constructor: function ComboStep(options) {
      options = _.defaultsDeep(options, {
        elements: {
          button: "StepIconButton",
          descriptionLabel: "StepDescription",
        },
        inputs: {
          SetStep: "setStep",
        },
      });

      ComboStep.super.call(this, options);
    },

    // child components code can override this function
    onStepChange: function() {},

    setStep: function(payload) {
      this.combo = payload.combo;
      this.step = payload.step;

      this.$button.RemoveAndDeleteChildren();

      if (!this.step.required) {
        this.$ctx.AddClass("Optional");
      } else {
        this.$ctx.RemoveClass("Optional");
      }

      var image;

      if (this.step.isItem) {
        image = CreateItemImage(this.$button, "StepImage", this.step.name);
      } else {
        image = CreateAbilityImage(this.$button, "StepImage", this.step.name);
      }

      image.hittest = false;

      this.onStepChange();
    },

    ShowTooltip: function() {
      this.showAbilityTooltip(this.$ctx, this.step.name);
    },

    HideTooltip: function() {
      this.hideAbilityTooltip(this.$ctx);
    },
  });

  context.ComboStep = ComboStep;
})(GameUI.CustomUIConfig(), this);
