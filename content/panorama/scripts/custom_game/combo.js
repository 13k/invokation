"use strict";

(function(global, context) {
  var _ = global.lodash;
  var EVENTS = global.Const.EVENTS;
  var COMBOS = global.COMBOS;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var StaggeredSequence = global.Sequence.StaggeredSequence;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
  var AddClassAction = global.Sequence.AddClassAction;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var LuaListTableToArray = global.Util.LuaListTableToArray;
  var CreatePanelWithLayout = global.Util.CreatePanelWithLayout;
  var CreateComponent = context.CreateComponent;

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

  var SOUND_EVENTS = {
    success: "kidvoker_takeover_stinger",
    // failure: "General.InvalidTarget_Invulnerable",
    failure: "ui.death_stinger",
  };

  var SPLASH_MAX_INDICES = {
    start: { title: 1, help: 1 },
    success: { title: 2, help: 7 },
    failure: { title: 3, help: 9 },
  };

  var Combo = CreateComponent({
    constructor: function Combo() {
      Combo.super.call(this, {
        elements: [
          "Sequence",
          "Splash",
          "SplashTitle",
          "SplashHelp",
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

      var bumpSeq = this.staggeredSequenceOnStepPanels(
        BUMP_DELAY,
        this.combo.sequence,
        this.bumpStepPanel
      );

      return new Sequence()
        .Action(this.resetSequenceAction())
        .Action(this.createStepPanelsAction())
        .Action(bumpSeq);
    },

    resetSequenceAction: function() {
      return new Sequence().ScrollToTop(this.$sequence).RemoveChildren(this.$sequence);
    },

    createStepPanelsAction: function() {
      var createActions = _.map(
        this.combo.sequence,
        _.bind(this.createStepPanelAction, this, this.$sequence)
      );

      return new Sequence().Action(createActions);
    },

    createStepPanel: function(parent, step) {
      var id = "combo_step_" + step.name + "_" + step.id.toString();
      var panel = CreatePanelWithLayout(parent, id, COMBO_STEP_LAYOUT);

      panel.component.Input("SetStep", { combo: this.combo, step: step });

      this.stepsPanels[step.id] = panel;

      return panel;
    },

    createStepPanelAction: function(parent, step) {
      return new RunFunctionAction(this, this.createStepPanel, parent, step);
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

    sequenceActionsOnStepPanels: function(steps, fn) {
      fn = this.getHandler(fn).bind(this);

      return _.map(steps, function(step) {
        return new RunFunctionAction(fn, step);
      });
    },

    parallelSequenceOnStepPanels: function(steps, fn) {
      return new ParallelSequence().Action(this.sequenceActionsOnStepPanels(steps, fn));
    },

    staggeredSequenceOnStepPanels: function(delay, steps, fn) {
      return new StaggeredSequence(delay).Action(this.sequenceActionsOnStepPanels(steps, fn));
    },

    activateStepPanelsAction: function(steps) {
      var seq = new Sequence();

      if (_.isEmpty(steps)) {
        return seq;
      }

      var activateSeq = this.parallelSequenceOnStepPanels(steps, this.activateStepPanel);

      return seq.RunFunction(this, this.scrollToStepPanel, steps[0]).Action(activateSeq);
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
      var seq = new Sequence();

      if (count < 1) {
        return seq;
      }

      return seq
        .Action(this.showScoreCounterAction())
        .Wait(0.15)
        .Action(this.scoreTickerBumpAction())
        .RunFunction(this, this.counterFxBurstStart)
        .Action(updateCounterDigitsAction(this.$counterTicker, count))
        .Wait(0.15)
        .Action(this.scoreTickerUnbumpAction())
        .RunFunction(this, this.counterFxBurstStop);
    },

    updateSummaryAction: function(count, damage) {
      var seq = new Sequence();

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
      var updateCounterAction = updateCounterDigitsAction(this.$summaryCountDisplay, count);
      var spinAction = spinDamageDigitsAction(
        this.$summaryDamageTicker,
        damage,
        increment,
        callbacks
      );

      return seq
        .Action(updateCounterAction)
        .Action(this.showScoreSummaryAction())
        .Wait(0.15)
        .Action(spinAction);
    },

    showAction: function() {
      return new AddClassAction(this.$ctx, "Open");
    },

    hideAction: function() {
      return new ParallelSequence()
        .Action(this.hideSplashAction())
        .Action(this.hideScoreAction())
        .RemoveClass(this.$ctx, "Open");
    },

    showSplashAction: function(state) {
      var titleIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "title"], 1));
      var helpIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "help"], 1));
      var titleKey = "#invokation_combo_splash_" + state + "_title__" + titleIndex.toString();
      var helpKey = "#invokation_combo_splash_" + state + "_help__" + helpIndex.toString();
      var title = $.Localize(titleKey);
      var help = $.Localize(helpKey);

      var setupActions = new ParallelSequence()
        .SetAttribute(this.$splashTitle, "text", title)
        .SetAttribute(this.$splashHelp, "text", help)
        .RemoveClass(this.$splash, "start")
        .RemoveClass(this.$splash, "success")
        .RemoveClass(this.$splash, "failure")
        .AddClass(this.$splash, state);

      return new Sequence().Action(setupActions).AddClass(this.$splash, "Show");
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
      return new ParallelSequence()
        .RemoveClass(this.$score, "Failed")
        .RemoveClass(this.$score, "ShowCounter")
        .RemoveClass(this.$score, "ShowSummary");
    },

    scoreTickerBumpAction: function() {
      return new AddClassAction(this.$counterTicker, "CounterBump");
    },

    scoreTickerUnbumpAction: function() {
      return new RemoveClassAction(this.$counterTicker, "CounterBump");
    },

    start: function(id, next) {
      this.combo = COMBOS.Get(id);

      var seq = new Sequence()
        .Action(this.hideScoreAction())
        .Action(this.hideSplashAction())
        .Wait(START_DELAY)
        .Action(this.showAction())
        .Action(this.renderSequenceAction())
        .Action(this.showSplashAction("start"))
        .Wait(0.5)
        .RunFunction(this, this.progress, this.combo.id, 0, next);

      this.debugFn(function() {
        return ["start()", { id: this.combo.id, actions: seq.size() }];
      });

      return seq.Start();
    },

    stop: function(id) {
      this.combo = null;

      var seq = new Sequence().Action(this.hideAction());

      this.debugFn(function() {
        return ["stop()", { id: id, actions: seq.size() }];
      });

      return seq.Start();
    },

    progress: function(id, count, next) {
      count = count || 0;
      next = LuaListTableToArray(next);

      var seq = new Sequence();

      if (count > 0) {
        seq.Action(this.hideSplashAction());
      }

      seq
        .Action(this.clearFailedStepPanelsAction(this.combo.sequence))
        .Action(this.deactivateStepPanelsAction(this.combo.sequence))
        .Action(this.activateStepPanelsAction(next))
        .Action(this.updateCounterAction(count));

      this.debugFn(function() {
        return ["progress()", { id: id, count: count, next: next, actions: seq.size() }];
      });

      return seq.Start();
    },

    finish: function(id, count, damage) {
      count = count || 0;
      damage = damage || 0;

      var seq = new Sequence()
        .PlaySoundEffect(SOUND_EVENTS.success)
        .Action(this.showSplashAction("success"))
        .Action(this.deactivateStepPanelsAction(this.combo.sequence))
        .Action(this.bumpStepPanelsAction(this.combo.sequence))
        .Action(this.updateSummaryAction(count, damage));

      this.debugFn(function() {
        return ["finish()", { id: id, count: count, damage: damage, actions: seq.size() }];
      });

      return seq.Start();
    },

    fail: function(id, expected, ability) {
      expected = LuaListTableToArray(expected);

      var seq = new Sequence()
        .PlaySoundEffect(SOUND_EVENTS.failure)
        .Action(this.showSplashAction("failure"))
        .AddClass(this.$score, "Failed")
        .Action(this.failStepPanelsAction(expected))
        .Action(this.bumpStepPanelsAction(expected));

      this.debugFn(function() {
        return ["fail()", { id: id, ability: ability, expected: expected, actions: seq.size() }];
      });

      return seq.Start();
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

    var seq = new Sequence();

    for (var i = 0; i < length; i++) {
      (function() {
        var idx = i;
        var digit = valueRevStr[idx];
        var panelID = container.id + "Digit" + idx.toString();
        var panel = container.FindChild(panelID);
        var digitClass;

        if (panel.__esdigit__ != null) {
          digitClass = "digit_" + panel.__esdigit__;
          seq.RemoveClass(panel, digitClass);
        }

        seq.RemoveClass(panel, "ESDigitHidden");
        panel.__esdigit__ = digit;

        if (digit == null) {
          digitClass = "ESDigitHidden";
        } else {
          digitClass = "digit_" + digit;
        }

        seq.AddClass(panel, digitClass);
      })();
    }

    return seq;
  }

  function spinDigitsAction(container, value, length, increment, callbacks) {
    increment = increment || 1;
    callbacks = callbacks || {};

    var seq = new Sequence();

    for (var n = 0; ; n += increment) {
      if (n > value) n = value;

      (function() {
        var nn = Math.ceil(n);

        seq.Action(updateDigitsAction(container, nn, length));

        if (callbacks.onSpin) {
          seq.RunFunction(callbacks.onSpin, nn);
        }

        seq.Wait(SPIN_DIGITS_INTERVAL);
      })();

      if (n === value) break;
    }

    if (callbacks.onEnd) {
      seq.RunFunction(callbacks.onEnd);
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
