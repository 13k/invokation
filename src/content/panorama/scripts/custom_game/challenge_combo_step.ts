namespace invk {
  export namespace Components {
    export namespace ChallengeComboStep {
      import ComboStep = invk.Components.ComboStep.ComboStep;

      export interface Inputs extends ComboStep.Inputs {
        setStepActive: undefined;
        unsetStepActive: undefined;
        setStepError: undefined;
        unsetStepError: undefined;
        stepBump: undefined;
      }

      enum CssClass {
        Active = "ChallengeComboStepActive",
        Error = "ChallengeComboStepError",
        Bump = "ChallengeComboStepBump",
      }

      export class ChallengeComboStep extends ComboStep<ComboStep.Elements, Inputs> {
        constructor() {
          super({
            inputs: {
              setStep: (payload) => this.setStep(payload),
              setStepActive: (payload) => this.onSetActive(payload),
              unsetStepActive: (payload) => this.onUnsetActive(payload),
              setStepError: (payload) => this.onSetError(payload),
              unsetStepError: (payload) => this.onUnsetError(payload),
              stepBump: (payload) => this.onBump(payload),
            },
          });
        }

        onSetActive(_payload: Inputs["setStepActive"]) {
          this.panel.AddClass(CssClass.Active);
        }

        onUnsetActive(_payload: Inputs["unsetStepActive"]) {
          this.panel.RemoveClass(CssClass.Active);
        }

        onSetError(_payload: Inputs["setStepError"]) {
          this.panel.RemoveClass(CssClass.Error);
          this.panel.AddClass(CssClass.Error);
        }

        onUnsetError(_payload: Inputs["unsetStepError"]) {
          this.panel.RemoveClass(CssClass.Error);
        }

        onBump(_payload: Inputs["stepBump"]) {
          this.panel.RemoveClass(CssClass.Bump);
          this.panel.AddClass(CssClass.Bump);
        }
      }

      export const component = new ChallengeComboStep();
    }
  }
}
