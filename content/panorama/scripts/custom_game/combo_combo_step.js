"use strict";

(function(global, context) {
  var Class = global.Class;
  var ComboStep = context.ComboStep;

  var ComboComboStep = Class(ComboStep, {
    constructor: function ComboComboStep() {
      ComboComboStep.super.call(this, {
        inputs: {
          SetStepActive: "onSetActive",
          UnsetStepActive: "onUnsetActive",
          SetStepError: "onSetError",
          UnsetStepError: "onUnsetError",
          StepBump: "onBump",
        },
      });
    },

    onStepChange: function() {
      if (this.step.isInvocationAbility) {
        this.$ctx.AddClass("Invocation");
      } else {
        this.$ctx.RemoveClass("Invocation");
      }
    },

    onSetActive: function() {
      this.$ctx.AddClass("Active");
    },

    onUnsetActive: function() {
      this.$ctx.RemoveClass("Active");
    },

    onSetError: function() {
      this.$ctx.RemoveClass("Error");
      this.$ctx.AddClass("Error");
    },

    onUnsetError: function() {
      this.$ctx.RemoveClass("Error");
    },

    onBump: function() {
      this.$ctx.RemoveClass("Bump");
      this.$ctx.AddClass("Bump");
    },
  });

  context.comboStep = new ComboComboStep();
})(GameUI.CustomUIConfig(), this);
