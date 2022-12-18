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
              ...ComboStep.DEFAULT_INPUTS,
              SetStepActive: "onSetActive",
              UnsetStepActive: "onUnsetActive",
              SetStepError: "onSetError",
              UnsetStepError: "onUnsetError",
              StepBump: "onBump",
            },
          });
        }

        onSetActive() {
          this.panel.AddClass(CssClass.Active);
        }

        onUnsetActive() {
          this.panel.RemoveClass(CssClass.Active);
        }

        onSetError() {
          this.panel.RemoveClass(CssClass.Error);
          this.panel.AddClass(CssClass.Error);
        }

        onUnsetError() {
          this.panel.RemoveClass(CssClass.Error);
        }

        onBump() {
          this.panel.RemoveClass(CssClass.Bump);
          this.panel.AddClass(CssClass.Bump);
        }
      }

      export const component = new ChallengeComboStep();
    }
  }
}
