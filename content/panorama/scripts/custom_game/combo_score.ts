import { forOwn } from "lodash";
import type { ScoreCounterMetrics, ScoreSummaryMetrics } from "./lib/combo";
import { Component } from "./lib/component";
import { COMPONENTS } from "./lib/const/component";
import { UIPanelEvent } from "./lib/const/ui_events";
import {
  Action,
  AddClassAction,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
  SerialSequence,
  StaggeredSequence,
} from "./lib/sequence";
import { UIEvents } from "./lib/ui_events";

export type Inputs = {
  [INPUTS.HIDE]: never;
  [INPUTS.UPDATE_COUNTER]: ScoreCounterMetrics;
  [INPUTS.UPDATE_SUMMARY]: ScoreSummaryMetrics;
};

export type Outputs = never;

interface Elements {
  counterTicker: Panel;
  summaryCountDisplay: Panel;
  summaryDamageTicker: Panel;
  counterFx: ScenePanel;
  summaryFx: ScenePanel;
}

interface SpinDigitsOptions {
  container: Panel;
  iterations?: number;
  interval?: number;
  callbacks?: {
    onStart?: () => void;
    onSpin?: (value: number) => void;
    onEnd?: () => void;
  };
  start?: number;
  end: number;
  increment?: number;
}

interface UpdateDigitsOps {
  setAttributes: Record<string, string>;
  removeClass: string[];
  addClass: string[];
}

const { inputs: INPUTS } = COMPONENTS.COMBO_SCORE;

const DAMAGE_SPIN_ITERATIONS = 30;
const SPIN_DIGITS_INTERVAL = 0.05;
const BURST_INTENSITY_THRESHOLDS: [number, number] = [1000, 2000];

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

enum BurstIntensity {
  Weak = 1,
  Regular,
  Strong,
}

const SUMMARY_BURST_ENTITIES = {
  [BurstIntensity.Weak]: SHAKER_FX_ENTS.summary.level2.burst1,
  [BurstIntensity.Regular]: SHAKER_FX_ENTS.summary.level2.burst2,
  [BurstIntensity.Strong]: SHAKER_FX_ENTS.summary.level2.burst3,
};

const digitClass = (digit: string) => `digit-${digit}`;

