// const { Component } = context;
// const { lodash: _ } = global;
// const { COMPONENTS } = global.Const;
// const {
//   Sequence,
//   ParallelSequence,
//   StaggeredSequence,
//   RunFunctionAction,
//   AddClassAction,
//   RemoveClassAction,
// } = global.Sequence;

import { Component } from "./lib/component";

const DAMAGE_SPIN_ITERATIONS = 30;
const SPIN_DIGITS_INTERVAL = 0.05;
const BURST_INTENSITY_THRESHOLDS = [1000, 2000];

const CLASSES = {
  DIGIT: "digit",
  DIGIT_HIDDEN: "digit-hidden",
  COUNTER_BUMP: "bump",
  COUNTER_SHOW: "show-counter",
  SUMMARY_SHOW: "show-summary",
};

const SHAKER_FX_ENTS = {
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

const digitClass = (digit) => `digit-${digit}`;

const eachUpdateDigitsOperations = (container, value, callback) => {
  const panels = container.FindChildrenWithClassTraverse(CLASSES.DIGIT);
  const valueRevStr = value.toString().split("").reverse().join("");

  for (let i = 0; i < panels.length; i++) {
    (() => {
      const idx = i;
      const digit = valueRevStr[idx];
      const panel = panels[idx];
      const ops = {
        setAttributes: {
          __digit__: digit,
        },
        removeClass: [],
        addClass: [],
      };

      const digitValue = panel.GetAttributeString("__digit__", "");

      if (digitValue) {
        ops.removeClass.push(digitClass(digitValue));
      }

      if (digit == null) {
        ops.addClass.push(CLASSES.DIGIT_HIDDEN);
      } else {
        ops.removeClass.push(CLASSES.DIGIT_HIDDEN);
        ops.addClass.push(digitClass(digit));
      }

      callback(panel, ops);
    })();
  }
};

class ComboScore extends Component {
  constructor() {
    const { inputs } = COMPONENTS.COMBO_SCORE;

    super({
      elements: {
        counterTicker: "counter-ticker",
        summaryCountDisplay: "summary-step-count-ticker",
        summaryDamageTicker: "summary-damage-ticker",
        counterFx: "counter-fx",
        summaryFx: "summary-fx",
      },
      inputs: {
        [inputs.HIDE]: "hide",
        [inputs.UPDATE_COUNTER]: "updateCounter",
        [inputs.UPDATE_SUMMARY]: "updateSummary",
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

    this.values = {};
    this.spinQueues = {};
    this.spinning = {};
    this.spinDigitsInterval = SPIN_DIGITS_INTERVAL;
    this.damageSpinIterations = DAMAGE_SPIN_ITERATIONS;
    this.burstIntensityThresholds = BURST_INTENSITY_THRESHOLDS.sort();

    this.debug("init");
  }

  // ----- Helpers -----

  counterFxAmbientStart() {
    this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.ambient, "Start", "0");
  }

  counterFxBurstStart() {
    this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Start", "0");
  }

  counterFxBurstStop() {
    this.$counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Stop", "0");
  }

  summaryFxAmbientStart() {
    this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2.ambient, "Start", "0");
  }

  summaryFxBurstStart(intensity) {
    const key = `burst${intensity}`;
    this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Start", "0");
  }

  summaryFxBurstStop(intensity) {
    const key = `burst${intensity}`;
    this.$summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2[key], "Stop", "0");
  }

  burstIntensity(value) {
    return _.sortedIndex(this.burstIntensityThresholds, value) + 1;
  }

  digitsValue(id, value) {
    if (arguments.length > 1) {
      this.values[id] = value;
    }

    return this.values[id];
  }

  spinQueue(id) {
    this.spinQueues[id] = this.spinQueues[id] || [];

    return this.spinQueues[id];
  }

  consumeSpinDigits(id) {
    const queue = this.spinQueue(id);
    const options = queue.pop();

    while (queue.shift());

    if (options) {
      this.spinDigits(options);
    }
  }

  enqueueSpinDigits(options) {
    const { id } = options.container;

    this.spinQueue(id).push(options);

    if (!this.spinning[id]) {
      this.consumeSpinDigits(id);
    }
  }

  updateDigits(container, value) {
    eachUpdateDigitsOperations(container, value, (panel, ops) => {
      _.forOwn(ops.setAttributes, (value, key) => panel.SetAttributeString(key, value));
      _.each(ops.removeClass, (cssClass) => panel.RemoveClass(cssClass));
      _.each(ops.addClass, (cssClass) => panel.AddClass(cssClass));
    });

    this.digitsValue(container.id, value);
  }

  // ----- Actions -----

  updateDigitsAction(container, value) {
    const seq = new ParallelSequence();

    eachUpdateDigitsOperations(container, value, (panel, ops) => {
      const panelSeq = new ParallelSequence();

      _.forOwn(ops.setAttributes, (value, key) => panelSeq.SetAttribute(panel, key, value));
      _.each(ops.removeClass, (cssClass) => panelSeq.RemoveClass(panel, cssClass));
      _.each(ops.addClass, (cssClass) => panelSeq.AddClass(panel, cssClass));

      seq.Action(panelSeq);
    });

    return seq.RunFunction(() => this.digitsValue(container.id, value));
  }

  spinDigitsAction(options) {
    options = _.assign(
      {
        iterations: 10,
        interval: 0.1,
        callbacks: {},
      },
      options
    );

    const { id } = options.container;

    options.start = Math.ceil((options.start != null ? options.start : this.digitsValue(id)) || 0);

    options.end = Math.ceil(options.end);
    options.increment = options.increment || (options.end - options.start) / options.iterations;

    const seq = new StaggeredSequence(options.interval);

    if (_.isFunction(options.callbacks.onStart)) {
      seq.RunFunction(options.callbacks.onStart);
    }

    for (let v = options.start, cond = true; cond; v += options.increment) {
      const value = v > options.end ? options.end : v < options.start ? options.start : v;
      cond = options.increment > 0 ? v < options.end : v > options.start;

      (() => {
        const boundValue = Math.ceil(value);
        const updateSeq = new Sequence().RunFunction(() =>
          this.updateDigits(options.container, boundValue)
        );

        if (_.isFunction(options.callbacks.onSpin)) {
          updateSeq.RunFunction(options.callbacks.onSpin, boundValue);
        }

        seq.Action(updateSeq);
      })();
    }

    if (_.isFunction(options.callbacks.onEnd)) {
      seq.RunFunction(options.callbacks.onEnd);
    }

    return new Sequence()
      .RunFunction(() => {
        this.spinning[id] = true;
      })
      .Action(seq)
      .RunFunction(() => {
        this.spinning[id] = false;
        this.consumeSpinDigits(id);
      });
  }

  updateCounterDigitsAction(value) {
    return this.updateDigitsAction(this.$counterTicker, value);
  }

  updateSummaryCounterDigitsAction(count) {
    return this.updateDigitsAction(this.$summaryCountDisplay, count);
  }

  spinSummaryDamageDigitsAction(options) {
    options = _.assign({ callbacks: {} }, options);

    const appliedFx = {};

    options.callbacks.onSpin = (damage) => {
      const intensity = this.burstIntensity(damage);

      if (!(intensity in appliedFx)) {
        this.summaryFxBurstStart(intensity);
        appliedFx[intensity] = intensity;
      }
    };

    options.callbacks.onSpinEnd = () => {
      _.forOwn(appliedFx, this.summaryFxBurstStop.bind(this));
    };

    return new RunFunctionAction(() => this.enqueueSpinDigits(options));
  }

  bumpCounterTickerAction() {
    return new AddClassAction(this.$counterTicker, CLASSES.COUNTER_BUMP);
  }

  unbumpCounterTickerAction() {
    return new RemoveClassAction(this.$counterTicker, CLASSES.COUNTER_BUMP);
  }

  showCounterAction() {
    return new AddClassAction(this.$ctx, CLASSES.COUNTER_SHOW);
  }

  hideCounterAction() {
    return new RemoveClassAction(this.$ctx, CLASSES.COUNTER_SHOW);
  }

  updateCounterAction(count) {
    const seq = new Sequence();

    if (count < 1) {
      return seq;
    }

    return seq
      .Action(this.showCounterAction())
      .Wait(0.15)
      .Action(this.bumpCounterTickerAction())
      .RunFunction(() => this.counterFxBurstStart())
      .Action(this.updateCounterDigitsAction(count))
      .Wait(0.15)
      .Action(this.unbumpCounterTickerAction())
      .RunFunction(() => this.counterFxBurstStop());
  }

  showSummaryAction() {
    return new AddClassAction(this.$ctx, CLASSES.SUMMARY_SHOW);
  }

  hideSummaryAction() {
    return new RemoveClassAction(this.$ctx, CLASSES.SUMMARY_SHOW);
  }

  updateSummaryAction(options) {
    const count = _.get(options, "count", 0);
    const seq = new Sequence();

    if (count < 1) {
      return seq;
    }

    const summaryDamageOptions = {
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
  }

  hideAction() {
    return new ParallelSequence().Action(this.hideCounterAction()).Action(this.hideSummaryAction());
  }

  // ----- Action runners -----

  spinDigits(options) {
    this.spinDigitsAction(options).Start();
  }

  updateCounter(payload) {
    const count = payload.count || 0;

    return this.updateCounterAction(count).Start();
  }

  updateSummary(payload) {
    return this.updateSummaryAction(payload).Start();
  }

  hide() {
    return this.hideAction().Start();
  }
}

//   context.score = new ComboScore();
// })(GameUI.CustomUIConfig(), this);
