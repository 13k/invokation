import { UiEvent } from "@invokation/panorama-lib/panorama";
import {
  AddClassAction,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
  StaggeredSequence,
} from "@invokation/panorama-lib/sequence";
import sortedIndex from "lodash-es/sortedIndex";

import type { Elements, Inputs } from "./component";
import { Component } from "./component";

export interface ComboScoreElements extends Elements {
  counterTicker: Panel;
  summaryCountDisplay: Panel;
  summaryDamageTicker: Panel;
  counterFx: ScenePanel;
  summaryFx: ScenePanel;
}

export interface ComboScoreInputs extends Inputs {
  hide: undefined;
  updateCounter: {
    count: number;
  };
  updateSummary: {
    count: number;
    startDamage?: number;
    endDamage: number;
  };
}

type BurstIntensity = 1 | 2 | 3;

interface SpinDigitOptions {
  panel: Panel;
  start?: number | undefined;
  end: number;
  increment?: number;
  interval: number;
  iterations: number;
  callbacks?: {
    onStart?: () => void;
    onSpin?: (damage: number) => void;
    onEnd?: () => void;
  };
}

interface DigitsOperations {
  data: PanelDigitData;
  addClass: string[];
  removeClass: string[];
}

interface PanelDigitData {
  digit?: string | undefined;
}

interface PanelWithDigit extends Panel {
  // biome-ignore lint/style/useNamingConvention: builtin type
  Data<T = PanelDigitData>(): T;
}

enum CssClass {
  Digit = "ComboScoreDigit",
  DigitHidden = "ComboScoreDigitHidden",
  CounterBump = "CounterBump",
  CounterShow = "ShowCounter",
  SummaryShow = "ShowSummary",
}

enum Timing {
  DamageSpinIterations = 30,
  SpinDigitsInterval = 0.05,
}

const BURST_INTENSITY_THRESHOLDS = [1000, 2000].sort();

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
} as const;

export type { ComboScore };

class ComboScore extends Component<ComboScoreElements, ComboScoreInputs> {
  values: Map<string, number> = new Map();
  spinQueues: Map<string, SpinDigitOptions[]> = new Map();
  isSpinning: Map<string, boolean> = new Map();

  constructor() {
    super({
      elements: {
        counterTicker: "ComboScoreCounterTicker",
        summaryCountDisplay: "ComboScoreSummaryCountDisplay",
        summaryDamageTicker: "ComboScoreSummaryDamageTicker",
        counterFx: "ComboScoreCounterFX",
        summaryFx: "ComboScoreSummaryFX",
      },
      uiEvents: {
        counterFx: {
          [UiEvent.ScenePanelLoaded]: () => this.counterFxAmbientStart(),
        },
        summaryFx: {
          [UiEvent.ScenePanelLoaded]: () => this.summaryFxAmbientStart(),
        },
      },
      inputs: {
        updateCounter: (payload) => this.updateCounter(payload),
        updateSummary: (payload) => this.updateSummary(payload),
        hide: (payload) => this.hide(payload),
      },
    });

    this.debug("init");
  }

  // ----- Helpers -----

  counterFxFire<K extends keyof typeof SHAKER_FX_ENTS.counter.level2>(
    key: K,
    input: "Start" | "Stop",
  ) {
    const event = SHAKER_FX_ENTS.counter.level2[key];

    this.elements.counterFx.FireEntityInput(event, input, "0");
  }

  summaryFxFire<K extends keyof typeof SHAKER_FX_ENTS.summary.level2>(
    key: K,
    input: "Start" | "Stop",
  ) {
    const event = SHAKER_FX_ENTS.summary.level2[key];

    this.elements.summaryFx.FireEntityInput(event, input, "0");
  }

  counterFxAmbientStart() {
    this.counterFxFire("ambient", "Start");
  }

  counterFxBurstStart() {
    this.counterFxFire("burst2", "Start");
  }

  counterFxBurstStop() {
    this.counterFxFire("burst2", "Stop");
  }

  summaryFxAmbientStart() {
    this.summaryFxFire("ambient", "Start");
  }

  summaryFxBurstStart(intensity: BurstIntensity) {
    const key: `burst${BurstIntensity}` = `burst${intensity}`;

    this.summaryFxFire(key, "Start");
  }