export class ComboScore extends Component {
  #elements: Elements;
  #values: Record<string, number> = {};
  #spinQueues: Record<string, SpinDigitsOptions[]> = {};
  #spinning: Record<string, boolean> = {};
  #spinDigitsInterval: number = SPIN_DIGITS_INTERVAL;
  #damageSpinIterations: number = DAMAGE_SPIN_ITERATIONS;
  #burstIntensityThresholds: [number, number] = BURST_INTENSITY_THRESHOLDS;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      counterTicker: "counter-ticker",
      summaryCountDisplay: "summary-step-count-ticker",
      summaryDamageTicker: "summary-damage-ticker",
      counterFx: "counter-fx",
      summaryFx: "summary-fx",
    });

    this.registerInputs({
      [INPUTS.HIDE]: this.hide,
      [INPUTS.UPDATE_COUNTER]: this.updateCounter,
      [INPUTS.UPDATE_SUMMARY]: this.updateSummary,
    });

    UIEvents.listen(
      this.#elements.counterFx,
      UIPanelEvent.ScenePanelSceneLoaded,
      this.counterFxAmbientStart.bind(this)
    );

    UIEvents.listen(
      this.#elements.summaryFx,
      UIPanelEvent.ScenePanelSceneLoaded,
      this.summaryFxAmbientStart.bind(this)
    );

    this.debug("init");
  }

  // ----- Helpers -----

  counterFxAmbientStart(): void {
    this.#elements.counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.ambient, "Start", "0");
  }

  counterFxBurstStart(): void {
    this.#elements.counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Start", "0");
  }

  counterFxBurstStop(): void {
    this.#elements.counterFx.FireEntityInput(SHAKER_FX_ENTS.counter.level2.burst2, "Stop", "0");
  }

  summaryFxAmbientStart(): void {
    this.#elements.summaryFx.FireEntityInput(SHAKER_FX_ENTS.summary.level2.ambient, "Start", "0");
  }

  summaryFxBurstStart(intensity: BurstIntensity): void {
    this.#elements.summaryFx.FireEntityInput(SUMMARY_BURST_ENTITIES[intensity], "Start", "0");
  }

  summaryFxBurstStop(intensity: BurstIntensity): void {
    this.#elements.summaryFx.FireEntityInput(SUMMARY_BURST_ENTITIES[intensity], "Stop", "0");
  }

  burstIntensity(value: number): BurstIntensity {
    if (value <= this.#burstIntensityThresholds[0]) {
      return BurstIntensity.Weak;
    }

    if (value <= this.#burstIntensityThresholds[1]) {
      return BurstIntensity.Regular;
    }

    return BurstIntensity.Strong;
  }

  digitsValue(id: string, value?: number): number {
    if (value != null) {
      this.#values[id] = value;
    }

    return this.#values[id];
  }

  spinQueue(id: string): SpinDigitsOptions[] {
    this.#spinQueues[id] ||= [];

    return this.#spinQueues[id];
  }

  consumeSpinDigits(id: string): void {
    const queue = this.spinQueue(id);
    const options = queue.pop();

    while (queue.shift());

    if (options) {
      this.spinDigits(options);
    }
  }

  enqueueSpinDigits(options: SpinDigitsOptions): void {
    const { id } = options.container;

    this.spinQueue(id).push(options);

    if (!this.#spinning[id]) {
      this.consumeSpinDigits(id);
    }
  }

  updateDigits(container: Panel, value: number): void {
    eachUpdateDigitsOperations(container, value, (panel, ops) => {
      forOwn(ops.setAttributes, (value, key) => panel.SetAttributeString(key, value));
      ops.removeClass.forEach((cssClass) => panel.RemoveClass(cssClass));
      ops.addClass.forEach((cssClass) => panel.AddClass(cssClass));
    });

    this.digitsValue(container.id, value);
  }

  // ----- Actions -----

  updateDigitsAction(container: Panel, value: number): Action {
    const seq = new ParallelSequence();

    eachUpdateDigitsOperations(container, value, (panel, ops) => {
      const panelSeq = new ParallelSequence();

      forOwn(ops.setAttributes, (value, key) => panelSeq.SetAttribute(panel, key, value));
      ops.removeClass.forEach((cssClass) => panelSeq.RemoveClass(panel, cssClass));
      ops.addClass.forEach((cssClass) => panelSeq.AddClass(panel, cssClass));

      seq.Action(panelSeq);
    });

    return seq.RunFunction(() => {
      this.digitsValue(container.id, value);
    });
  }

  spinDigitsAction(options: SpinDigitsOptions): Sequence {
    const { id } = options.container;

    options.iterations ||= 10;
    options.interval ||= 0.1;
    options.start = Math.ceil((options.start != null ? options.start : this.digitsValue(id)) || 0);
    options.end = Math.ceil(options.end);
    options.increment ||= (options.end - options.start) / options.iterations;

    const seq = new StaggeredSequence({ delay: options.interval });

    if (typeof options.callbacks?.onStart === "function") {
      seq.RunFunction(options.callbacks.onStart);
    }

    for (let v = options.start, cond = true; cond; v += options.increment) {
      const value = v > options.end ? options.end : v < options.start ? options.start : v;
      cond = options.increment > 0 ? v < options.end : v > options.start;

      (() => {
        const boundValue = Math.ceil(value);
        const updateSeq = new SerialSequence().RunFunction(() =>
          this.updateDigits(options.container, boundValue)
        );

        if (typeof options.callbacks?.onSpin === "function") {
          updateSeq.RunFunction(options.callbacks.onSpin, boundValue);
        }

        seq.Action(updateSeq);
      })();
    }

    if (typeof options.callbacks?.onEnd === "function") {
      seq.RunFunction(options.callbacks.onEnd);
    }

    return new SerialSequence()
      .RunFunction(() => {
        this.#spinning[id] = true;
      })
      .Action(seq)
      .RunFunction(() => {
        this.#spinning[id] = false;
        this.consumeSpinDigits(id);
      });
  }

  updateCounterDigitsAction(value: number): Action {
    return this.updateDigitsAction(this.#elements.counterTicker, value);
  }

  updateSummaryCounterDigitsAction(count: number): Action {
    return this.updateDigitsAction(this.#elements.summaryCountDisplay, count);
  }

  spinSummaryDamageDigitsAction(options: SpinDigitsOptions): Action {
    const appliedFx = {} as Record<BurstIntensity, BurstIntensity>;
    const callbacks: SpinDigitsOptions["callbacks"] = {};

    callbacks.onSpin = (damage: number) => {
      const intensity = this.burstIntensity(damage);

      if (!(intensity in appliedFx)) {
        this.summaryFxBurstStart(intensity);

        appliedFx[intensity] = intensity;
      }
    };

    callbacks.onEnd = () => {
      forOwn(appliedFx, this.summaryFxBurstStop.bind(this));
    };

    return new RunFunctionAction(() => this.enqueueSpinDigits({ ...options, callbacks }));
  }

  bumpCounterTickerAction(): Action {
    return new AddClassAction(this.#elements.counterTicker, CLASSES.COUNTER_BUMP);
  }

  unbumpCounterTickerAction(): Action {
    return new RemoveClassAction(this.#elements.counterTicker, CLASSES.COUNTER_BUMP);
  }

  showCounterAction(): Action {
    return new AddClassAction(this.ctx, CLASSES.COUNTER_SHOW);
  }

  hideCounterAction(): Action {
    return new RemoveClassAction(this.ctx, CLASSES.COUNTER_SHOW);
  }

  updateCounterAction(metrics: ScoreCounterMetrics): Sequence {
    const count = metrics.count ?? 0;
    const seq = new SerialSequence();

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

  showSummaryAction(): Action {
    return new AddClassAction(this.ctx, CLASSES.SUMMARY_SHOW);
  }

  hideSummaryAction(): Action {
    return new RemoveClassAction(this.ctx, CLASSES.SUMMARY_SHOW);
  }

  updateSummaryAction(metrics: ScoreSummaryMetrics): Sequence {
    const count = metrics.count ?? 0;
    const seq = new SerialSequence();

    if (count < 1) {
      return seq;
    }

    const summaryDamageOptions: SpinDigitsOptions = {
      container: this.#elements.summaryDamageTicker,
      start: metrics.startDamage,
      end: metrics.endDamage,
      interval: this.#spinDigitsInterval,
      iterations: this.#damageSpinIterations,
    };

    return seq
      .Action(this.updateSummaryCounterDigitsAction(count))
      .Action(this.showSummaryAction())
      .Wait(0.1)
      .Action(this.spinSummaryDamageDigitsAction(summaryDamageOptions));
  }

  hideAction(): Sequence {
    return new ParallelSequence().Action(this.hideCounterAction()).Action(this.hideSummaryAction());
  }

  // ----- Action runners -----

  spinDigits(options: SpinDigitsOptions): void {
    this.spinDigitsAction(options).run();
  }

  updateCounter(metrics: ScoreCounterMetrics): void {
    this.updateCounterAction(metrics).run();
  }

  updateSummary(metrics: ScoreSummaryMetrics): void {
    this.updateSummaryAction(metrics).run();
  }

  hide(): void {
    this.hideAction().run();
  }
}

const eachUpdateDigitsOperations = (
  container: Panel,
  value: number,
  callback: (panel: Panel, ops: UpdateDigitsOps) => void
) => {
  const panels = container.FindChildrenWithClassTraverse(CLASSES.DIGIT);
  const valueRevStr = value.toString().split("").reverse().join("");

  for (let i = 0; i < panels.length; i++) {
    (() => {
      const idx = i;
      const digit = valueRevStr[idx];
      const panel = panels[idx];
      const ops: UpdateDigitsOps = {
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

//   context.score = new ComboScore();
// })(GameUI.CustomUIConfig(), this);
