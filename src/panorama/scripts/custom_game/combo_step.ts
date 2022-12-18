namespace invk {
  export namespace Components {
    export namespace ComboStep {
      export interface Elements extends Component.Elements {
        button: Panel;
      }

      export interface Inputs {
        SetStep: {
          combo: Combo.Combo;
          step: Combo.Step;
        };
      }

      export interface Options<E extends Elements, I extends Inputs, P extends Component.Params>
        extends Component.Options<E, I, P> {
        imageId?: string;
      }

      const {
        Panorama: { createAbilityOrItemImage },
        Vendor: { lodash: _ },
      } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        ImageDefault = "ComboStepImage",
      }

      enum CssClass {
        ComboOptional = "ComboOptional",
        StepInvocation = "ComboStepInvocation",
      }

      export const DEFAULT_ELEMENTS: Component.ElementsOption<Elements> = {
        button: "ComboStepIconButton",
      };

      export const DEFAULT_INPUTS: Component.InputsOption<Inputs> = {
        SetStep: "setStep",
      };

      export const DEFAULT_OPTIONS: Options<Elements, Inputs, Component.Params> = {
        elements: DEFAULT_ELEMENTS,
        inputs: DEFAULT_INPUTS,
      };

      // Abstract ComboStep component.
      // Should be included in the actual component layout and subclassed.
      export class ComboStep<
        E extends Elements,
        I extends Inputs,
        O extends Component.Outputs,
        P extends Component.Params
      > extends Component.Component<E, I, O, P> {
        imageId: string;
        combo?: Combo.Combo;
        step?: Combo.Step;

        constructor({ imageId, ...options }: Options<E, I, P> = {}) {
          options = _.defaultsDeep(options, DEFAULT_OPTIONS);

          super(options);

          this.imageId = imageId || PanelID.ImageDefault;
        }

        // child components code can override this function
        onStepChange(): void {
          return;
        }

        setStep({ combo, step }: Inputs["SetStep"]): void {
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

          const image = createAbilityOrItemImage(
            this.elements.button,
            this.imageId,
            this.step.name
          );

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
    }
  }
}
