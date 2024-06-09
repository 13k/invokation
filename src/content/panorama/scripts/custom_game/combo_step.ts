import type { Combo, Step } from "@invokation/panorama-lib/combo";
import { createAbilityOrItemImage } from "@invokation/panorama-lib/panorama";

import type {
  Elements,
  ElementsOptions,
  Inputs,
  InputsOptions,
  Options,
  Outputs,
  Params,
} from "./component";
import { Component } from "./component";

export interface ComboStepElements extends Elements {
  button: Panel;
}

export interface ComboStepInputs extends Inputs {
  setStep: {
    combo: Combo;
    step: Step;
  };
}

export enum PanelId {
  Image = "ComboStepImage",
}

enum CssClass {
  ComboOptional = "ComboOptional",
  StepInvocation = "ComboStepInvocation",
}

/**
 * Abstract ComboStep component.
 *
 * Should be included in the actual component layout and subclassed.
 */
export abstract class ComboStep<
  E extends ComboStepElements = ComboStepElements,
  I extends ComboStepInputs = ComboStepInputs,
  O extends Outputs = never,
  P extends Params = never,
> extends Component<E, I, O, P> {
  combo: Combo | undefined;
  step: Step | undefined;

  constructor({ elements, inputs, panelEvents, ...options }: Options<E, I, P> = {}) {
    super({
      elements: {
        button: "ComboStepIconButton",
        ...elements,
      } as ElementsOptions<E>,
      inputs: {
        setStep: (payload) => this.setStep(payload),
        ...inputs,
      } as InputsOptions<I>,
      panelEvents: {
        button: {
          onmouseover: () => this.onMouseover(),
          onmouseout: () => this.onMouseout(),
        },
        ...panelEvents,
      },
      ...options,
    });
  }

  // ----- Callbacks -----

  /** Subclasses can override */
  protected onStepChange(): void {
    return;
  }

  // ----- I/O -----

  protected setStep({ combo, step }: ComboStepInputs["setStep"]): void {
    this.combo = combo;
    this.step = step;

    this.elements.button.RemoveAndDeleteChildren();

    if (this.step.required) {
      this.panel.RemoveClass(CssClass.ComboOptional);
    } else {
      this.panel.AddClass(CssClass.ComboOptional);
    }

    if (this.step.isInvocationAbility) {
      this.panel.AddClass(CssClass.StepInvocation);
    } else {
      this.panel.RemoveClass(CssClass.StepInvocation);
    }

    const image = createAbilityOrItemImage(this.elements.button, PanelId.Image, this.step.name);

    image.hittest = false;

    this.onStepChange();
  }

  // ----- Layout event handlers -----

  onMouseover(): void {
    if (this.step == null) {
      this.warn("Tried to onShowTooltip() without step");
      return;
    }

    this.showAbilityTooltip(this.panel, this.step.name);
  }

  onMouseout(): void {
    this.hideAbilityTooltip(this.panel);
  }
}