  summaryFxBurstStop(intensity: BurstIntensity) {
    const key: `burst${BurstIntensity}` = `burst${intensity}`;

    this.summaryFxFire(key, "Stop");
  }

  burstIntensity(value: number): BurstIntensity {
    return (sortedIndex(BURST_INTENSITY_THRESHOLDS, value) + 1) as BurstIntensity;
  }

  digitsValue(id: string, value?: number) {
    if (value != null) {
      this.values.set(id, value);
    }

    return this.values.get(id);
  }

  spinQueue(id: string): SpinDigitOptions[] {
    let queue = this.spinQueues.get(id);

    if (queue == null) {
      queue = [];
      this.spinQueues.set(id, queue);
    }

    return queue;
  }

  consumeSpinDigits(id: string) {
    const queue = this.spinQueue(id);
    const options = queue.pop();

    queue.splice(0);

    if (options) {
      this.spinDigits(options);
    }
  }

  enqueueSpinDigits(options: SpinDigitOptions) {
    const id = options.panel.id;

    this.spinQueue(id).push(options);

    if (!this.isSpinning.get(id)) {
      this.consumeSpinDigits(id);
    }
  }

  updateDigits(panel: Panel, value: number) {
    eachUpdateDigitsOperations(panel, value, (panel, ops) => {
      for (const [key, value] of Object.entries(ops.data)) {
        panel.Data()[key as keyof PanelDigitData] = value;
      }

      for (const cssClass of ops.removeClass) {
        panel.RemoveClass(cssClass);
      }

      for (const cssClass of ops.addClass) {
        panel.AddClass(cssClass);
      }
    });

    this.digitsValue(panel.id, value);
  }

  // ----- Actions -----

  updateDigitsAction(panel: Panel, value: number) {
    const seq = new ParallelSequence().runFn(() => this.digitsValue(panel.id, value));

    eachUpdateDigitsOperations(panel, value, (panel, ops) => {
      const panelSeq = new ParallelSequence();

      for (const [key, value] of Object.entries(ops.data)) {
        panelSeq.runFn(() => {
          panel.Data()[key as keyof PanelDigitData] = value;
        });
      }

      for (const cssClass of ops.removeClass) {
        panelSeq.removeClass(panel, cssClass);
      }

      for (const cssClass of ops.addClass) {
        panelSeq.addClass(panel, cssClass);
      }

      seq.add(panelSeq);
    });

    return seq;
  }

  spinDigitsAction(options: SpinDigitOptions) {
    options.iterations ??= 10;
    options.interval ??= 0.1;
    options.callbacks ??= {};

    const id = options.panel.id;
    const onStart = options.callbacks?.onStart;
    const onSpin = options.callbacks?.onSpin;
    const onEnd = options.callbacks?.onEnd;

    options.start = Math.ceil((options.start != null ? options.start : this.digitsValue(id)) || 0);

    options.end = Math.ceil(options.end);
    options.increment = options.increment || (options.end - options.start) / options.iterations;

    const seq = new StaggeredSequence(options.interval);

    if (typeof onStart === "function") {
      seq.runFn(onStart);
    }

    for (let v = options.start, cond = true; cond; v += options.increment) {
      const value = v > options.end ? options.end : v < options.start ? options.start : v;

      cond = options.increment > 0 ? v < options.end : v > options.start;

      (() => {
        const boundValue = Math.ceil(value);
        const updateSeq = new Sequence().runFn(() => this.updateDigits(options.panel, boundValue));

        if (typeof onSpin === "function") {
          updateSeq.runFn(onSpin, boundValue);
        }

        seq.add(updateSeq);
      })();
    }

    if (typeof onEnd === "function") {
      seq.runFn(onEnd);
    }

    return new Sequence()
      .runFn(() => {
        this.isSpinning.set(id, true);
      })
      .add(seq)
      .runFn(() => {
        this.isSpinning.set(id, false);
        this.consumeSpinDigits(id);
      });
  }

  updateCounterDigitsAction(value: number) {
    return this.updateDigitsAction(this.elements.counterTicker, value);
  }

  updateSummaryCounterDigitsAction(count: number) {
    return this.updateDigitsAction(this.elements.summaryCountDisplay, count);
  }

