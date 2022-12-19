// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Freestyle {
      export interface Elements extends Component.Elements {
        score: Panel;
        btnLevelUp: Button;
        btnLevelMax: Button;
        btnRestart: Button;
        btnFullRestart: Button;
        btnStop: Button;
      }

      export type Inputs = never;
      export type Outputs = never;
      export type Params = never;

      const {
        Combo: { StaticID },
        CustomEvents: { Name: CustomEventName },
        Layout: { ID: LayoutID },
        Panorama: { SoundEvent },
        Sequence: { Sequence, ParallelSequence, RemoveClassAction, RunFunctionAction },
        Vendor: { lodash: _ },
      } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        ComboScore = "ComboScore",
      }

      enum CssClass {
        FreestyleHide = "Hide",
        ComboScore = "Level2",
      }

      enum Timing {
        StartDelay = 0.5,
      }

      export class Freestyle extends Component.Component<Elements, Inputs, Outputs, Params> {
        comboScore: ComboScore.ComboScore;

        constructor() {
          super({
            elements: {
              score: "FreestyleScore",
              btnLevelUp: "BtnLevelUp",
              btnLevelMax: "BtnLevelMax",
              btnRestart: "BtnRestart",
              btnFullRestart: "BtnFullRestart",
              btnStop: "BtnStop",
            },
            customEvents: {
              COMBO_STARTED: (payload) => this.onComboStarted(payload),
              COMBO_STOPPED: (payload) => this.onComboStopped(payload),
              COMBO_PROGRESS: (payload) => this.onComboProgress(payload),
            },
            panelEvents: {
              btnLevelUp: { onactivate: () => this.LevelUp() },
              btnLevelMax: { onactivate: () => this.LevelMax() },
              btnRestart: { onactivate: () => this.Restart(false) },
              btnFullRestart: { onactivate: () => this.Restart(true) },
              btnStop: { onactivate: () => this.Stop() },
            },
          });

          this.comboScore = this.createComboScore(this.elements.score);

          this.debug("init");
        }

        // --- Event handlers -----

        onComboStarted(payload: CustomEvents.ComboStarted) {
          if (payload.id !== StaticID.Freestyle) {
            return;
          }

          this.debug("onComboStarted()", payload);
          this.start();
        }

        onComboStopped(payload: CustomEvents.ComboStopped) {
          if (payload.id !== StaticID.Freestyle) {
            return;
          }

          this.debug("onComboStopped()", payload);
          this.stop();
        }

        onComboProgress(payload: CustomEvents.ComboProgress) {
          if (payload.id !== StaticID.Freestyle) {
            return;
          }

          this.debug("onComboProgress()", payload);
          this.progress(payload.metrics);
        }

        // ----- Helpers -----

        sendStop() {
          this.sendServer(CustomEventName.COMBO_STOP, {});
        }

        sendRestart(isHardReset: boolean) {
          this.sendServer(CustomEventName.COMBO_RESTART, { hardReset: isHardReset });
        }

        sendLevelUp(payload: CustomEvents.FreestyleHeroLevelUp) {
          this.sendServer(CustomEventName.FREESTYLE_HERO_LEVEL_UP, payload);
        }

        createComboScore(parent: Panel) {
          const component = this.create(LayoutID.ComboScore, PanelID.ComboScore, parent);

          component.panel.AddClass(CssClass.ComboScore);

          return component;
        }

        // ----- Component actions -----

        showAction() {
          return new RemoveClassAction(this.panel, CssClass.FreestyleHide);
        }

        hideAction() {
          return new ParallelSequence()
            .Action(this.hideScoreAction())
            .Action(this.hideShopAction())
            .AddClass(this.panel, CssClass.FreestyleHide);
        }

        // ----- Score actions -----

        updateScoreSummaryAction(options: ComboScore.Inputs["UpdateSummary"]) {
          return new RunFunctionAction(() => this.comboScore.Input("UpdateSummary", options));
        }

        hideScoreAction() {
          return new RunFunctionAction(() => this.comboScore.Input("Hide", undefined));
        }

        // ----- HUD actions -----

        showShopAction() {
          return new RunFunctionAction(() => this.showInventoryShopUI());
        }

        hideShopAction() {
          return new RunFunctionAction(() => this.hideInventoryShopUI());
        }

        // ----- Action runners -----

        start() {
          const seq = new Sequence()
            .PlaySoundEffect(SoundEvent.InvokationFreestyleStart)
            .Action(this.hideScoreAction())
            .Action(this.showShopAction())
            .Wait(Timing.StartDelay)
            .Action(this.showAction());

          this.debugFn(() => ["start()", { actions: seq.size() }]);

          seq.Run();
        }

        stop() {
          const seq = new Sequence().Action(this.hideAction());

          this.debugFn(() => ["stop()", { actions: seq.size() }]);

          seq.Run();
        }

        progress(metrics: Combo.Metrics) {
          const options = {
            count: metrics.count || 0,
            endDamage: metrics.damage || 0,
          };

          const seq = new Sequence().Action(this.updateScoreSummaryAction(options));

          this.debugFn(() => ["progress()", _.assign({ actions: seq.size() }, options)]);

          seq.Run();
        }

        // ----- UI methods -----

        Restart(isHardReset: boolean) {
          this.debugFn(() => ["Restart()", { isHardReset }]);
          this.sendRestart(!!isHardReset);
        }

        Stop() {
          this.debug("Stop()");
          this.sendStop();
        }

        LevelUp() {
          this.sendLevelUp({ maxLevel: false });
        }

        LevelMax() {
          this.sendLevelUp({ maxLevel: true });
        }
      }

      export const component = new Freestyle();
    }
  }
}
