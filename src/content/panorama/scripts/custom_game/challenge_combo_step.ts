// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace ChallengeComboStep {
      export type Elements = ComboStep.Elements;

      export interface Inputs extends ComboStep.Inputs {
        SetStepActive: Record<string, never>;
        UnsetStepActive: Record<string, never>;
        SetStepError: Record<string, never>;
        UnsetStepError: Record<string, never>;
        StepBump: Record<string, never>;
      }

      export type Outputs = never;
      export type Params = never;

      enum CssClass {
        Active = "ChallengeComboStepActive",
        Error = "ChallengeComboStepError",
        Bump = "ChallengeComboStepBump",
      }

      export class ChallengeComboStep extends ComboStep.ComboStep<
        Elements,
        Inputs,
        Outputs,
        Params
      > {
        constructor() {
          super({
            inputs: {
              SetStep: (payload: Inputs["SetStep"]) => this.setStep(payload),
              SetStepActive: (payload: Inputs["SetStepActive"]) => this.onSetActive(payload),
              UnsetStepActive: (payload: Inputs["UnsetStepActive"]) => this.onUnsetActive(payload),
              SetStepError: (payload: Inputs["SetStepError"]) => this.onSetError(payload),
              UnsetStepError: (payload: Inputs["UnsetStepError"]) => this.onUnsetError(payload),
              StepBump: (payload: Inputs["StepBump"]) => this.onBump(payload),
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