  spinSummaryDamageDigitsAction(options: SpinDigitOptions) {
    options.callbacks ??= {};

    const appliedFx: Map<BurstIntensity, BurstIntensity> = new Map();

    options.callbacks.onSpin = (damage) => {
      const intensity = this.burstIntensity(damage);

      if (!appliedFx.has(intensity)) {
        this.summaryFxBurstStart(intensity);

        appliedFx.set(intensity, intensity);
      }
    };

    options.callbacks.onEnd = () => {
      for (const v of appliedFx.values()) {
        this.summaryFxBurstStop(v);
      }
    };

    return new RunFunctionAction(() => this.enqueueSpinDigits(options));
  }

  bumpCounterTickerAction() {
    return new AddClassAction(this.elements.counterTicker, CssClass.CounterBump);
  }

  unbumpCounterTickerAction() {
    return new RemoveClassAction(this.elements.counterTicker, CssClass.CounterBump);
  }

  showCounterAction() {
    return new AddClassAction(this.panel, CssClass.CounterShow);
  }

  hideCounterAction() {
    return new RemoveClassAction(this.panel, CssClass.CounterShow);
  }

  updateCounterAction(count: number) {
    const seq = new Sequence();

    if (count < 1) {
      return seq;
    }

    return seq
      .add(this.showCounterAction())
      .wait(0.15)
      .add(this.bumpCounterTickerAction())
      .runFn(() => this.counterFxBurstStart())
      .add(this.updateCounterDigitsAction(count))
      .wait(0.15)
      .add(this.unbumpCounterTickerAction())
      .runFn(() => this.counterFxBurstStop());
  }

  showSummaryAction() {
    return new AddClassAction(this.panel, CssClass.SummaryShow);
  }

  hideSummaryAction() {
    return new RemoveClassAction(this.panel, CssClass.SummaryShow);
  }

  updateSummaryAction(options: ComboScoreInputs["updateSummary"]) {
    const count = options.count ?? 0;
    const seq = new Sequence();

    if (count < 1) {
      return seq;
    }

    const summaryDamageOptions: SpinDigitOptions = {
      panel: this.elements.summaryDamageTicker,
      start: options.startDamage,
      end: options.endDamage,
      interval: Timing.SpinDigitsInterval,
      iterations: Timing.DamageSpinIterations,
    };

    return seq
      .add(this.updateSummaryCounterDigitsAction(count))
      .add(this.showSummaryAction())
      .wait(0.1)
      .add(this.spinSummaryDamageDigitsAction(summaryDamageOptions));
  }

  hideAction() {
    return new ParallelSequence().add(this.hideCounterAction()).add(this.hideSummaryAction());
  }

  // ----- Action runners -----

  spinDigits(options: SpinDigitOptions) {
    this.spinDigitsAction(options).run();
  }

  updateCounter(payload: ComboScoreInputs["updateCounter"]) {
    this.updateCounterAction(payload.count ?? 0).run();
  }

  updateSummary(payload: ComboScoreInputs["updateSummary"]) {
    this.updateSummaryAction(payload).run();
  }

  hide(_payload: ComboScoreInputs["hide"]) {
    this.hideAction().run();
  }
}

const digitClass = (digit: string): string => `digit_${digit}`;
const eachUpdateDigitsOperations = (
  panel: Panel,
  value: number,
  callback: (panel: PanelWithDigit, operations: DigitsOperations) => void,
) => {
  const panels = panel.FindChildrenWithClassTraverse(CssClass.Digit) as PanelWithDigit[];

  if (panels.length === 0) {
    throw new Error("Could not find digit panels");
  }

  const valueRevStr = value.toString().split("").reverse();

  for (const [i, panel] of panels.entries()) {
    const digit = valueRevStr[i];
    const ops: DigitsOperations = {
      data: { digit },
      removeClass: [],
      addClass: [],
    };

    const prevDigit = panel.Data().digit;

    if (prevDigit) {
      ops.removeClass.push(digitClass(prevDigit));
    }

    if (digit == null) {
      ops.addClass.push(CssClass.DigitHidden);
    } else {
      ops.removeClass.push(CssClass.DigitHidden);
      ops.addClass.push(digitClass(digit));
    }

    callback(panel, ops);
  }
};

(() => {
  new ComboScore();
})();
