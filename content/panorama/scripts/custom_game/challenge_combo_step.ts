// const { ComboStep } = context;
// const { COMPONENTS } = global.Const;

import { ComboStep } from "./combo_step";

const CLASSES = {
  ACTIVE: "active",
  ERROR: "error",
  BUMP: "bump",
};

export class ChallengeComboStep extends ComboStep {
  constructor() {
    const { inputs } = COMPONENTS.CHALLENGE.COMBO_STEP;

    super({
      inputs: {
        [inputs.BUMP]: "onBump",
        [inputs.SET_ACTIVE]: "onSetActive",
        [inputs.UNSET_ACTIVE]: "onUnsetActive",
        [inputs.SET_ERROR]: "onSetError",
        [inputs.UNSET_ERROR]: "onUnsetError",
      },
    });
  }

  onBump() {
    this.$ctx.RemoveClass(CLASSES.BUMP);
    this.$ctx.AddClass(CLASSES.BUMP);
  }

  onSetActive() {
    this.$ctx.AddClass(CLASSES.ACTIVE);
  }

  onUnsetActive() {
    this.$ctx.RemoveClass(CLASSES.ACTIVE);
  }

  onSetError() {
    this.$ctx.RemoveClass(CLASSES.ERROR);
    this.$ctx.AddClass(CLASSES.ERROR);
  }

  onUnsetError() {
    this.$ctx.RemoveClass(CLASSES.ERROR);
  }
}

//   context.comboStep = new ChallengeComboStep();
// })(GameUI.CustomUIConfig(), this);
