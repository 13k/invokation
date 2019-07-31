"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent,
  LuaListTableToArray = C.Util.LuaListTableToArray,
  EVENTS = C.EVENTS,
  COMBOS = C.COMBOS;

var COMBO_STEP_LAYOUT = "file://{resources}/layout/custom_game/combo_combo_step.xml";

var START_DELAY = 0.5;
var BUMP_DELAY = 0.2;
var COUNTER_DIGITS = 3;
var DAMAGE_DIGITS = 5;
var DAMAGE_SPIN_ITERATIONS = 30;
var SPIN_DIGITS_INTERVAL = 0.05;

var SHAKER_FX_ENTS = {
  // scenes/hud/ui_es_arcana_combo_ambient
  counter: {
    level1: {
      ambient: "combo_ambient_level_1",
      burst2: "combo_burst_2_level_1",
    },
    level2: {
      ambient: "combo_ambient_level_2",
      burst2: "combo_burst_2_level_2",
    },
  },
  // scenes/hud/ui_es_arcana_combo_summary
  summary: {
    level1: {
      ambient: "combo_ambient_level_1",
      burst2_1: "combo_burst_2_level1", // ?
      burst2: "combo_burst_2_level_1",
      burst3: "combo_burst_3_level_1",
    },
    level2: {
      ambient: "combo_ambient_level_2",
      burst1: "combo_burst_1_level_2",
      burst2: "combo_burst_2_level_2",
      burst3: "combo_burst_3_level_2",
    },
  },
};

