"use strict";

var C = GameUI.CustomUIConfig(),
  Class = C.Class;

var ComboComboStep = Class(ComboStep, {
  constructor: function ComboComboStep() {
    ComboComboStep.super.call(this, $.GetContextPanel());

    this.registerInputs({
      SetStepActive: this.onSetActive.bind(this),
      UnsetStepActive: this.onUnsetActive.bind(this),
      SetStepError: this.onSetError.bind(this),
      UnsetStepError: this.onUnsetError.bind(this),
      StepBump: this.bump.bind(this),
    });
  },

  onStepChange: function() {
    if (this.step.isOrbAbility) {
      this.$button.AddClass("Orb");
    } else {
      this.$button.RemoveClass("Orb");
    }
  },

  onSetActive: function() {
    this.$button.AddClass("Active");
  },

  onUnsetActive: function() {
    this.$button.RemoveClass("Active");
  },

  onSetError: function() {
    this.$button.AddClass("Error");
  },

  onUnsetError: function() {
    this.$button.RemoveClass("Error");
  },

  bump: function() {
    this.$ctx.RemoveClass("Bump");
    this.$ctx.AddClass("Bump");
  },
});

var comboStep = new ComboComboStep();
