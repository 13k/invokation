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
    this.$descriptionLabel = $("#StepDescription");
  },

  // child components code can override this function
  onStepChange: function() {},

  setStep: function(payload) {
    this.combo = payload.combo;
    this.step = payload.step;

    this.$button.RemoveAndDeleteChildren();

    if (!this.step.required) {
      this.$ctx.AddClass("Optional");
    } else {
      this.$ctx.RemoveClass("Optional");
    }

    var imageType;
    var imageProperty;

    if (this.step.isItem) {
      imageType = "DOTAItemImage";
      imageProperty = "itemname";
    } else {
      imageType = "DOTAAbilityImage";
      imageProperty = "abilityname";
    }

    var image = $.CreatePanel(imageType, this.$button, "StepImage");
    image[imageProperty] = this.step.name;
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
