"use strict";

((_global, context) => {
  const { ComboStep } = context;

  const CLASSES = {
    ACTIVE: "active",
    ERROR: "error",
    BUMP: "bump",
  };

  class ChallengeComboStep extends ComboStep {
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

    onBump() {
      this.$ctx.RemoveClass(CLASSES.BUMP);
      this.$ctx.AddClass(CLASSES.BUMP);
    }
  }

  context.comboStep = new ChallengeComboStep();
})(GameUI.CustomUIConfig(), this);
