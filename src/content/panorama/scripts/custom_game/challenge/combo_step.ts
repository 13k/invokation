import type { ComboStepElements, ComboStepInputs } from "../combo_step";
import { ComboStep } from "../combo_step";

export interface ChallengeComboStepInputs extends ComboStepInputs {
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

export type { ChallengeComboStep };

class ChallengeComboStep extends ComboStep<ComboStepElements, ChallengeComboStepInputs> {
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

  onSetActive(_payload: ChallengeComboStepInputs["setStepActive"]) {
    this.panel.AddClass(CssClass.Active);
  }

  onUnsetActive(_payload: ChallengeComboStepInputs["unsetStepActive"]) {
    this.panel.RemoveClass(CssClass.Active);
  }

  onSetError(_payload: ChallengeComboStepInputs["setStepError"]) {
    this.panel.RemoveClass(CssClass.Error);
    this.panel.AddClass(CssClass.Error);
  }

  onUnsetError(_payload: ChallengeComboStepInputs["unsetStepError"]) {
    this.panel.RemoveClass(CssClass.Error);
  }

  onBump(_payload: ChallengeComboStepInputs["stepBump"]) {
    this.panel.RemoveClass(CssClass.Bump);
    this.panel.AddClass(CssClass.Bump);
  }
}

(() => {
  new ChallengeComboStep();
})();
