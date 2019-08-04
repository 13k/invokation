"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var COMBOS = global.COMBOS;
  var LuaListTableToArray = global.Util.LuaListTableToArray;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;
  var RunSequentialActions = context.RunSequentialActions;
  var RunParallelActions = context.RunParallelActions;
  var RunStaggeredActions = context.RunStaggeredActions;
  var RunFunctionAction = context.RunFunctionAction;
  var WaitAction = context.WaitAction;
  var AddClassAction = context.AddClassAction;
  var RemoveClassAction = context.RemoveClassAction;
  var PlaySoundEffectAction = context.PlaySoundEffectAction;
  var RunSingleAction = context.RunSingleAction;

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
      Combo.super.call(this, {
        elements: [
          "Sequence",
          "Splash",
          "Score",
          "CounterTicker",
          "SummaryCountDisplay",
          "SummaryDamageTicker",
          "CounterFX",
          "SummaryFX",
        ],
        customEvents: {
          "!COMBO_STARTED": "onComboStarted",
          "!COMBO_STOPPED": "onComboStopped",
          "!COMBO_PROGRESS": "onComboProgress",
          "!COMBO_STEP_ERROR": "onComboStepError",
          "!COMBO_FINISHED": "onComboFinished",
        },
        elementEvents: {
          counterFx: {
            DOTAScenePanelSceneLoaded: "counterFxAmbientStart",
          },
          summaryFx: {
            DOTAScenePanelSceneLoaded: "summaryFxAmbientStart",
          },
        },
      });

      this.debug("init");
    },

    onComboStarted: function(payload) {
      this.debug("onComboStarted()", payload);
      this.start(payload.combo, payload.next);
    },

    onComboStopped: function(payload) {
      this.debug("onComboStopped()", payload);
      this.stop(payload.combo);
    },

    onComboProgress: function(payload) {
      this.debug("onComboProgress()", payload);
      this.progress(payload.combo, payload.count, payload.next);
    },

    onComboStepError: function(payload) {
      this.debug("onComboStepError()", payload);
      this.fail(payload.combo, payload.expected, payload.ability);
    },

    onComboFinished: function(payload) {
      this.debug("onComboFinished()", payload);
      this.finish(payload.combo, payload.count, payload.damage);
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

    renderSequenceAction: function() {
      this.stepsPanels = {};

      var seq = new RunSequentialActions();

      seq.actions.push(this.resetSequenceAction());
      seq.actions.push(this.createStepPanelsAction());
      seq.actions.push(
        this.staggeredSequenceOnStepPanels(BUMP_DELAY, this.combo.sequence, this.bumpStepPanel)
      );

      return seq;
    },

    resetSequenceAction: function() {
      var scrollToTop = this.$sequence.ScrollToTop.bind(this.$sequence);
      var removeChildren = this.$sequence.RemoveAndDeleteChildren.bind(this.$sequence);
      var seq = new RunSequentialActions();

      seq.actions.push(new RunFunctionAction(scrollToTop));
      seq.actions.push(new RunFunctionAction(removeChildren));

      return seq;
    },

    createStepPanelsAction: function() {
      var seq = new RunSequentialActions();

      seq.actions.push.apply(
        seq.actions,
        _.map(this.combo.sequence, _.bind(this.createStepPanelAction, this, this.$sequence))
      );

      return seq;
    },

    createStepPanel: function(parent, step) {
      var id = "combo_step_" + step.name + "_" + step.id.toString();
      var panel = CreatePanelWithLayout(parent, id, COMBO_STEP_LAYOUT);

      panel.component.Input("SetStep", { combo: this.combo, step: step });

      this.stepsPanels[step.id] = panel;

      return panel;
    },

    createStepPanelAction: function(parent, step) {
      return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
    },

    scrollToStepPanel: function(step) {
      var panel = this.stepsPanels[step.id];
      panel.ScrollParentToMakePanelFit(1, false);
    },

    stepPanelInput: function(step, input) {
      var panel = this.stepsPanels[step.id];
      panel.component.Input(input);
    },

    bumpStepPanel: function(step) {
      return this.stepPanelInput(step, "StepBump");
    },

    activateStepPanel: function(step) {
      return this.stepPanelInput(step, "SetStepActive");
    },

    deactivateStepPanel: function(step) {
      return this.stepPanelInput(step, "UnsetStepActive");
    },

    failStepPanel: function(step) {
      return this.stepPanelInput(step, "SetStepError");
    },

    clearFailedStepPanel: function(step) {
      return this.stepPanelInput(step, "UnsetStepError");
    },

    pushSequenceActionsOnStepPanels: function(seq, steps, fn) {
      fn = this.getHandler(fn).bind(this);

      _.forEach(steps, function(step) {
        seq.actions.push(new RunFunctionAction(fn, step));
      });

      return seq;
    },

    parallelSequenceOnStepPanels: function(steps, fn) {
      var seq = new RunParallelActions();
      this.pushSequenceActionsOnStepPanels(seq, steps, fn);
      return seq;
    },

    staggeredSequenceOnStepPanels: function(delay, steps, fn) {
      var seq = new RunStaggeredActions(delay);
      this.pushSequenceActionsOnStepPanels(seq, steps, fn);
      return seq;
    },

    activateStepPanelsAction: function(steps) {
      var seq = new RunSequentialActions();

      if (_.isEmpty(steps)) {
        return seq;
      }

      var activateSeq = this.parallelSequenceOnStepPanels(steps, this.activateStepPanel);

      seq.actions.push(new RunFunctionAction(this.scrollToStepPanel.bind(this), steps[0]));
      seq.actions.push(activateSeq);

      return seq;
    },

    deactivateStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, this.deactivateStepPanel);
    },

    bumpStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, this.bumpStepPanel);
    },

    failStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, this.failStepPanel);
    },

    clearFailedStepPanelsAction: function(steps) {
      return this.parallelSequenceOnStepPanels(steps, this.clearFailedStepPanel);
    },

    updateCounterAction: function(count) {
      var seq = new RunSequentialActions();

      if (count < 1) {
        return seq;
      }

      seq.actions.push(this.showScoreCounterAction());
      seq.actions.push(new WaitAction(0.15));
      seq.actions.push(this.scoreTickerBumpAction());
      seq.actions.push(new RunFunctionAction(this.counterFxBurstStart.bind(this)));
      seq.actions.push(updateCounterDigitsAction(this.$counterTicker, count));
      seq.actions.push(new WaitAction(0.15));
      seq.actions.push(this.scoreTickerUnbumpAction());
      seq.actions.push(new RunFunctionAction(this.counterFxBurstStop.bind(this)));

      return seq;
    },

    updateSummaryAction: function(count, damage) {
      var seq = new RunSequentialActions();

      if (count < 1) {
        return seq;
      }

      var increment = damage / DAMAGE_SPIN_ITERATIONS;
      var appliedFx = {};

      var onSpin = function(damage) {
        var burstSize = damageBurstSize(damage);

        if (!appliedFx[burstSize]) {
          this.summaryFxBurstStart(burstSize);
          appliedFx[burstSize] = true;
        }
      };

      var onSpinEnd = function() {
        _.forOwn(appliedFx, _.rearg(this.summaryFxBurstStop.bind(this), [1]));
      };

      var callbacks = { onSpin: onSpin.bind(this), onEnd: onSpinEnd.bind(this) };

      seq.actions.push(updateCounterDigitsAction(this.$summaryCountDisplay, count));
      seq.actions.push(this.showScoreSummaryAction());
      seq.actions.push(new WaitAction(0.15));
      seq.actions.push(
        spinDamageDigitsAction(this.$summaryDamageTicker, damage, increment, callbacks)
      );

      return seq;
    },

    playFinishedSoundAction: function() {
      return new PlaySoundEffectAction("kidvoker_takeover_stinger");
    },

    showAction: function() {
      return new AddClassAction(this.$ctx, "Open");
    },

    hideAction: function() {
      var seq = new RunParallelActions();
      seq.actions.push(this.hideSplashAction());
      seq.actions.push(this.hideScoreAction());
      seq.actions.push(new RemoveClassAction(this.$ctx, "Open"));
      return seq;
    },

    showSplashAction: function() {
      return new AddClassAction(this.$splash, "Show");
    },

    hideSplashAction: function() {
      return new RemoveClassAction(this.$splash, "Show");
    },

    showScoreCounterAction: function() {
      return new AddClassAction(this.$score, "ShowCounter");
    },

    showScoreSummaryAction: function() {
      return new AddClassAction(this.$score, "ShowSummary");
    },

    hideScoreAction: function() {
      var seq = new RunParallelActions();
      seq.actions.push(new RemoveClassAction(this.$score, "ShowCounter"));
      seq.actions.push(new RemoveClassAction(this.$score, "ShowSummary"));
      return seq;
    },

    scoreTickerBumpAction: function() {
      return new AddClassAction(this.$counterTicker, "CounterBump");
    },

    scoreTickerUnbumpAction: function() {
      return new RemoveClassAction(this.$counterTicker, "CounterBump");
    },

    start: function(id, next) {
      this.combo = COMBOS.Get(id);
      var seq = new RunSequentialActions();

      seq.actions.push(this.hideScoreAction());
      seq.actions.push(new WaitAction(START_DELAY));
      seq.actions.push(this.showAction());
      seq.actions.push(this.renderSequenceAction());
      seq.actions.push(new WaitAction(0.5));
      seq.actions.push(this.showSplashAction());
      seq.actions.push(new RunFunctionAction(this.progress.bind(this), this.combo.id, 0, next));

      this.debugFn(function() {
        return ["start()", { id: this.combo.id }];
      });

      return RunSingleAction(seq);
    },

    stop: function(id) {
      this.combo = null;
      var seq = new RunSequentialActions();

      seq.actions.push(this.hideAction());

      this.debugFn(function() {
        return ["stop()", { id: id }];
      });

      return RunSingleAction(seq);
    },

    progress: function(id, count, next) {
      count = count || 0;
      next = LuaListTableToArray(next);

      var seq = new RunSequentialActions();

      if (count > 0) {
        seq.actions.push(this.hideSplashAction());
      }

      seq.actions.push(this.clearFailedStepPanelsAction(this.combo.sequence));
      seq.actions.push(this.deactivateStepPanelsAction(this.combo.sequence));
      seq.actions.push(this.activateStepPanelsAction(next));
      seq.actions.push(this.updateCounterAction(count));

      this.debugFn(function() {
        return ["progress()", { id: id, count: count, next: next }];
      });

      return RunSingleAction(seq);
    },

    finish: function(id, count, damage) {
      count = count || 0;
      damage = damage || 0;

      var seq = new RunSequentialActions();

      seq.actions.push(this.playFinishedSoundAction());
      seq.actions.push(this.deactivateStepPanelsAction(this.combo.sequence));
      seq.actions.push(this.bumpStepPanelsAction(this.combo.sequence));
      seq.actions.push(this.updateSummaryAction(count, damage));

      this.debugFn(function() {
        return ["finish()", { id: id, count: count, damage: damage }];
      });

      return RunSingleAction(seq);
    },

    fail: function(id, expected /*, ability*/) {
      expected = LuaListTableToArray(expected);

      var seq = new RunSequentialActions();

      seq.actions.push(this.failStepPanelsAction(expected));

      this.debugFn(function() {
        return ["fail()", { id: id, expected: expected }];
      });

      return RunSingleAction(seq);
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

  function updateDigitsAction(container, value, length) {
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

    return seq;
  }

  function spinDigitsAction(container, value, length, increment, callbacks) {
    var seq = new RunSequentialActions();

    increment = increment || 1;
    callbacks = callbacks || {};

    for (var n = 0; ; n += increment) {
      if (n > value) n = value;

      (function() {
        var nn = Math.ceil(n);

        seq.actions.push(updateDigitsAction(container, nn, length));

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

    return seq;
  }

  function updateCounterDigitsAction(container, value) {
    return updateDigitsAction(container, value, COUNTER_DIGITS);
  }

  function spinDamageDigitsAction(container, value, increment, callbacks) {
    return spinDigitsAction(container, value, DAMAGE_DIGITS, increment, callbacks);
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

  context.combo = new Combo();
})(GameUI.CustomUIConfig(), this);
