"use strict";

(function (global, context) {
  var _ = global.lodash;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var StaggeredSequence = global.Sequence.StaggeredSequence;
  var AddClassAction = global.Sequence.AddClassAction;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var RunFunctionAction = global.Sequence.RunFunctionAction;
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

  function eachUpdateDigitsOperations(container, value, callback) {
    var panels = container.FindChildrenWithClassTraverse(DIGIT_CLASS);
    var valueRevStr = value.toString().split("").reverse().join("");

    for (var i = 0; i < panels.length; i++) {
      (function () {
        var idx = i;
        var digit = valueRevStr[idx];
        var panel = panels[idx];
        var ops = {
          setAttributes: {
            __digit__: digit,
          },
          removeClass: [],
          addClass: [],
        };

        if (panel.__digit__ != null) {
          ops.removeClass.push(digitClass(panel.__digit__));
        }

        if (digit == null) {
          ops.addClass.push(DIGIT_HIDDEN_CLASS);
        } else {
          ops.removeClass.push(DIGIT_HIDDEN_CLASS);
          ops.addClass.push(digitClass(digit));
        }

        callback(panel, ops);
      })();
    }
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

      this.values = {};
      this.spinQueues = {};
      this.spinning = {};
      this.spinDigitsInterval = SPIN_DIGITS_INTERVAL;
      this.damageSpinIterations = DAMAGE_SPIN_ITERATIONS;
      this.burstIntensityThresholds = BURST_INTENSITY_THRESHOLDS.sort();

      this.debug("init");
    },

    // ----- Helpers -----

    counterFxAmbientStart: function () {
      this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.ambient, "Start", "0");
    },

    counterFxBurstStart: function () {
      this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Start", "0");
    },

    counterFxBurstStop: function () {
      this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Stop", "0");
    },

    summaryFxAmbientStart: function () {
      this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2.ambient, "Start", "0");
    },

    summaryFxBurstStart: function (intensity) {
      var key = "burst" + intensity;
      this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Start", "0");
    },

    summaryFxBurstStop: function (intensity) {
      var key = "burst" + intensity;
      this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Stop", "0");
    },

    burstIntensity: function (value) {
      return _.sortedIndex(this.burstIntensityThresholds, value) + 1;
    },

    digitsValue: function (id, value) {
      if (arguments.length > 1) {
        this.values[id] = value;
      }

      return this.values[id];
    },

    spinQueue: function (id) {
      this.spinQueues[id] = this.spinQueues[id] || [];
      return this.spinQueues[id];
    },

    consumeSpinDigits: function (id) {
      var queue = this.spinQueue(id);
      var options = queue.pop();

      while (queue.shift());

      if (options) {
        this.spinDigits(options);
      }
    },

    enqueueSpinDigits: function (options) {
      var id = options.container.id;

      this.spinQueue(id).push(options);

      if (!this.spinning[id]) {
        this.consumeSpinDigits(id);
      }
    },

    updateDigits: function (container, value) {
      eachUpdateDigitsOperations(container, value, function (panel, ops) {
        _.forOwn(ops.setAttributes, function (value, key) {
          panel[key] = value;
        });

        _.each(ops.removeClass, function (cssClass) {
          panel.RemoveClass(cssClass);
        });

        _.each(ops.addClass, function (cssClass) {
          panel.AddClass(cssClass);
        });
      });

      this.digitsValue(container.id, value);
    },

    // ----- Actions -----

    updateDigitsAction: function (container, value) {
      var seq = new ParallelSequence();

      eachUpdateDigitsOperations(container, value, function (panel, ops) {
        var panelSeq = new ParallelSequence();

        _.forOwn(ops.setAttributes, function (value, key) {
          panelSeq.SetAttribute(panel, key, value);
        });

        _.each(ops.removeClass, function (cssClass) {
          panelSeq.RemoveClass(panel, cssClass);
        });

        _.each(ops.addClass, function (cssClass) {
          panelSeq.AddClass(panel, cssClass);
        });

        seq.Action(panelSeq);
      });

      return seq.RunFunction(this, this.digitsValue, container.id, value);
    },

    spinDigitsAction: function (options) {
      options = _.assign(
        {
          iterations: 10,
          interval: 0.1,
          callbacks: {},
        },
        options
      );

      var id = options.container.id;

      options.start = Math.ceil(
        (options.start != null ? options.start : this.digitsValue(id)) || 0
      );

      options.end = Math.ceil(options.end);
      options.increment = options.increment || (options.end - options.start) / options.iterations;

      var seq = new StaggeredSequence(options.interval);

      if (_.isFunction(options.callbacks.onStart)) {
        seq.RunFunction(options.callbacks.onStart);
      }

      for (var v = options.start, cond = true; cond; v += options.increment) {
        var value = v > options.end ? options.end : v < options.start ? options.start : v;
        cond = options.increment > 0 ? v < options.end : v > options.start;

        (function () {
          var boundValue = Math.ceil(value);
          var updateSeq = new Sequence().RunFunction(
            this,
            this.updateDigits,
            options.container,
            boundValue
          );

          if (_.isFunction(options.callbacks.onSpin)) {
            updateSeq.RunFunction(options.callbacks.onSpin, boundValue);
          }

          seq.Action(updateSeq);
        }.call(this));
      }

      if (_.isFunction(options.callbacks.onEnd)) {
        seq.RunFunction(options.callbacks.onEnd);
      }

      return new Sequence()
        .RunFunction(this, function () {
          this.spinning[id] = true;
        })
        .Action(seq)
        .RunFunction(this, function () {
          this.spinning[id] = false;
          this.consumeSpinDigits(id);
        });
    },

    updateCounterDigitsAction: function (value) {
      return this.updateDigitsAction(this.$counterTicker, value);
    },

    updateSummaryCounterDigitsAction: function (count) {
      return this.updateDigitsAction(this.$summaryCountDisplay, count);
    },

    spinSummaryDamageDigitsAction: function (options) {
      options = _.assign(
        {
          callbacks: {},
        },
        options
      );

      var appliedFx = {};

      options.callbacks.onSpin = function (damage) {
        var intensity = this.burstIntensity(damage);

        if (!(intensity in appliedFx)) {
          this.summaryFxBurstStart(intensity);
          appliedFx[intensity] = intensity;
        }
      }.bind(this);

      options.callbacks.onSpinEnd = function () {
        _.forOwn(appliedFx, this.summaryFxBurstStop.bind(this));
      }.bind(this);

      return new RunFunctionAction(this, this.enqueueSpinDigits, options);
    },

    bumpCounterTickerAction: function () {
      return new AddClassAction(this.$counterTicker, COUNTER_BUMP_CLASS);
    },

    unbumpCounterTickerAction: function () {
      return new RemoveClassAction(this.$counterTicker, COUNTER_BUMP_CLASS);
    },

    showCounterAction: function () {
      return new AddClassAction(this.$ctx, COUNTER_SHOW_CLASS);
    },

    hideCounterAction: function () {
      return new RemoveClassAction(this.$ctx, COUNTER_SHOW_CLASS);
    },

    updateCounterAction: function (count) {
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

    showSummaryAction: function () {
      return new AddClassAction(this.$ctx, SUMMARY_SHOW_CLASS);
    },

    hideSummaryAction: function () {
      return new RemoveClassAction(this.$ctx, SUMMARY_SHOW_CLASS);
    },

    updateSummaryAction: function (options) {
      var count = _.get(options, "count", 0);
      var seq = new Sequence();

      if (count < 1) {
        return seq;
      }

      var summaryDamageOptions = {
        container: this.$summaryDamageTicker,
        start: options.startDamage,
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

    hideAction: function () {
      return new ParallelSequence()
        .Action(this.hideCounterAction())
        .Action(this.hideSummaryAction());
    },

    // ----- Action runners -----

    spinDigits: function (options) {
      this.spinDigitsAction(options).Start();
    },

    updateCounter: function (payload) {
      var count = payload.count || 0;
      return this.updateCounterAction(count).Start();
    },

    updateSummary: function (payload) {
      return this.updateSummaryAction(payload).Start();
    },

    hide: function () {
      return this.hideAction().Start();
    },
  });

  context.score = new ComboScore();
})(GameUI.CustomUIConfig(), this);
