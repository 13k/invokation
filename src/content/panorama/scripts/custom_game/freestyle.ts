// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace Freestyle {
      const {
        combo: { StaticID },
        custom_events: { CustomGameEvent },
        layout: { LayoutID },
        panorama: { SoundEvent },
        sequence: { Sequence, ParallelSequence, RemoveClassAction, RunFunctionAction },
      } = GameUI.CustomUIConfig().invk;

      import ComboScore = invk.components.ComboScore.ComboScore;
      import Component = invk.component.Component;

      export interface Elements extends component.Elements {
        score: Panel;
        btnLevelUp: Button;
        btnLevelMax: Button;
        btnRestart: Button;
        btnFullRestart: Button;
        btnStop: Button;
      }

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

      export class Freestyle extends Component<Elements> {
        comboScore: ComboScore;

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
              [CustomGameEvent.COMBO_STARTED]: (payload) => this.onComboStarted(payload),
              [CustomGameEvent.COMBO_STOPPED]: (payload) => this.onComboStopped(payload),
              [CustomGameEvent.COMBO_PROGRESS]: (payload) => this.onComboProgress(payload),
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

        onComboStarted(payload: NetworkedData<custom_events.ComboStarted>) {
          if (payload.id !== StaticID.Freestyle) {
            return;
          }

          this.debug("onComboStarted()", payload);
          this.start();
        }

        onComboStopped(payload: NetworkedData<custom_events.ComboStopped>) {
          if (payload.id !== StaticID.Freestyle) {
            return;
          }

          this.debug("onComboStopped()", payload);
          this.stop();
        }

        onComboProgress(payload: NetworkedData<custom_events.ComboProgress>) {
          if (payload.id !== StaticID.Freestyle) {
            return;
          }

          this.debug("onComboProgress()", payload);
          this.progress(payload.metrics);
        }

        // ----- Helpers -----

        sendStop() {
          this.sendServer(CustomGameEvent.COMBO_STOP, {});
        }

        sendRestart(isHardReset: boolean) {
          this.sendServer(CustomGameEvent.COMBO_RESTART, { hardReset: isHardReset });
        }

        sendLevelUp(payload: custom_events.FreestyleHeroLevelUp) {
          this.sendServer(CustomGameEvent.FREESTYLE_HERO_LEVEL_UP, payload);
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
          return new RunFunctionAction(() => this.comboScore.input("UpdateSummary", options));
        }

        hideScoreAction() {
          return new RunFunctionAction(() => this.comboScore.input("Hide", undefined));
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

        progress(metrics: combo.Metrics) {
          const options = {
            count: metrics.count || 0,
            endDamage: metrics.damage || 0,
          };

          const seq = new Sequence().Action(this.updateScoreSummaryAction(options));

          this.debugFn(() => ["progress()", { actions: seq.size(), ...options }]);

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
