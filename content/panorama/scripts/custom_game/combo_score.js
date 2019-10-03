"use strict";

(function(global, context) {
  var _ = global.lodash;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var StaggeredSequence = global.Sequence.StaggeredSequence;
  var AddClassAction = global.Sequence.AddClassAction;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var CreateComponent = context.CreateComponent;

  var DAMAGE_SPIN_ITERATIONS = 30;
  var SPIN_DIGITS_INTERVAL = 0.05;
  var BURST_INTENSITY_THRESHOLDS = [1000, 2000];

  var DIGIT_CLASS = "ComboScoreDigit";
  var DIGIT_HIDDEN_CLASS = "ComboScoreDigitHidden";
  var COUNTER_BUMP_CLASS = "CounterBump";
  var COUNTER_SHOW_CLASS = "ShowCounter";
  var SUMMARY_SHOW_CLASS = "ShowSummary";

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

  function digitClass(digit) {
    return "digit_" + String(digit);
  }

  var ComboScore = CreateComponent({
    constructor: function ComboScore() {
      ComboScore.super.call(this, {
        elements: {
          counterTicker: "ComboScoreCounterTicker",
          summaryCountDisplay: "ComboScoreSummaryCountDisplay",
          summaryDamageTicker: "ComboScoreSummaryDamageTicker",
          counterFx: "ComboScoreCounterFX",
          summaryFx: "ComboScoreSummaryFX",
        },
        elementEvents: {
          counterFx: {
            DOTAScenePanelSceneLoaded: "counterFxAmbientStart",
          },
          summaryFx: {
            DOTAScenePanelSceneLoaded: "summaryFxAmbientStart",
          },
        },
        inputs: {
          UpdateCounter: "updateCounter",
          UpdateSummary: "updateSummary",
          Hide: "hide",
        },
      });

      this.spinDigitsInterval = SPIN_DIGITS_INTERVAL;
      this.damageSpinIterations = DAMAGE_SPIN_ITERATIONS;
      this.burstIntensityThresholds = BURST_INTENSITY_THRESHOLDS.sort();

      this.debug("init");
    },

    // ----- Helpers -----

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

    summaryFxBurstStart: function(intensity) {
      var key = "burst" + intensity;
      this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Start", "0");
    },

    summaryFxBurstStop: function(intensity) {
      var key = "burst" + intensity;
      this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Stop", "0");
    },

    burstIntensity: function(value) {
      return _.sortedIndex(this.burstIntensityThresholds, value) + 1;
    },

    // ----- Actions -----

    updateDigitsAction: function(container, value) {
      var valueRevStr = value
        .toString()
        .split("")
        .reverse()
        .join("");

      var panels = container.FindChildrenWithClassTraverse(DIGIT_CLASS);
      var seq = new Sequence();

      for (var i = 0; i < panels.length; i++) {
        (function() {
          var idx = i;
          var digit = valueRevStr[idx];
          var panel = panels[idx];
          var panelClass;

          if (panel.__digit__ != null) {
            seq.RemoveClass(panel, digitClass(panel.__digit__));
          }

          seq.RemoveClass(panel, DIGIT_HIDDEN_CLASS);
          panel.__digit__ = digit;

          if (digit == null) {
            panelClass = DIGIT_HIDDEN_CLASS;
          } else {
            panelClass = digitClass(digit);
          }

          seq.AddClass(panel, panelClass);
        })();
      }

      return seq;
    },

    spinDigitsAction: function(options) {
      options = _.assign(
        {
          start: 0,
          end: 0,
          increment: 1,
          interval: 100,
          callbacks: {},
        },
        options
      );

      var seq = new StaggeredSequence(options.interval);

      for (var n = options.start; ; n += options.increment) {
        if (n > options.end) n = options.end;

        (function() {
          var nn = Math.ceil(n);
          var updateSeq = new Sequence().Action(this.updateDigitsAction(options.container, nn));

          if (_.isFunction(options.callbacks.onSpin)) {
            updateSeq.RunFunction(options.callbacks.onSpin, nn);
          }

          seq.Action(updateSeq);
        }.call(this));

        if (n === options.end) break;
      }

      if (_.isFunction(options.callbacks.onEnd)) {
        seq.RunFunction(options.callbacks.onEnd);
      }

      return seq;
    },

    updateCounterDigitsAction: function(value) {
      return this.updateDigitsAction(this.$counterTicker, value);
    },

    updateSummaryCounterDigitsAction: function(count) {
      return this.updateDigitsAction(this.$summaryCountDisplay, count);
    },

    spinSummaryDamageDigitsAction: function(options) {
      options = _.assign(
        {
          start: 0,
          end: 0,
          iterations: 10,
          callbacks: {},
        },
        options
      );

      options.increment = options.increment || (options.end - options.start) / options.iterations;

      var appliedFx = {};

      options.callbacks.onSpin = function(damage) {
        var intensity = this.burstIntensity(damage);

        if (!appliedFx[intensity]) {
          this.summaryFxBurstStart(intensity);
          appliedFx[intensity] = true;
        }
      }.bind(this);

      options.callbacks.onSpinEnd = function() {
        _.forOwn(appliedFx, _.rearg(this.summaryFxBurstStop.bind(this), [1]));
      }.bind(this);

      return this.spinDigitsAction(options);
    },

    bumpCounterTickerAction: function() {
      return new AddClassAction(this.$counterTicker, COUNTER_BUMP_CLASS);
    },

    unbumpCounterTickerAction: function() {
      return new RemoveClassAction(this.$counterTicker, COUNTER_BUMP_CLASS);
    },

    showCounterAction: function() {
      return new AddClassAction(this.$ctx, COUNTER_SHOW_CLASS);
    },

    hideCounterAction: function() {
      return new RemoveClassAction(this.$ctx, COUNTER_SHOW_CLASS);
    },

    updateCounterAction: function(count) {
      var seq = new Sequence();

      if (count < 1) {
        return seq;
      }

      return seq
        .Action(this.showCounterAction())
        .Wait(0.15)
        .Action(this.bumpCounterTickerAction())
        .RunFunction(this, this.counterFxBurstStart)
        .Action(this.updateCounterDigitsAction(count))
        .Wait(0.15)
        .Action(this.unbumpCounterTickerAction())
        .RunFunction(this, this.counterFxBurstStop);
    },

    showSummaryAction: function() {
      return new AddClassAction(this.$ctx, SUMMARY_SHOW_CLASS);
    },

    hideSummaryAction: function() {
      return new RemoveClassAction(this.$ctx, SUMMARY_SHOW_CLASS);
    },

    updateSummaryAction: function(options) {
      var count = _.get(options, "count", 0);
      var seq = new Sequence();

      if (count < 1) {
        return seq;
      }

      var startDamage =
        (options.startDamage != null ? options.startDamage : this.currentDamage) || 0;

      this.currentDamage = options.endDamage;

      var summaryDamageOptions = {
        container: this.$summaryDamageTicker,
        start: startDamage,
        end: options.endDamage,
        interval: this.spinDigitsInterval,
        iterations: this.damageSpinIterations,
      };

      return seq
        .Action(this.updateSummaryCounterDigitsAction(count))
        .Action(this.showSummaryAction())
        .Wait(0.1)
        .Action(this.spinSummaryDamageDigitsAction(summaryDamageOptions));
    },

    hideAction: function() {
      return new ParallelSequence()
        .Action(this.hideCounterAction())
        .Action(this.hideSummaryAction());
    },

    // ----- Action runners -----

    updateCounter: function(payload) {
      var count = payload.count || 0;
      return this.updateCounterAction(count).Start();
    },

    updateSummary: function(payload) {
      return this.updateSummaryAction(payload).Start();
    },

    hide: function() {
      return this.hideAction().Start();
    },
  });

  context.score = new ComboScore();
})(GameUI.CustomUIConfig(), this);
