<layout lang="xml">
<!-- Combo Score (shamelessly rippped from ES arcana) -->
<root>
  <scripts>
    <include src="file://{resources}/components/combo_score.js" />
  </scripts>

  <styles>
    <include src="file://{resources}/components/combo_score.css" />
  </styles>

  <Panel class="root" hittest="false" hittestchildren="false">
    <Panel class="counter">
      <Panel class="splash-bg">
        <DOTAScenePanel id="counter-fx" camera="camera" renderdeferred="false" rendershadows="false" particleonly="true" map="scenes/hud/ui_es_arcana_combo_ambient" require-composition-layer="true" />
      </Panel>

      <Panel class="content">
        <Panel id="counter-ticker" class="digits-container">
          <Panel class="digit-x" />
          <Panel class="digit" />
          <Panel class="digit" />
          <Panel class="digit" />
        </Panel>
        <Label class="score-label" text="#invokation_combo_counter_title" />
      </Panel>
    </Panel>

    <Panel class="summary">
      <DOTAScenePanel id="summary-fx" camera="camera" renderdeferred="false" rendershadows="false" particleonly="true" map="scenes/hud/ui_es_arcana_combo_summary" require-composition-layer="true" />
      <Panel class="splash-bg" />

      <Panel class="content">
        <Panel class="step-count">
          <Panel id="summary-step-count-ticker" class="digits-container">
            <Panel class="digit-x" />
            <Panel class="digit" />
            <Panel class="digit" />
            <Panel class="digit" />
          </Panel>
          <Label class="score-label" text="#invokation_combo_counter_title" />
        </Panel>

        <Panel class="score-damage">
          <Panel id="summary-damage-ticker" class="digits-container">
            <Panel class="digit" />
            <Panel class="digit" />
            <Panel class="digit" />
            <Panel class="digit" />
            <Panel class="digit" />
          </Panel>
          <Label class="score-label" text="#invokation_combo_counter_damage_label" />
        </Panel>
      </Panel>
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import { forOwn } from "lodash";

import type { ScoreCounterMetrics, ScoreSummaryMetrics } from "../scripts/lib/combo";
import { Component } from "../scripts/lib/component";
import { COMPONENTS } from "../scripts/lib/const/component";
import { UIPanelEvent } from "../scripts/lib/const/ui_events";
import {
  Action,
  AddClassAction,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
  SerialSequence,
  StaggeredSequence,
} from "../scripts/lib/sequence";
import { UIEvents } from "../scripts/lib/ui_events";

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

