"use strict";

(function(global, context) {
  var Class = global.Class;
  var ComboStep = context.ComboStep;

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

    onSetActive: function() {
      this.$ctx.AddClass("ChallengeComboStepActive");
    },

    onUnsetActive: function() {
      this.$ctx.RemoveClass("ChallengeComboStepActive");
    },

    onSetError: function() {
      this.$ctx.RemoveClass("ChallengeComboStepError");
      this.$ctx.AddClass("ChallengeComboStepError");
    },

    onUnsetError: function() {
      this.$ctx.RemoveClass("ChallengeComboStepError");
    },

    onBump: function() {
      this.$ctx.RemoveClass("ChallengeComboStepBump");
      this.$ctx.AddClass("ChallengeComboStepBump");
    },
  });

  context.comboStep = new ChallengeComboStep();
})(GameUI.CustomUIConfig(), this);
