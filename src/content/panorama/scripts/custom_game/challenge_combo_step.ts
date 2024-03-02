// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ChallengeComboStep {
      import ComboStep = invk.components.ComboStep.ComboStep;

      export interface Inputs extends ComboStep.Inputs {
        SetStepActive: undefined;
        UnsetStepActive: undefined;
        SetStepError: undefined;
        UnsetStepError: undefined;
        StepBump: undefined;
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
              SetStep: (payload) => this.setStep(payload),
              SetStepActive: (payload) => this.onSetActive(payload),
              UnsetStepActive: (payload) => this.onUnsetActive(payload),
              SetStepError: (payload) => this.onSetError(payload),
              UnsetStepError: (payload) => this.onUnsetError(payload),
              StepBump: (payload) => this.onBump(payload),
            },
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSetActive(_payload: Inputs["SetStepActive"]) {
          this.panel.AddClass(CssClass.Active);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onUnsetActive(_payload: Inputs["UnsetStepActive"]) {
          this.panel.RemoveClass(CssClass.Active);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSetError(_payload: Inputs["SetStepError"]) {
          this.panel.RemoveClass(CssClass.Error);
          this.panel.AddClass(CssClass.Error);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onUnsetError(_payload: Inputs["UnsetStepError"]) {
          this.panel.RemoveClass(CssClass.Error);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onBump(_payload: Inputs["StepBump"]) {
          this.panel.RemoveClass(CssClass.Bump);
          this.panel.AddClass(CssClass.Bump);
        }
      }

      export const component = new ChallengeComboStep();
    }
  }
}
