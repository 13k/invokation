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
      this.options = _.defaultsDeep(options, {
        imageId: "ComboStepImage",
        elements: {
          button: "ComboStepIconButton",
        },
        inputs: {
          SetStep: "setStep",
        },
      });

      ComboStep.super.call(this, this.options);
    },

    // child components code can override this function
    onStepChange: function() {},

    setStep: function(payload) {
      this.combo = payload.combo;
      this.step = payload.step;

      this.$button.RemoveAndDeleteChildren();

      if (this.step.required) {
        this.$ctx.RemoveClass("ComboOptional");
      } else {
        this.$ctx.AddClass("ComboOptional");
      }

      if (this.step.isInvocationAbility) {
        this.$ctx.AddClass("ComboStepInvocation");
      } else {
        this.$ctx.RemoveClass("ComboStepInvocation");
      }

      var image;

      if (this.step.isItem) {
        image = CreateItemImage(this.$button, this.options.imageId, this.step.name);
      } else {
        image = CreateAbilityImage(this.$button, this.options.imageId, this.step.name);
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
