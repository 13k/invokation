"use strict";

(function(global, context) {
  var _ = global.lodash;
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var StaggeredSequence = global.Sequence.StaggeredSequence;
  var AddClassAction = global.Sequence.AddClassAction;
  var RemoveClassAction = global.Sequence.RemoveClassAction;
  var CreateComponent = context.CreateComponent;

  var COUNTER_DIGITS_LENGTH = 3;
  var DAMAGE_DIGITS_LENGTH = 5;
  var DAMAGE_SPIN_ITERATIONS = 30;
  var SPIN_DIGITS_INTERVAL = 0.05;
  var BURST_INTENSITY_THRESHOLDS = [1000, 2000];

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

  var ComboScore = CreateComponent({
    constructor: function ComboScore() {
      ComboScore.super.call(this, {
        elements: [
          "CounterTicker",
          "SummaryCountDisplay",
          "SummaryDamageTicker",
          "CounterFX",
          "SummaryFX",
        ],
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

      this.counterDigitsLength = COUNTER_DIGITS_LENGTH;
      this.damageDigitsLength = DAMAGE_DIGITS_LENGTH;
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

    updateDigitsAction: function(container, value, length) {
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
    },

    spinDigitsAction: function(container, value, length, increment, interval, callbacks) {
      increment = increment || 1;
      callbacks = callbacks || {};

      var seq = new StaggeredSequence(interval);

      for (var n = 0; ; n += increment) {
        if (n > value) n = value;

        (function() {
          var nn = Math.ceil(n);
          var updateSeq = new Sequence().Action(this.updateDigitsAction(container, nn, length));

          if (callbacks.onSpin) {
            updateSeq.RunFunction(callbacks.onSpin, nn);
          }

          seq.Action(updateSeq);
        }.call(this));

        if (n === value) break;
      }

      if (callbacks.onEnd) {
        seq.RunFunction(callbacks.onEnd);
      }

      return seq;
    },

    updateCounterDigitsAction: function(value) {
      return this.updateDigitsAction(this.$counterTicker, value, this.counterDigitsLength);
    },

    updateSummaryCounterDigitsAction: function(count) {
      return this.updateDigitsAction(this.$summaryCountDisplay, count, this.counterDigitsLength);
    },

    spinSummaryDamageDigitsAction: function(damage) {
      var increment = damage / this.damageSpinIterations;
      var appliedFx = {};

      var onSpin = function(damage) {
        var intensity = this.burstIntensity(damage);

        if (!appliedFx[intensity]) {
          this.summaryFxBurstStart(intensity);
          appliedFx[intensity] = true;
        }
      };

      var onSpinEnd = function() {
        _.forOwn(appliedFx, _.rearg(this.summaryFxBurstStop.bind(this), [1]));
      };

      var callbacks = { onSpin: onSpin.bind(this), onEnd: onSpinEnd.bind(this) };

      return this.spinDigitsAction(
        this.$summaryDamageTicker,
        damage,
        this.damageDigitsLength,
        increment,
        this.spinDigitsInterval,
        callbacks
      );
    },

    bumpCounterTickerAction: function() {
      return new AddClassAction(this.$counterTicker, "CounterBump");
    },

    unbumpCounterTickerAction: function() {
      return new RemoveClassAction(this.$counterTicker, "CounterBump");
    },

    showCounterAction: function() {
      return new AddClassAction(this.$ctx, "ShowCounter");
    },

    hideCounterAction: function() {
      return new RemoveClassAction(this.$ctx, "ShowCounter");
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
      return new AddClassAction(this.$ctx, "ShowSummary");
    },

    hideSummaryAction: function() {
      return new RemoveClassAction(this.$ctx, "ShowSummary");
    },

    updateSummaryAction: function(count, damage) {
      var seq = new Sequence();

      if (count < 1) {
        return seq;
      }

      return seq
        .Action(this.updateSummaryCounterDigitsAction(count))
        .Action(this.showSummaryAction())
        .Wait(0.15)
        .Action(this.spinSummaryDamageDigitsAction(damage));
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
      var count = payload.count || 0;
      var damage = payload.damage || 0;
      return this.updateSummaryAction(count, damage).Start();
    },

    hide: function() {
      return this.hideAction().Start();
    },
  });

  context.score = new ComboScore();
})(GameUI.CustomUIConfig(), this);
