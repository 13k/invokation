import { Component, ComponentOptions } from "./lib/component";

const DEFAULT_BUTTON_ID = "ability-button";
const DEFAULT_IMAGE_ID = "ability-image";

const CLASSES = {
  INVOCATION: "invocation",
  OPTIONAL: "optional",
};

export interface ComboStepOptions extends ComponentOptions {
  imageID?: string;
}

export type ComboStepInputs = {
  SetStep: { combo: invk.Combo.Combo; step: invk.Combo.Step };
};

/**
 * Abstract ComboStep component.
 *
 * Should be included in actual component layout and subclassed.
 */
export abstract class ComboStep extends Component {
  combo?: invk.Combo.Combo;
  step?: invk.Combo.Step;

  constructor(options: ComboStepOptions = {}) {
    options = {
      ...options,
      imageID: DEFAULT_IMAGE_ID,
      elements: {
        button: DEFAULT_BUTTON_ID,
      },
      inputs: {
        SetStep: "setStep",
      },
    };

    super(options);
  }

  /** Child components code can override this method */
  onStepChange(): void {
    return;
  }

  setStep(payload: ComboStepInputs["SetStep"]): void {
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

    this.createAbilityOrItemImage(this.$button, this.options.imageID, this.step.name, {
      props: { hittest: false },
    });

    this.onStepChange();
  }

  ShowTooltip(): void {
    this.showAbilityTooltip(this.$ctx, this.step.name);
  }

  HideTooltip(): void {
    this.hideAbilityTooltip(this.$ctx);
  }
}

//   context.ComboStep = ComboStep;
// })(GameUI.CustomUIConfig(), this);
