import type { Combo, Step } from "./combo";
import { Component } from "./component";
import { ABSTRACT_COMPONENTS } from "./const/component";
import { UIEvents } from "./ui_events";

export type Inputs = {
  [INPUTS.SET_STEP]: { combo: Combo; step: Step };
};

export type Outputs = never;

export interface Options {
  imageID?: string;
  buttonID?: string;
}

interface Elements {
  button: Button;
}

const { inputs: INPUTS } = ABSTRACT_COMPONENTS.COMBO_STEP;

const DEFAULT_BUTTON_ID = "ability-button";
const DEFAULT_IMAGE_ID = "ability-image";

const CLASSES = {
  INVOCATION: "invocation",
  OPTIONAL: "optional",
};

/**
 * Abstract ComboStep component.
 */
export abstract class ComboStep extends Component {
  #elements: Elements;
  #imageID: string;
  combo?: Combo;
  step?: Step;

  constructor({ buttonID = DEFAULT_BUTTON_ID, imageID = DEFAULT_IMAGE_ID }: Options = {}) {
    super();

    this.#elements = this.findAll<Elements>({
      button: buttonID,
    });

    this.registerInputs({
      [INPUTS.SET_STEP]: this.setStep,
    });

    this.#imageID = imageID;
  }

  hasStep(): this is { step: Step } {
    return this.step != null;
  }

  /** Child components code can override this method */
  onStepChange(): void {
    return;
  }

  setStep(payload: Inputs[typeof INPUTS.SET_STEP]): void {
    this.combo = payload.combo;
    this.step = payload.step;

    this.#elements.button.RemoveAndDeleteChildren();

    if (this.step.required) {
      this.ctx.RemoveClass(CLASSES.OPTIONAL);
    } else {
      this.ctx.AddClass(CLASSES.OPTIONAL);
    }

    if (this.step.isInvocationAbility) {
      this.ctx.AddClass(CLASSES.INVOCATION);
    } else {
      this.ctx.RemoveClass(CLASSES.INVOCATION);
    }

    this.createAbilityOrItemImage(this.#elements.button, this.#imageID, this.step.name, {
      props: { hittest: false },
    });

    this.onStepChange();
  }

  showTooltip(): void {
    if (!this.hasStep()) return;

    UIEvents.showAbilityTooltip(this.ctx, this.step.name);
  }

  hideTooltip(): void {
    UIEvents.hideAbilityTooltip(this.ctx);
  }
}

//   context.ComboStep = ComboStep;
// })(GameUI.CustomUIConfig(), this);
