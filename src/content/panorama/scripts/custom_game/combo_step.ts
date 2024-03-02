// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ComboStep {
      const {
        panorama: { createAbilityOrItemImage },
      } = GameUI.CustomUIConfig().invk;

      import Combo = invk.combo.Combo;
      import Component = invk.component.Component;
      import Step = invk.combo.Step;

      export interface Elements extends component.Elements {
        button: Panel;
      }

      export interface Inputs extends component.Inputs {
        SetStep: {
          combo: Combo;
          step: Step;
        };
      }

      export enum PanelID {
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
        E extends Elements = Elements,
        I extends Inputs = Inputs,
        O extends component.Outputs = never,
        P extends component.Params = never,
      > extends Component<E, I, O, P> {
        combo: Combo | undefined;
        step: Step | undefined;

        constructor({ elements, inputs, ...options }: component.Options<E, I, P> = {}) {
          super({
            elements: {
              button: "ComboStepIconButton",
              ...elements,
            } as component.ElementsOption<E>,
            inputs: {
              SetStep: (payload) => this.setStep(payload),
              ...inputs,
            } as component.InputsOption<I>,
            ...options,
          });
        }

        /** Subclasses can override */
        protected onStepChange(): void {
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
            PanelID.Image,
            this.step.name,
          );

          image.hittest = false;

          this.onStepChange();
        }

        ShowTooltip(): void {
          if (this.step == null) {
            this.warn("Tried to ShowTooltip() without step");
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