var Combo = CreateComponent({
  constructor: function Combo() {
    Combo.super.call(this, $.GetContextPanel());

    this.bindElements();
    this.bindEvents();

    this.debug("init");
  },

  bindElements: function() {
    this.$sequence = $("#Sequence");
    this.$splash = $("#Splash");
    this.$score = $("#Score");
    this.$counterTicker = $("#CounterTicker");
    this.$summaryCountDisplay = $("#SummaryCountDisplay");
    this.$summaryDamageTicker = $("#SummaryDamageTicker");
    this.$counterFx = $("#CounterFX");
    this.$summaryFx = $("#SummaryFX");
  },

  bindEvents: function() {
    $.RegisterEventHandler(
      "DOTAScenePanelSceneLoaded",
      this.$counterFx,
      this.onCounterAmbientFxLoaded.bind(this)
    );

    $.RegisterEventHandler(
      "DOTAScenePanelSceneLoaded",
      this.$summaryFx,
      this.onCounterSummaryFxLoaded.bind(this)
    );

    this.subscribe(EVENTS.COMBO_STARTED, this.onComboStarted.bind(this));
    this.subscribe(EVENTS.COMBO_STOPPED, this.onComboStopped.bind(this));
    this.subscribe(EVENTS.COMBO_PROGRESS, this.onComboProgress.bind(this));
    this.subscribe(EVENTS.COMBO_STEP_ERROR, this.onComboStepError.bind(this));
    this.subscribe(EVENTS.COMBO_FINISHED, this.onComboFinished.bind(this));
  },

  onCounterAmbientFxLoaded: function() {
    this.counterFxAmbientStart();
  },

  onCounterSummaryFxLoaded: function() {
    this.summaryFxAmbientStart();
  },

  onComboStarted: function(payload) {
    this.debug("onComboStarted() - ", payload);
    this.start(payload);
  },

  onComboStopped: function(payload) {
    this.debug("onComboStopped() - ", payload);
    this.stop();
  },

  onComboProgress: function(payload) {
    this.debug("onComboProgress() - ", payload);

    this.progress(payload);
  },

  onComboStepError: function(payload) {
    this.debug("onComboStepError() - ", payload);

    var expectedSteps = LuaListTableToArray(payload.expected);

    this.debug("onComboStepError() - expected: ", expectedSteps);

    this.failStepPanels(expectedSteps);
  },

  onComboFinished: function(payload) {
    this.debug("onComboFinished() - ", payload);

    this.playFinishedSound();
    this.deactivateStepPanels();
    this.bumpStepPanels();
    this.updateSummary(payload.count || 0, payload.damage || 0);
  },

  counterFxAmbientStart: function() {
    this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.ambient, "Start", "0");
  },

  counterFxBurstStart: function() {
    this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Start", "0");
  },

  counterFxBurstStop: function() {
    this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Stop", "0");
  },

  summaryFxAmbientStart: function() {
    this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2.ambient, "Start", "0");
  },

  summaryFxBurstStart: function(size) {
    var key = "burst" + size;
    this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Start", "0");
  },

  summaryFxBurstStop: function(size) {
    var key = "burst" + size;
    this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Stop", "0");
  },

  renderSequence: function() {
    var self = this;

    this.stepsPanels = {};
    this.$sequence.RemoveAndDeleteChildren();
    this.$sequence.ScrollToTop();

    $.Each(this.combo.sequence, function(step) {
      var panel = self.createStepPanel(self.$sequence, step);
      self.stepsPanels[step.id] = panel;
    });

    var seq = new RunStaggeredActions(BUMP_DELAY);

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      var input = panel.component.Input.bind(panel.component);
      seq.actions.push(new RunFunctionAction(input, "StepBump"));
    });

    return RunSingleAction(seq);
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
    var seq = new RunSequentialActions();

    $.Each(steps, function(step, i) {
      var panel = self.stepsPanels[step.id];
      var input = panel.component.Input.bind(panel.component);
      seq.actions.push(new RunFunctionAction(input, "SetStepActive"));

      if (i === 0) {
        var scroll = panel.ScrollParentToMakePanelFit.bind(panel);
        seq.actions.push(new RunFunctionAction(scroll, 1, false));
      }
    });

    return RunSingleAction(seq);
  },

  deactivateStepPanels: function() {
    var self = this;
    var seq = new RunParallelActions();

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      var input = panel.component.Input.bind(panel.component);
      seq.actions.push(new RunFunctionAction(input, "UnsetStepActive"));
    });

    return RunSingleAction(seq);
  },

  bumpStepPanels: function() {
    var self = this;
    var seq = new RunParallelActions();

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      var input = panel.component.Input.bind(panel.component);
      seq.actions.push(new RunFunctionAction(input, "StepBump"));
    });

    return RunSingleAction(seq);
  },

  failStepPanels: function(steps) {
    var self = this;
    var seq = new RunParallelActions();

    $.Each(steps, function(step) {
      var panel = self.stepsPanels[step.id];
      var input = panel.component.Input.bind(panel.component);
      seq.actions.push(new RunFunctionAction(input, "SetStepError"));
    });

    return RunSingleAction(seq);
  },

  clearFailedStepPanels: function() {
    var self = this;
    var seq = new RunParallelActions();

    $.Each(this.combo.sequence, function(step) {
      var panel = self.stepsPanels[step.id];
      var input = panel.component.Input.bind(panel.component);
      seq.actions.push(new RunFunctionAction(input, "UnsetStepError"));
    });

    return RunSingleAction(seq);
  },

  updateCounter: function(count) {
    if (count < 1) {
      return;
    }

    var seq = new RunSequentialActions();

    seq.actions.push(new AddClassAction(this.$score, "ShowCounter"));
    seq.actions.push(new WaitAction(0.15));
    seq.actions.push(new AddClassAction(this.$counterTicker, "CounterBump"));
    seq.actions.push(new RunFunctionAction(this.counterFxBurstStart.bind(this)));
    seq.actions.push(new RunFunctionAction(updateCounterDigits, this.$counterTicker, count));
    seq.actions.push(new WaitAction(0.15));
    seq.actions.push(new RemoveClassAction(this.$counterTicker, "CounterBump"));
    seq.actions.push(new RunFunctionAction(this.counterFxBurstStop.bind(this)));

    return RunSingleAction(seq);
  },

  updateSummary: function(count, damage) {
    if (count < 1) {
      return;
    }

    var appliedFx = {};

    var onSpin = function(damage) {
      var burstSize = damageBurstSize(damage);

      if (!appliedFx[burstSize]) {
        this.summaryFxBurstStart(burstSize);
        appliedFx[burstSize] = true;
      }
    };

    var onSpinEnd = function() {
      for (var burstSize in appliedFx) {
        this.summaryFxBurstStop(burstSize);
      }
    };

    var increment = damage / DAMAGE_SPIN_ITERATIONS;
    var callbacks = { onSpin: onSpin.bind(this), onEnd: onSpinEnd.bind(this) };
    var seq = new RunSequentialActions();

    seq.actions.push(new RunFunctionAction(updateCounterDigits, this.$summaryCountDisplay, count));
    seq.actions.push(new AddClassAction(this.$score, "ShowSummary"));
    seq.actions.push(new WaitAction(0.15));
    seq.actions.push(
      new RunFunctionAction(
        spinDamageDigits,
        this.$summaryDamageTicker,
        damage,
        increment,
        callbacks
      )
    );

    return RunSingleAction(seq);
  },

  playFinishedSound: function() {
    var seq = new RunSequentialActions();

    seq.actions.push(
      new RunFunctionAction(function() {
        $.DispatchEvent("PlaySoundEffect", "kidvoker_takeover_stinger");
      })
    );

    return RunSingleAction(seq);
  },

  show: function() {
    this.debug("show()");
    this.$ctx.AddClass("Open");
  },

  hide: function() {
    this.debug("hide()");
    this.hideSplash();
    this.hideScore();
    this.$ctx.RemoveClass("Open");
  },

  showSplash: function() {
    this.$splash.AddClass("Show");
  },

  hideSplash: function() {
    this.$splash.RemoveClass("Show");
  },

  hideScore: function() {
    this.$score.RemoveClass("ShowCounter");
    this.$score.RemoveClass("ShowSummary");
  },

  start: function(payload) {
    this.combo = COMBOS.Get(payload.combo);
    this.debug("start() ", this.combo);

    var seq = new RunSequentialActions();

    seq.actions.push(new RunFunctionAction(this.hideScore.bind(this)));
    seq.actions.push(new WaitAction(START_DELAY));
    seq.actions.push(new RunFunctionAction(this.show.bind(this)));
    seq.actions.push(new RunFunctionAction(this.renderSequence.bind(this)));
    seq.actions.push(new WaitAction(0.5));
    seq.actions.push(new RunFunctionAction(this.showSplash.bind(this)));
    seq.actions.push(new RunFunctionAction(this.onComboProgress.bind(this), payload));

    return RunSingleAction(seq);
  },

  stop: function() {
    this.debug("stop()");
    this.combo = null;
    this.hide();
  },

  progress: function(payload) {
    var nextSteps = LuaListTableToArray(payload.next);
    var count = payload.count || 0;

    if (count > 0) {
      this.hideSplash();
    }

    this.clearFailedStepPanels();
    this.deactivateStepPanels();
    this.activateStepPanels(nextSteps);
    this.updateCounter(count);
  },

  sendStop: function() {
    this.sendServer(EVENTS.COMBO_STOP);
  },

  sendRestart: function(isHardReset) {
    this.sendServer(EVENTS.COMBO_RESTART, { hardReset: isHardReset });
  },

  sendRenderViewer: function(combo) {
    this.sendClientSide(EVENTS.VIEWER_RENDER, { combo: combo });
  },

  Restart: function(isHardReset) {
    this.debug("Restart()");
    this.sendRestart(!!isHardReset);
  },

  Stop: function() {
    this.debug("Stop()");
    this.sendStop();
  },

  ShowDetails: function() {
    this.debug("ShowDetails()");
    this.sendRenderViewer(this.combo);
  },
});

