"use strict";

var COMBO_STEP_LAYOUT =
  "file://{resources}/layout/custom_game/combo_combo_step.xml";

var START_DELAY = 0.5;
var BUMP_DELAY = 0.2;
var COUNTER_DIGITS = 3;
var DAMAGE_DIGITS = 5;
var DAMAGE_SPIN_ITERATIONS = 30;

var _combo;
var _sequenceContainer;
var _stepsPanels = {};
var _comboCounterRoot;
var _comboCounter;
var _comboSummaryCounter;
var _comboSummaryDamage;
var _counterAmbientFx;
var _counterSummaryFx;

function onComboStarted(payload) {
  L("onComboStarted() - ", payload);
  start(payload);
}

function onComboStopped(payload) {
  L("onComboStopped() - ", payload);
  stop();
}

function onComboProgress(payload) {
  L("onComboProgress() - ", payload);

  var nextSteps = LuaListTableToArray(payload.next);

  L("onComboProgress() - next: ", nextSteps);

  clearFailedStepPanels();
  deactivateStepPanels();
  activateStepPanels(nextSteps);
  updateCounter(payload.count || 0);
}

function onComboStepError(payload) {
  L("onComboStepError() - ", payload);

  var expectedSteps = LuaListTableToArray(payload.expected);

  L("onComboStepError() - expected: ", expectedSteps);

  failStepPanels(expectedSteps);
}

function onComboFinished(payload) {
  L("onComboFinished() - ", payload);

  deactivateStepPanels();
  bumpStepPanels();
  updateSummary(payload.count || 0, payload.damage || 0);
}

function renderSequence() {
  var combo = GetContextData("_combo");

  _stepsPanels = {};
  _sequenceContainer.RemoveAndDeleteChildren();

  $.Each(combo.sequence, function(step, i) {
    var panel = createStepPanel(_sequenceContainer, step);

    _stepsPanels[step.id] = panel;

    $.Schedule(BUMP_DELAY * i, function() {
      panel.data.StepBump();
    });
  });
}

function createStepPanel(parent, step) {
  var id = "combo_step_" + step.name + "_" + step.id.toString();
  var panel = $.CreatePanel("Panel", parent, id);

  panel.BLoadLayout(COMBO_STEP_LAYOUT, false, false);
  panel.data.SetStep(step);

  return panel;
}

function activateStepPanels(steps) {
  $.Each(steps, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.SetStepActive();
  });
}

function deactivateStepPanels() {
  var combo = GetContextData("_combo");

  $.Each(combo.sequence, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.UnsetStepActive();
  });
}

function bumpStepPanels() {
  var combo = GetContextData("_combo");

  $.Each(combo.sequence, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.StepBump();
  });
}

function failStepPanels(steps) {
  $.Each(steps, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.SetStepError();
  });
}

function clearFailedStepPanels() {
  var combo = GetContextData("_combo");

  $.Each(combo.sequence, function(step) {
    var panel = _stepsPanels[step.id];
    panel.data.UnsetStepError();
  });
}

function updateDigits(container, value, length) {
  var valueStr = value
    .toString()
    .split("")
    .reverse()
    .join("");

  for (var i = 0; i < length; i++) {
    var digit = valueStr[i];
    var digitPanelID = container.id + "Digit" + i.toString();
    var digitPanel = container.FindChild(digitPanelID);

    if (digitPanel.__esdigit__ != null) {
      digitPanel.RemoveClass("digit_" + digitPanel.__esdigit__);
    }

    digitPanel.RemoveClass("ESDigitHidden");
    digitPanel.__esdigit__ = digit;

    if (digit == null) {
      digitPanel.AddClass("ESDigitHidden");
    } else {
      digitPanel.AddClass("digit_" + digit);
    }
  }
}

function updateCounterDigits(container, value) {
  return updateDigits(container, value, COUNTER_DIGITS);
}

function updateDamageDigits(container, value) {
  return updateDigits(container, value, DAMAGE_DIGITS);
}

function updateCounter(count) {
  if (count < 1) {
    return;
  }

  updateCounterDigits(_comboCounter, count);

  _comboCounterRoot.AddClass("ShowComboCount");
  _counterAmbientFx.FireEntityInput("combo_burst_2_level_2", "Start", "0");
  _comboCounter.AddClass("CounterBump");

  $.Schedule(0.15, function() {
    _comboCounter.RemoveClass("CounterBump");
    _counterAmbientFx.FireEntityInput("combo_burst_2_level_2", "Stop", "0");
  });
}

