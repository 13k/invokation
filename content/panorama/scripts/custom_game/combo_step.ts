import type { Combo, Step } from "../lib/combo";
import type * as C from "../lib/component";

export interface Elements extends C.Elements {
  button: Panel;
}

export interface Context extends C.LayoutContext {
  ComboStep: typeof ComboStep;
}

export interface Options<E extends Elements> extends C.Options<E> {
  imageId?: string;
}

const {
  Component,
  lodash: _,
  Panorama: { createAbilityOrItemImage },
} = GameUI.CustomUIConfig();

enum PanelID {
  ImageDefault = "ComboStepImage",
}

enum CssClass {
  ComboOptional = "ComboOptional",
  StepInvocation = "ComboStepInvocation",
}

// Abstract ComboStep component.
// Should be included in actual component layout and subclassed.
class ComboStep<E extends Elements> extends Component<E> {
  imageId: string;
  combo?: Combo;
  step?: Step;

  constructor({ imageId, ...options }: Options<E> = {}) {
    options = _.defaultsDeep(options, {
      elements: {
        button: "ComboStepIconButton",
      },
      inputs: {
        SetStep: "setStep",
      },
    });

    super(options);

    this.imageId = imageId || PanelID.ImageDefault;
  }

  // child components code can override this function
  onStepChange(): void {
    return;
  }

  setStep({ combo, step }: { combo: Combo; step: Step }): void {
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

    const image = createAbilityOrItemImage(this.elements.button, this.imageId, this.step.name);

    image.hittest = false;

    this.onStepChange();
  }

  ShowTooltip(): void {
    if (!this.step) {
      this.warn("tried to ShowTooltip() without step");
      return;
    }

    this.showAbilityTooltip(this.panel, this.step.name);
  }

  HideTooltip(): void {
    this.hideAbilityTooltip(this.panel);
  }
}

export type { ComboStep };