function updateDigits(container, value, length) {
  var valueRevStr = value
    .toString()
    .split("")
    .reverse()
    .join("");

  var seq = new RunSequentialActions();

  for (var i = 0; i < length; i++) {
    (function() {
      var idx = i;
      var digit = valueRevStr[idx];
      var panelID = container.id + "Digit" + idx.toString();
      var panel = container.FindChild(panelID);
      var digitClass;

      if (panel.__esdigit__ != null) {
        digitClass = "digit_" + panel.__esdigit__;
        seq.actions.push(new RemoveClassAction(panel, digitClass));
      }

      seq.actions.push(new RemoveClassAction(panel, "ESDigitHidden"));
      panel.__esdigit__ = digit;

      if (digit == null) {
        digitClass = "ESDigitHidden";
      } else {
        digitClass = "digit_" + digit;
      }

      seq.actions.push(new AddClassAction(panel, digitClass));
    })();
  }

  return RunSingleAction(seq);
}

function spinDigits(container, value, length, increment, callbacks) {
  var seq = new RunSequentialActions();

  increment = increment || 1;
  callbacks = callbacks || {};

  for (var n = 0; ; n += increment) {
    if (n > value) n = value;

    (function() {
      var nn = Math.ceil(n);

      seq.actions.push(new RunFunctionAction(updateDigits, container, nn, length));

      if (callbacks.onSpin) {
        seq.actions.push(new RunFunctionAction(callbacks.onSpin, nn));
      }

      seq.actions.push(new WaitAction(SPIN_DIGITS_INTERVAL));
    })();

    if (n === value) break;
  }

  if (callbacks.onEnd) {
    seq.actions.push(new RunFunctionAction(callbacks.onEnd));
  }

  return RunSingleAction(seq);
}

function updateCounterDigits(container, value) {
  return updateDigits(container, value, COUNTER_DIGITS);
}

function updateDamageDigits(container, value) {
  return updateDigits(container, value, DAMAGE_DIGITS);
}

function spinDamageDigits(container, value, increment, callbacks) {
  return spinDigits(container, value, DAMAGE_DIGITS, increment, callbacks);
}

function damageBurstSize(damage) {
  var burstSize;

  if (damage <= 1000) {
    burstSize = 1;
  } else if (damage <= 2000) {
    burstSize = 2;
  } else {
    burstSize = 3;
  }

  return burstSize;
}

var combo = new Combo();
