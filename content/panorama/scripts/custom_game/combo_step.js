// Abstract ComboStep component.
// Should be included in actual component layout and subclassed.

"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { CreateAbilityOrItemImage } = global.Util;

  const DEFAULT_BUTTON_ID = "ability-button";
  const DEFAULT_IMAGE_ID = "ability-image";

  const CLASSES = {
    INVOCATION: "invocation",
    OPTIONAL: "optional",
  };

  class ComboStep extends Component {
    constructor(options) {
      options = _.defaultsDeep(options, {
        imageId: DEFAULT_IMAGE_ID,
        elements: {
          button: DEFAULT_BUTTON_ID,
        },
        inputs: {
          SetStep: "setStep",
        },
      });

      super(options);
    }

    // child components code can override this function
    onStepChange() {}

    setStep(payload) {
      this.combo = payload.combo;
      this.step = payload.step;

      this.$button.RemoveAndDeleteChildren();

      if (this.step.required) {
        this.$ctx.RemoveClass(CLASSES.OPTIONAL);
      } else {
        this.$ctx.AddClass(CLASSES.OPTIONAL);
      }

      if (this.step.isInvocationAbility) {
        this.$ctx.AddClass(CLASSES.INVOCATION);
      } else {
        this.$ctx.RemoveClass(CLASSES.INVOCATION);
      }

      const image = CreateAbilityOrItemImage(this.$button, this.options.imageId, this.step.name);

      image.hittest = false;

      this.onStepChange();
    }

    ShowTooltip() {
      this.showAbilityTooltip(this.$ctx, this.step.name);
    }

    HideTooltip() {
      this.hideAbilityTooltip(this.$ctx);
    }
  }

  context.ComboStep = ComboStep;
})(GameUI.CustomUIConfig(), this);
