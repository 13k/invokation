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
      this.$ctx.AddClass("Orb");
    } else {
      this.$ctx.RemoveClass("Orb");
    }

    this.log("onStepChange() ", this.step.id, " ", this.step.name);
  },

  onSetActive: function() {
    this.$ctx.AddClass("Active");
  },

  onUnsetActive: function() {
    this.$ctx.RemoveClass("Active");
  },

  onSetError: function() {
    this.$ctx.AddClass("Error");
  },

  onUnsetError: function() {
    this.$ctx.RemoveClass("Error");
  },

  bump: function() {
    this.$ctx.RemoveClass("Bump");
    this.$ctx.AddClass("Bump");
  },
});

var comboStep = new ComboComboStep();
