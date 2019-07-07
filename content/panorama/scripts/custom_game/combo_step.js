"use strict";

// "client" code can override this function
function onStepChange() {}

function setStep(step) {
  SetContextData("_step", step);

  var button = GetContextData("_button");

  button.RemoveAndDeleteChildren();

  if (!step.required) {
    button.AddClass("Optional");
  } else {
    button.RemoveClass("Optional");
  }

  var imageType;
  var imageProperty;

  if (step.name.match(/^item_/)) {
    imageType = "DOTAItemImage";
    imageProperty = "itemname";
  } else {
    imageType = "DOTAAbilityImage";
    imageProperty = "abilityname";
  }

  var image = $.CreatePanel(imageType, button, "StepImage");
  image[imageProperty] = step.name;
  image.hittest = false;

  if (onStepChange) {
    onStepChange();
  }
}

function ShowTooltip() {
  var step = GetContextData("_step");
  $.DispatchEvent("DOTAShowAbilityTooltip", $.GetContextPanel(), step.name);
}

function HideTooltip() {
  $.DispatchEvent("DOTAHideAbilityTooltip", $.GetContextPanel());
}

(function() {
  UpdateContextData({
    SetStep: setStep,
    _button: $("#StepIconButton"),
  });
})();
