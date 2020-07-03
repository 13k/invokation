"use strict";

(function (global, context) {
  var Class = global.Class;
  var ComboStep = context.ComboStep;

  var CLASSES = {
    ACTIVE: "ChallengeComboStepActive",
    ERROR: "ChallengeComboStepError",
    BUMP: "ChallengeComboStepBump",
  };

  var ChallengeComboStep = Class(ComboStep, {
    constructor: function ChallengeComboStep() {
      ChallengeComboStep.super.call(this, {
        inputs: {
          SetStepActive: "onSetActive",
          UnsetStepActive: "onUnsetActive",
          SetStepError: "onSetError",
          UnsetStepError: "onUnsetError",
          StepBump: "onBump",
        },
      });
    },

    onSetActive: function () {
      this.$ctx.AddClass(CLASSES.ACTIVE);
    },

    onUnsetActive: function () {
      this.$ctx.RemoveClass(CLASSES.ACTIVE);
    },

    onSetError: function () {
      this.$ctx.RemoveClass(CLASSES.ERROR);
      this.$ctx.AddClass(CLASSES.ERROR);
    },

    onUnsetError: function () {
      this.$ctx.RemoveClass(CLASSES.ERROR);
    },

    onBump: function () {
      this.$ctx.RemoveClass(CLASSES.BUMP);
      this.$ctx.AddClass(CLASSES.BUMP);
    },
  });

  context.comboStep = new ChallengeComboStep();
})(GameUI.CustomUIConfig(), this);
