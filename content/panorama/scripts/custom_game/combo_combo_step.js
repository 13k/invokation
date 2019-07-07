"use strict";

function onStepChange() {
  var button = GetContextData("_button");
  var step = GetContextData("_step");

  if (step.name.match(/_(quas|wex|exort)$/)) {
    button.AddClass("Orb");
  } else {
    button.RemoveClass("Orb");
  }
}

function onSetActive() {
  var button = GetContextData("_button");
  button.AddClass("Active");
}

function onUnsetActive() {
  var button = GetContextData("_button");
  button.RemoveClass("Active");
}

function onSetError() {
  var button = GetContextData("_button");
  button.AddClass("Error");
}

function onUnsetError() {
  var button = GetContextData("_button");
  button.RemoveClass("Error");
}

function Boink() {
  $.GetContextPanel().AddClass("Boink");
}

(function() {
  UpdateContextData({
    SetStepActive: onSetActive,
    UnsetStepActive: onUnsetActive,
    SetStepError: onSetError,
    UnsetStepError: onUnsetError,
    Boink: Boink,
  });
})();
