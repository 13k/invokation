"use strict";

var C = GameUI.CustomUIConfig(),
  Class = C.Class;

var ViewerComboStep = Class(ComboStep, {
  constructor: function ViewerComboStep() {
    ViewerComboStep.super.call(this, $.GetContextPanel());
  },
});

var comboStep = new ViewerComboStep();