export default class ComboScore extends Component {
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

global.score = new ComboScore();
</script>

<style lang="scss">
// ******************************************************************************
// * Combo Score (shamelessly rippped from ES arcana)
// ******************************************************************************

@use "sass:map";
@use "../styles/variables";

$digits-bg: (
  "x": variables.$hud_arcana_es_chr_x,
  0: variables.$hud_arcana_es_chr_0,
  1: variables.$hud_arcana_es_chr_1,
  2: variables.$hud_arcana_es_chr_2,
  3: variables.$hud_arcana_es_chr_3,
  4: variables.$hud_arcana_es_chr_4,
  5: variables.$hud_arcana_es_chr_5,
  6: variables.$hud_arcana_es_chr_6,
  7: variables.$hud_arcana_es_chr_7,
  8: variables.$hud_arcana_es_chr_8,
  9: variables.$hud_arcana_es_chr_9,
);

$digits-bg-v2: (
  "x": variables.$hud_arcana_es_v2_chr_x,
  0: variables.$hud_arcana_es_v2_chr_0,
  1: variables.$hud_arcana_es_v2_chr_1,
  2: variables.$hud_arcana_es_v2_chr_2,
  3: variables.$hud_arcana_es_v2_chr_3,
  4: variables.$hud_arcana_es_v2_chr_4,
  5: variables.$hud_arcana_es_v2_chr_5,
  6: variables.$hud_arcana_es_v2_chr_6,
  7: variables.$hud_arcana_es_v2_chr_7,
  8: variables.$hud_arcana_es_v2_chr_8,
  9: variables.$hud_arcana_es_v2_chr_9,
);

$digits-width: (
  "x": 22px,
  0: 29px,
  1: 25px,
  2: 34px,
  3: 38px,
  4: 34px,
  5: 40px,
  6: 33px,
  7: 35px,
  8: 30px,
  9: 30px,
);

$digits-counter-width: (
  0: 13px,
  1: 12px,
  2: 16px,
  3: 18px,
  4: 18px,
  5: 19px,
  6: 16px,
  7: 17px,
  8: 14px,
  9: 14px,
);

.root {
  width: 275px;
  height: 120px;
}

.splash-bg {
  z-index: 0;
  width: 191px;
  height: 129px;
  horizontal-align: center;
  background-image: variables.$hud_arcana_es_summary_background;
  background-size: 100%;
}

.level2 .splash-bg {
  background-image: variables.$hud_arcana_es_v2_summary_background;
}

.digits-container {
  flow-children: left;
  width: 100%;
  margin-left: 20px;
  align: center center;
}

.digits-container .digit-hidden {
  visibility: collapse;
}

.digits-container .digit {
  width: 38px;
  height: 59px;
  background-image: map.get($digits-bg, 0);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.level2 .digits-container .digit {
  background-image: map.get($digits-bg-v2, 0);
}

.digits-container .digit-x {
  width: map.get($digits-width, "x");
  background-image: map.get($digits-bg, "x");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.level2 .digits-container .digit-x {
  background-image: map.get($digits-bg-v2, "x");
}

@for $i from 0 through 9 {
  .digits-container .digit-#{i} {
    width: map.get($digits-width, $i);
    background-image: map.get($digits-bg, $i);
  }

  .level2 .digits-container .digit-#{i} {
    background-image: map.get($digits-bg-v2, $i);
  }
}

.digits-container .digit-5 {
  margin-left: -2px;
}

.counter {
  width: 250px;
  height: 119px;
  align: center top;
  opacity: 0;
  transition-timing-function: ease-in-out;
  transition-duration: 0.3s;
  transition-property: opacity;
}

.show-counter > .counter {
  opacity: 1;
}

.show-summary > .counter {
  opacity: 0;
}

.counter > .content {
  width: 100%;
  height: 90px;
  margin-bottom: 10px;
  margin-left: 0;
  align: center bottom;
}

.counter .score-label {
  z-index: 10;
  margin-top: 65px;
  color: #d5f9fe;
  font-weight: bold;
  font-size: 13px;
  font-style: italic;
  line-height: 13px;
  letter-spacing: 2.5px;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 2px 2px 0 #1b4c44;
  vertical-align: bottom;
  horizontal-align: center;
}

.summary {
  width: 275px;
  height: 120px;
  align: center top;
  opacity: 0;
  transition-timing-function: ease-in-out;
  transition-duration: 0.3s;
  transition-property: opacity;

  .splash-bg {
    vertical-align: top;
  }

  .content {
    flow-children: down;
    width: 100%;
    align: center center;
  }
}

.show-summary .summary {
  opacity: 1;
}

.step-count {
  flow-children: right;
  width: 100%;
  horizontal-align: center;

  .score-label {
    margin-left: 5px;
    color: #fff;
    font-weight: bolder;
    font-size: 13px;
    letter-spacing: 2px;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 2px 2px 0 #1b4c44;
    vertical-align: center;
  }
}

.score-damage {
  flow-children: down;
  width: 100%;

  .score-label {
    margin-top: -5px;
    margin-left: 0;
    color: #fff;
    font-weight: bolder;
    font-size: 13px;
    letter-spacing: 2px;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 2px 2px 0 #1b4c44;
    align: center center;
  }
}

#counter-fx {
  width: 100%;
  height: 100%;
}

#summary-fx {
  z-index: 100;
  width: 100%;
  height: 100%;
  opacity-mask: variables.$mask_soft_edge_box;
}

#counter-ticker {
  height: 100%;

  &.digits-container {
    margin-right: 90px;
    horizontal-align: center;
  }

  .digit-x,
  .digit {
    align: left center;
  }

  .digit-x {
    width: 29px;
    height: 44.25px;
    margin-bottom: 0;
    margin-left: -2px;
    vertical-align: bottom;
  }

  .digit {
    pre-transform-scale2d: 0.9;
    transition-timing-function: ease-in-out;
    transition-duration: 0.1s;
    transition-property: pre-transform-scale2d, background-image;
  }

  &.bump .digit {
    pre-transform-scale2d: 1.2;
  }
}

#summary-step-count-ticker {
  &.digits-container {
    width: 40%;
    horizontal-align: center;
  }

  .digit-x {
    width: 10px;
    height: 22.125px;
    margin-bottom: 0;
    margin-left: 0;
    vertical-align: bottom;
  }

  // stylelint-disable-next-line no-descending-specificity -- Trivial
  .digit {
    height: 28px;
  }

  @for $i from 0 through 9 {
    .digit-#{i} {
      width: map.get($digits-counter-width, $i);
    }
  }
}

#summary-damage-ticker {
  width: 70%;
  margin-right: 60px;
  horizontal-align: center;

  // stylelint-disable-next-line no-descending-specificity -- Trivial
  .digit {
    margin-top: -3px;
  }
}
</style>
