"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  LuaListTableToArray = C.Util.LuaListTableToArray,
  EVENTS = C.EVENTS,
  COMBOS = C.COMBOS;

var COMBO_STEP_LAYOUT =
  "file://{resources}/layout/custom_game/combo_combo_step.xml";

var START_DELAY = 0.5;
var BUMP_DELAY = 0.2;
var COUNTER_DIGITS = 3;
var DAMAGE_DIGITS = 5;
var DAMAGE_SPIN_ITERATIONS = 30;
var SPIN_DIGITS_INTERVAL = 0.05;

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

function spinDamageDigits(container, value, increment, callbacks) {
  var i = 0;

  for (var n = 0; ; n += increment, i++) {
    if (n > value) n = value;

    (function() {
      var nn = Math.ceil(n);

      $.Schedule(SPIN_DIGITS_INTERVAL * i, function() {
        updateDamageDigits(container, nn);
        if (callbacks.onSpin) callbacks.onSpin(nn);
      });
    })();

    if (n === value) break;
  }

  if (callbacks.onEnd) {
    $.Schedule(SPIN_DIGITS_INTERVAL * (i + 1), function() {
      callbacks.onEnd();
    });
  }
}

var Combo = CreateComponent({
  constructor: function Combo() {
    Combo.super.call(this, $.GetContextPanel());

    this.bindElements();
    this.bindEvents();

    this.log("init");
  },

  bindElements: function() {
    this.$combo = $("#Combo");
    this.$sequenceContainer = $("#SequenceContainer");
    this.$comboCounterRoot = $("#ComboCount");
    this.$comboCounter = $("#ComboCounter");
    this.$comboSummaryCounter = $("#ComboSummaryCounter");
    this.$comboSummaryDamage = $("#ComboDamage");
    // combo_ambient_level_1
    // combo_ambient_level_2
    // combo_burst_2_level_1
    // combo_burst_2_level_2
    this.$counterAmbientFx = $("#ComboAmbientFX");
    // combo_ambient_level_1
    // combo_ambient_level_2
    // combo_burst_2_level1
    // combo_burst_2_level_1
    // combo_burst_3_level_1
    // combo_burst_1_level_2
    // combo_burst_2_level_2
    // combo_burst_3_level_2
    this.$counterSummaryFx = $("#ComboSummaryFX");
  },

  bindEvents: function() {
    $.RegisterEventHandler(
      "DOTAScenePanelSceneLoaded",
      this.$counterAmbientFx,
      this.onCounterAmbientFxLoaded.bind(this)
    );

    $.RegisterEventHandler(
      "DOTAScenePanelSceneLoaded",
      this.$counterSummaryFx,
      this.onCounterSummaryFxLoaded.bind(this)
    );

    this.subscribe(EVENTS.COMBO_STARTED, this.onComboStarted.bind(this));
    this.subscribe(EVENTS.COMBO_STOPPED, this.onComboStopped.bind(this));
    this.subscribe(EVENTS.COMBO_PROGRESS, this.onComboProgress.bind(this));
    this.subscribe(EVENTS.COMBO_STEP_ERROR, this.onComboStepError.bind(this));
    this.subscribe(EVENTS.COMBO_FINISHED, this.onComboFinished.bind(this));
  },

  onCounterAmbientFxLoaded: function() {
    this.$counterAmbientFx.FireEntityInput(
      "combo_ambient_level_2",
      "Start",
      "0"
    );
  },

  onCounterSummaryFxLoaded: function() {
    this.$counterSummaryFx.FireEntityInput(
      "combo_ambient_level_2",
      "Start",
      "0"
    );
  },

  onComboStarted: function(payload) {
    this.log("onComboStarted() - ", payload);
    this.start(payload);
  },

  onComboStopped: function(payload) {
    this.log("onComboStopped() - ", payload);
    this.stop();
  },

  onComboProgress: function(payload) {
    this.log("onComboProgress() - ", payload);

    var nextSteps = LuaListTableToArray(payload.next);

    this.log("onComboProgress() - next: ", nextSteps);

    this.clearFailedStepPanels();
    this.deactivateStepPanels();
    this.activateStepPanels(nextSteps);
    this.updateCounter(payload.count || 0);
  },

  onComboStepError: function(payload) {
    this.log("onComboStepError() - ", payload);

    var expectedSteps = LuaListTableToArray(payload.expected);

    this.log("onComboStepError() - expected: ", expectedSteps);

    this.failStepPanels(expectedSteps);
  },

  onComboFinished: function(payload) {
    this.log("onComboFinished() - ", payload);

    this.deactivateStepPanels();
    this.bumpStepPanels();
    this.updateSummary(payload.count || 0, payload.damage || 0);
  },

  renderSequence: function() {
    var self = this;
    this.stepsPanels = {};
    this.$sequenceContainer.RemoveAndDeleteChildren();

    $.Each(this.combo.sequence, function(step, i) {
      var panel = self.createStepPanel(self.$sequenceContainer, step);

      self.stepsPanels[step.id] = panel;

      $.Schedule(BUMP_DELAY * i, function() {
        panel.component.Input("StepBump");
      });
    });
  },

  createStepPanel: function(parent, step) {
    var id = "combo_step_" + step.name + "_" + step.id.toString();
    var panel = $.CreatePanel("Panel", parent, id);

    panel.BLoadLayout(COMBO_STEP_LAYOUT, false, false);
    panel.component.Input("SetStep", { combo: this.combo, step: step });

    return panel;
  },

  activateStepPanels: function(steps) {
    var self = this;

    $.Each(steps, function(step) {
      var panel = self.stepsPanels[step.id];
      panel.component.Input("SetStepActive");
    });
  },

  deactivateStepPanels: function() {
    var self = this;

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      panel.component.Input("UnsetStepActive");
    });
  },

  bumpStepPanels: function() {
    var self = this;

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      panel.component.Input("StepBump");
    });
  },

  failStepPanels: function(steps) {
    var self = this;

    $.Each(steps, function(step) {
      var panel = self.stepsPanels[step.id];
      panel.component.Input("SetStepError");
    });
  },

  clearFailedStepPanels: function() {
    var self = this;

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      panel.component.Input("UnsetStepError");
    });
  },

  updateCounter: function(count) {
    if (count < 1) {
      return;
    }

    var self = this;

    updateCounterDigits(this.$comboCounter, count);

    this.$comboCounterRoot.AddClass("ShowComboCount");
    this.$counterAmbientFx.FireEntityInput(
      "combo_burst_2_level_2",
      "Start",
      "0"
    );
    this.$comboCounter.AddClass("CounterBump");

    $.Schedule(0.15, function() {
      self.$comboCounter.RemoveClass("CounterBump");
      self.$counterAmbientFx.FireEntityInput(
        "combo_burst_2_level_2",
        "Stop",
        "0"
      );
    });
  },

  updateSummary: function(count, damage) {
    if (count < 1) {
      return;
    }

    var self = this;

    updateCounterDigits(this.$comboSummaryCounter, count);

    this.$comboCounterRoot.AddClass("ShowComboSummary");

    var onSpin = function(n) {
      self.$counterSummaryFx.FireEntityInput(
        "combo_burst_3_level_2",
        "Start",
        "0"
      );
    };

    var onSpinEnd = function() {
      self.$counterSummaryFx.FireEntityInput(
        "combo_burst_3_level_2",
        "Stop",
        "0"
      );
    };

    var increment = damage / DAMAGE_SPIN_ITERATIONS;

    $.Schedule(0.01, function() {
      spinDamageDigits(self.$comboSummaryDamage, damage, increment, {
        onSpin: onSpin,
        onEnd: onSpinEnd,
      });
    });
  },

  show: function() {
    this.log("show()");
    this.$combo.RemoveClass("Hide");
  },

  hide: function() {
    this.log("hide()");
    this.$combo.AddClass("Hide");
    this.hideCounterRoot();
  },

  hideCounterRoot: function() {
    this.$comboCounterRoot.RemoveClass("ShowComboCount");
    this.$comboCounterRoot.RemoveClass("ShowComboSummary");
  },

  start: function(payload) {
    var self = this;

    this.combo = COMBOS.Get(payload.combo);

    this.log("start() ", this.combo);
    this.hideCounterRoot();

    $.Schedule(START_DELAY, function() {
      self.show();
      self.renderSequence();
      self.onComboProgress({ next: payload.next });
    });
  },

  stop: function() {
    this.log("stop()");
    this.combo = null;
    this.hide();
  },

  sendStop: function() {
    this.sendServer(EVENTS.COMBO_STOP);
  },

  sendRestart: function() {
    this.sendServer(EVENTS.COMBO_RESTART, { combo: this.combo.id });
  },

  Restart: function() {
    this.log("Restart()");
    this.sendRestart();
  },

  Stop: function() {
    this.log("Stop()");
    this.sendStop();
  },
});

var combo = new Combo();
