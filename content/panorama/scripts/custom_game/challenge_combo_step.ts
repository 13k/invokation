import { ComboStep, Inputs as BaseInputs, Outputs as BaseOutputs } from "./combo_step";
import { COMPONENTS } from "./lib/const/component";

export interface Inputs extends BaseInputs {
  [INPUTS.BUMP]: never;
  [INPUTS.SET_ACTIVE]: never;
  [INPUTS.UNSET_ACTIVE]: never;
  [INPUTS.SET_ERROR]: never;
  [INPUTS.UNSET_ERROR]: never;
}

export type Outputs = BaseOutputs;

const { inputs: INPUTS } = COMPONENTS.CHALLENGE_COMBO_STEP;

const CLASSES = {
  ACTIVE: "active",
  ERROR: "error",
  BUMP: "bump",
};

export class ChallengeComboStep extends ComboStep {
  constructor() {
    super();

    this.registerInputs({
      [INPUTS.BUMP]: this.onBump,
      [INPUTS.SET_ACTIVE]: this.onSetActive,
      [INPUTS.UNSET_ACTIVE]: this.onUnsetActive,
      [INPUTS.SET_ERROR]: this.onSetError,
      [INPUTS.UNSET_ERROR]: this.onUnsetError,
    });
  }

  onBump(): void {
    this.ctx.RemoveClass(CLASSES.BUMP);
    this.ctx.AddClass(CLASSES.BUMP);
  }

  onSetActive(): void {
    this.ctx.AddClass(CLASSES.ACTIVE);
  }

  onUnsetActive(): void {
    this.ctx.RemoveClass(CLASSES.ACTIVE);
  }

  onSetError(): void {
    this.ctx.RemoveClass(CLASSES.ERROR);
    this.ctx.AddClass(CLASSES.ERROR);
  }

  onUnsetError(): void {
    this.ctx.RemoveClass(CLASSES.ERROR);
  }
}

//   context.comboStep = new ChallengeComboStep();
// })(GameUI.CustomUIConfig(), this);