function updateSummary(count, damage) {
  if (count < 1) {
    return;
  }

  updateCounterDigits(_comboSummaryCounter, count);

  _comboCounterRoot.AddClass("ShowComboSummary");

  var onSpin = function(n) {
    _counterSummaryFx.FireEntityInput("combo_burst_3_level_2", "Start", "0");
  };

  var onSpinEnd = function() {
    _counterSummaryFx.FireEntityInput("combo_burst_3_level_2", "Stop", "0");
  };

  var increment = damage / DAMAGE_SPIN_ITERATIONS;

  $.Schedule(0.01, function() {
    spinDamageDigits(_comboSummaryDamage, damage, increment, {
      onSpin: onSpin,
      onEnd: onSpinEnd,
    });
  });
}

function spinDamageDigits(container, value, increment, callbacks) {
  var i = 0;

  for (var n = 0; ; n += increment, i++) {
    if (n > value) {
      n = value;
    }

    (function() {
      var nn = Math.ceil(n);

      $.Schedule(0.05 * i, function() {
        updateDamageDigits(container, nn);

        if (callbacks.onSpin) {
          callbacks.onSpin(nn);
        }
      });
    })();

    if (n === value) {
      break;
    }
  }

  if (callbacks.onEnd) {
    $.Schedule(0.05 * (i + 1), function() {
      callbacks.onEnd();
    });
  }
}

function show() {
  L("show()");
  _combo.RemoveClass("Hide");
}

function hide() {
  L("hide()");
  _combo.AddClass("Hide");
  hideCounterRoot();
}

function hideCounterRoot() {
  _comboCounterRoot.RemoveClass("ShowComboCount");
  _comboCounterRoot.RemoveClass("ShowComboSummary");
}

function start(payload) {
  var combo = CombosCollection.Get(payload.combo);

  L("start() ", combo);
  SetContextData("_combo", combo);

  hideCounterRoot();

  $.Schedule(START_DELAY, function() {
    show();
    renderSequence();
    onComboProgress({ next: payload.next });
  });
}

function stop() {
  L("stop()");
  SetContextData("_combo", null);
  hide();
}

function sendStop() {
  CustomEvents.SendServer(EVENT_COMBO_STOP);
}

function sendRestart() {
  var combo = GetContextData("_combo");
  CustomEvents.SendServer(EVENT_COMBO_RESTART, { combo: combo.name });
}

function Restart() {
  L("Restart()");
  sendRestart();
}

function Stop() {
  L("Stop()");
  sendStop();
}

(function() {
  _combo = $("#Combo");
  _sequenceContainer = $("#SequenceContainer");
  _comboCounterRoot = $("#ComboCount");
  _comboCounter = $("#ComboCounter");
  _comboSummaryCounter = $("#ComboSummaryCounter");
  _comboSummaryDamage = $("#ComboDamage");
  // combo_ambient_level_1
  // combo_ambient_level_2
  // combo_burst_2_level_1
  // combo_burst_2_level_2
  _counterAmbientFx = $("#ComboAmbientFX");
  // combo_ambient_level_1
  // combo_ambient_level_2
  // combo_burst_2_level1
  // combo_burst_2_level_1
  // combo_burst_3_level_1
  // combo_burst_1_level_2
  // combo_burst_2_level_2
  // combo_burst_3_level_2
  _counterSummaryFx = $("#ComboSummaryFX");

  $.RegisterEventHandler(
    "DOTAScenePanelSceneLoaded",
    _counterAmbientFx,
    function() {
      _counterAmbientFx.FireEntityInput("combo_ambient_level_2", "Start", "0");
    }
  );

  $.RegisterEventHandler(
    "DOTAScenePanelSceneLoaded",
    _counterSummaryFx,
    function() {
      _counterSummaryFx.FireEntityInput("combo_ambient_level_2", "Start", "0");
    }
  );

  CombosCollection.Load();

  CustomEvents.Subscribe(EVENT_COMBO_STARTED, onComboStarted);
  CustomEvents.Subscribe(EVENT_COMBO_STOPPED, onComboStopped);
  CustomEvents.Subscribe(EVENT_COMBO_PROGRESS, onComboProgress);
  CustomEvents.Subscribe(EVENT_COMBO_STEP_ERROR, onComboStepError);
  CustomEvents.Subscribe(EVENT_COMBO_FINISHED, onComboFinished);

  L("init");
})();
