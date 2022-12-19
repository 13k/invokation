// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace ComboScore {
      export interface Elements extends Component.Elements {
        counterTicker: Panel;
        summaryCountDisplay: Panel;
        summaryDamageTicker: Panel;
        counterFx: ScenePanel;
        summaryFx: ScenePanel;
      }

      export interface Inputs extends Component.Inputs {
        Hide: undefined;
        UpdateCounter: {
          count: number;
        };
        UpdateSummary: {
          count: number;
          startDamage?: number;
          endDamage: number;
        };
      }

      export type Outputs = never;
      export type Params = never;

      const {
        Vendor: { lodash: _ },
        Sequence: {
          Sequence,
          ParallelSequence,
          StaggeredSequence,
          AddClassAction,
          RemoveClassAction,
          RunFunctionAction,
        },
      } = GameUI.CustomUIConfig().invk;

      type BurstIntensity = 1 | 2 | 3;

      interface SpinDigitOptions {
        container: Panel;
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

      interface Operations {
        data: PanelData;
        addClass: string[];
        removeClass: string[];
      }

      interface PanelData {
        digit?: string | undefined;
      }

      interface PanelWithData extends Panel {
        Data<T = PanelData>(): T;
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
      } as const;

      export class ComboScore extends Component.Component<Elements, Inputs, Outputs, Params> {
        values: Record<string, number>;
        spinQueues: Record<string, SpinDigitOptions[]>;
        spinning: Record<string, boolean>;

        constructor() {
          super({
            elements: {
              counterTicker: "ComboScoreCounterTicker",
              summaryCountDisplay: "ComboScoreSummaryCountDisplay",
              summaryDamageTicker: "ComboScoreSummaryDamageTicker",
              counterFx: "ComboScoreCounterFX",
              summaryFx: "ComboScoreSummaryFX",
            },
            elementEvents: {
              counterFx: {
                SCENE_PANEL_LOADED: () => this.counterFxAmbientStart(),
              },
              summaryFx: {
                SCENE_PANEL_LOADED: () => this.summaryFxAmbientStart(),
              },
            },
            inputs: {
              UpdateCounter: (payload: Inputs["UpdateCounter"]) => this.updateCounter(payload),
              UpdateSummary: (payload: Inputs["UpdateSummary"]) => this.updateSummary(payload),
              Hide: (payload: Inputs["Hide"]) => this.hide(payload),
            },
          });

          this.values = {};
          this.spinQueues = {};
          this.spinning = {};

          this.debug("init");
        }

        // ----- Helpers -----

        counterFxFire<K extends keyof typeof SHAKER_FX_ENTS.counter.level2>(
          key: K,
          input: "Start" | "Stop"
        ) {
          const event = SHAKER_FX_ENTS.counter.level2[key];

          this.elements.counterFx.FireEntityInput(event, input, "0");
        }

        summaryFxFire<K extends keyof typeof SHAKER_FX_ENTS.summary.level2>(
          key: K,
          input: "Start" | "Stop"
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
          return (_.sortedIndex(BURST_INTENSITY_THRESHOLDS, value) + 1) as BurstIntensity;
        }

        digitsValue(id: string, value?: number) {
          if (value != null) {
            this.values[id] = value;
          }

          return this.values[id];
        }

        spinQueue(id: string) {
          return this.spinQueues[id] || (this.spinQueues[id] = []);
        }

        consumeSpinDigits(id: string) {
          const queue = this.spinQueue(id);
          const options = queue.pop();

          while (queue.shift());

          if (options) {
            this.spinDigits(options);
          }
        }

        enqueueSpinDigits(options: SpinDigitOptions) {
          const {
            container: { id },
          } = options;

          this.spinQueue(id).push(options);

          if (!this.spinning[id]) {
            this.consumeSpinDigits(id);
          }
        }

        updateDigits(container: Panel, value: number) {
          eachUpdateDigitsOperations(container, value, (panel, ops) => {
            _.forOwn(ops.data, (value, key) => {
              panel.Data()[key as keyof PanelData] = value;
            });

            _.each(ops.removeClass, (cssClass) => panel.RemoveClass(cssClass));
            _.each(ops.addClass, (cssClass) => panel.AddClass(cssClass));
          });

          this.digitsValue(container.id, value);
        }

        // ----- Actions -----

        updateDigitsAction(container: Panel, value: number) {
          const seq = new ParallelSequence();

          eachUpdateDigitsOperations(container, value, (panel, ops) => {
            const panelSeq = new ParallelSequence();

            _.forOwn(ops.data, (value, key) =>
              panelSeq.Function(() => {
                panel.Data()[key as keyof PanelData] = value;
              })
            );

            _.each(ops.removeClass, (cssClass) => panelSeq.RemoveClass(panel, cssClass));
            _.each(ops.addClass, (cssClass) => panelSeq.AddClass(panel, cssClass));

            seq.Action(panelSeq);
          });

          return seq.Function(() => this.digitsValue(container.id, value));
        }

        spinDigitsAction(options: SpinDigitOptions) {
          options = _.assign(
            {
              iterations: 10,
              interval: 0.1,
              callbacks: {},
            },
            options
          );

          const id = options.container.id;
          const onStart = options.callbacks?.onStart;
          const onSpin = options.callbacks?.onSpin;
          const onEnd = options.callbacks?.onEnd;

          options.start = Math.ceil(
            (options.start != null ? options.start : this.digitsValue(id)) || 0
          );

          options.end = Math.ceil(options.end);
          options.increment =
            options.increment || (options.end - options.start) / options.iterations;

          const seq = new StaggeredSequence(options.interval);

          if (_.isFunction(onStart)) {
            seq.Function(onStart);
          }

          for (let v = options.start, cond = true; cond; v += options.increment) {
            const value = v > options.end ? options.end : v < options.start ? options.start : v;

            cond = options.increment > 0 ? v < options.end : v > options.start;

            (() => {
              const boundValue = Math.ceil(value);
              const updateSeq = new Sequence().Function(() =>
                this.updateDigits(options.container, boundValue)
              );

              if (_.isFunction(onSpin)) {
                updateSeq.Function(onSpin, boundValue);
              }

              seq.Action(updateSeq);
            })();
          }

          if (_.isFunction(onEnd)) {
            seq.Function(onEnd);
          }

          return new Sequence()
            .Function(() => {
              this.spinning[id] = true;
            })
            .Action(seq)
            .Function(() => {
              this.spinning[id] = false;

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
          if (!options.callbacks) {
            options.callbacks = {};
          }

          const appliedFx: Record<number, BurstIntensity> = {};

          options.callbacks.onSpin = (damage) => {
            const intensity = this.burstIntensity(damage);

            if (!(intensity in appliedFx)) {
              this.summaryFxBurstStart(intensity);

              appliedFx[intensity] = intensity;
            }
          };

          options.callbacks.onEnd = () => {
            _.forOwn(appliedFx, (v) => this.summaryFxBurstStop(v));
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
            .Action(this.showCounterAction())
            .Wait(0.15)
            .Action(this.bumpCounterTickerAction())
            .Function(() => this.counterFxBurstStart())
            .Action(this.updateCounterDigitsAction(count))
            .Wait(0.15)
            .Action(this.unbumpCounterTickerAction())
            .Function(() => this.counterFxBurstStop());
        }

        showSummaryAction() {
          return new AddClassAction(this.panel, CssClass.SummaryShow);
        }

        hideSummaryAction() {
          return new RemoveClassAction(this.panel, CssClass.SummaryShow);
        }

        updateSummaryAction(options: Inputs["UpdateSummary"]) {
          const count = _.get(options, "count", 0);
          const seq = new Sequence();

          if (count < 1) {
            return seq;
          }

          const summaryDamageOptions: SpinDigitOptions = {
            container: this.elements.summaryDamageTicker,
            start: options.startDamage,
            end: options.endDamage,
            interval: Timing.SpinDigitsInterval,
            iterations: Timing.DamageSpinIterations,
          };

          return seq
            .Action(this.updateSummaryCounterDigitsAction(count))
            .Action(this.showSummaryAction())
            .Wait(0.1)
            .Action(this.spinSummaryDamageDigitsAction(summaryDamageOptions));
        }

        hideAction() {
          return new ParallelSequence()
            .Action(this.hideCounterAction())
            .Action(this.hideSummaryAction());
        }

        // ----- Action runners -----

        spinDigits(options: SpinDigitOptions) {
          this.spinDigitsAction(options).Run();
        }

        updateCounter(payload: Inputs["UpdateCounter"]) {
          const count = _.get(payload, "count", 0);

          this.updateCounterAction(count).Run();
        }

        updateSummary(payload: Inputs["UpdateSummary"]) {
          this.updateSummaryAction(payload).Run();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        hide(_payload: Inputs["Hide"]) {
          this.hideAction().Run();
        }
      }

      const digitClass = (digit: string): string => `digit_${digit}`;
      const eachUpdateDigitsOperations = (
        container: Panel,
        value: number,
        callback: (panel: PanelWithData, operations: Operations) => void
      ) => {
        const panels = container.FindChildrenWithClassTraverse(CssClass.Digit) as PanelWithData[];
        const valueRevStr = value.toString().split("").reverse();

        for (let i = 0; i < valueRevStr.length; i++) {
          (() => {
            const idx = i;
            const digit = valueRevStr[idx];
            const panel = panels[idx];

            if (!digit) throw "unreachable";
            if (!panel) {
              throw new Error(`Could not find panel for digit at reverse index ${i}`);
            }

            const ops: Operations = {
              data: {
                digit: digit,
              },
              removeClass: [],
              addClass: [],
            };

            const panelDigit = panel.Data().digit;

            if (panelDigit) {
              ops.removeClass.push(digitClass(panelDigit));
            }

            if (digit == null) {
              ops.addClass.push(CssClass.DigitHidden);
            } else {
              ops.removeClass.push(CssClass.DigitHidden);
              ops.addClass.push(digitClass(digit));
            }

            callback(panel, ops);
          })();
        }
      };

      export const component = new ComboScore();
    }
  }
}
