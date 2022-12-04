import type * as CS from "./combo_step";

export type Elements = CS.Elements;

export interface Inputs {
  SetStepActive: Record<string, never>;
  UnsetStepActive: Record<string, never>;
  SetStepError: Record<string, never>;
  UnsetStepError: Record<string, never>;
  StepBump: Record<string, never>;
}

const { ComboStep } = this as unknown as CS.Context;

enum CssClass {
  Active = "ChallengeComboStepActive",
  Error = "ChallengeComboStepError",
  Bump = "ChallengeComboStepBump",
}

class ChallengeComboStep extends ComboStep<Elements> {
  constructor() {
    super({
      inputs: {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new ChallengeComboStep();

export type { ChallengeComboStep };
