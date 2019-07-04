"use strict";

var _step = {};
var _button;

function setStep(step) {
  _step = step;

  if (!step.required) {
    _button.AddClass("Optional");
  }

  var imageType;
  var imageProperty;

  if (_step.name.match(/^item_/)) {
    imageType = "DOTAItemImage";
    imageProperty = "itemname";
  } else {
    imageType = "DOTAAbilityImage";
    imageProperty = "abilityname";
  }

  var image = $.CreatePanel(imageType, _button, "StepImage");

  image[imageProperty] = _step.name;
  image.hittest = false;
}

function ShowTooltip() {
  $.DispatchEvent("DOTAShowAbilityTooltip", $.GetContextPanel(), _step.name);
}

function HideTooltip() {
  $.DispatchEvent("DOTAHideAbilityTooltip", $.GetContextPanel());
}

(function() {
  SetContextData('SetStep', setStep);

  _button = $("#StepIconButton");
})();