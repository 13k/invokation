// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ComboScore {
      const {
        panorama: { UIEvent },
        util: { sortedIndex },
        sequence: {
          AddClassAction,
          ParallelSequence,
          RemoveClassAction,
          RunFunctionAction,
          Sequence,
          StaggeredSequence,
        },
      } = GameUI.CustomUIConfig().invk;

      import Component = invk.component.Component;

      export interface Elements extends component.Elements {
        counterTicker: Panel;
        summaryCountDisplay: Panel;
        summaryDamageTicker: Panel;
        counterFx: ScenePanel;
        summaryFx: ScenePanel;
      }

      export interface Inputs extends component.Inputs {
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

      interface DigitsOperations {
        data: PanelDigitData;
        addClass: string[];
        removeClass: string[];
      }

      interface PanelDigitData {
        digit?: string | undefined;
      }

      interface PanelWithDigit extends Panel {
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

      export class ComboScore extends Component<Elements, Inputs> {
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
                [UIEvent.SCENE_PANEL_LOADED]: () => this.counterFxAmbientStart(),
              },
              summaryFx: {
                [UIEvent.SCENE_PANEL_LOADED]: () => this.summaryFxAmbientStart(),
              },
            },
            inputs: {
              UpdateCounter: (payload) => this.updateCounter(payload),
              UpdateSummary: (payload) => this.updateSummary(payload),
              Hide: (payload) => this.hide(payload),
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

          if (!this.isSpinning.get(id)) {
            this.consumeSpinDigits(id);
          }
        }

        updateDigits(container: Panel, value: number) {
          eachUpdateDigitsOperations(container, value, (panel, ops) => {
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

          this.digitsValue(container.id, value);
        }

        // ----- Actions -----

        updateDigitsAction(container: Panel, value: number) {
          const seq = new ParallelSequence().Function(() => this.digitsValue(container.id, value));

          eachUpdateDigitsOperations(container, value, (panel, ops) => {
            const panelSeq = new ParallelSequence();

            for (const [key, value] of Object.entries(ops.data)) {
              panelSeq.Function(() => {
                panel.Data()[key as keyof PanelDigitData] = value;
              });
            }

            for (const cssClass of ops.removeClass) {
              panelSeq.RemoveClass(panel, cssClass);
            }

            for (const cssClass of ops.addClass) {
              panelSeq.AddClass(panel, cssClass);
            }

            seq.Action(panelSeq);
          });

          return seq;
        }

        spinDigitsAction(options: SpinDigitOptions) {
          options.iterations ??= 10;
          options.interval ??= 0.1;
          options.callbacks ??= {};

          const id = options.container.id;
          const onStart = options.callbacks?.onStart;
          const onSpin = options.callbacks?.onSpin;
          const onEnd = options.callbacks?.onEnd;

          options.start = Math.ceil(
            (options.start != null ? options.start : this.digitsValue(id)) || 0,
          );

          options.end = Math.ceil(options.end);
          options.increment =
            options.increment || (options.end - options.start) / options.iterations;

          const seq = new StaggeredSequence(options.interval);

          if (typeof onStart === "function") {
            seq.Function(onStart);
          }

          for (let v = options.start, cond = true; cond; v += options.increment) {
            const value = v > options.end ? options.end : v < options.start ? options.start : v;

            cond = options.increment > 0 ? v < options.end : v > options.start;

            (() => {
              const boundValue = Math.ceil(value);
              const updateSeq = new Sequence().Function(() =>
                this.updateDigits(options.container, boundValue),
              );

              if (typeof onSpin === "function") {
                updateSeq.Function(onSpin, boundValue);
              }

              seq.Action(updateSeq);
            })();
          }

          if (typeof onEnd === "function") {
            seq.Function(onEnd);
          }

          return new Sequence()
            .Function(() => {
              this.isSpinning.set(id, true);
            })
            .Action(seq)
            .Function(() => {
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
          const count = options.count ?? 0;
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
          this.updateCounterAction(payload.count ?? 0).Run();
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
        callback: (panel: PanelWithDigit, operations: DigitsOperations) => void,
      ) => {
        const panels = container.FindChildrenWithClassTraverse(CssClass.Digit) as PanelWithDigit[];

        if (panels.length === 0) {
          throw new Error("Could not find digit panels");
        }

        const valueRevStr = value.toString().split("").reverse();

        for (let i = 0; i < panels.length; i++) {
          (() => {
            const boundIdx = i;
            const panel = panels[boundIdx];
            const digit = valueRevStr[boundIdx];

            if (panel == null) throw "unreachable";

            const ops: DigitsOperations = {
              data: {
                digit: digit,
              },
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
          })();
        }
      };

      export const component = new ComboScore();
    }
  }
}
