// Abstract ComboStep component.
// Should be included in actual component layout and subclassed.

"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent;

var ComboStep = CreateComponent({
  constructor: function ComboStep() {
    ComboStep.super.call(this, $.GetContextPanel());

    this.registerInput("SetStep", this.setStep.bind(this));
    this.bindElements();
  },

  bindElements: function() {
    this.$button = $("#StepIconButton");
  },

  // child components code can override this function
  onStepChange: function() {},

  setStep: function(step) {
    this.step = step;

    this.$button.RemoveAndDeleteChildren();

    if (!step.required) {
      this.$button.AddClass("Optional");
    } else {
      this.$button.RemoveClass("Optional");
    }

    var imageType;
    var imageProperty;

    if (step.isItem) {
      imageType = "DOTAItemImage";
      imageProperty = "itemname";
    } else {
      imageType = "DOTAAbilityImage";
      imageProperty = "abilityname";
    }

    var image = $.CreatePanel(imageType, this.$button, "StepImage");
    image[imageProperty] = step.name;
    image.hittest = false;

    this.onStepChange();
  },

  ShowTooltip: function() {
    $.DispatchEvent("DOTAShowAbilityTooltip", this.$ctx, this.step.name);
  },

  HideTooltip: function() {
    $.DispatchEvent("DOTAHideAbilityTooltip", this.$ctx);
  },
});
