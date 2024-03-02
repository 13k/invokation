namespace invk {
  export namespace Components {
    export namespace Freestyle {
      const {
        Combo: { StaticId },
        CustomEvents: { CustomGameEvent },
        Layout: { LayoutId },
        Panorama: { SoundEvent },
        Sequence: { Sequence, ParallelSequence, RemoveClassAction, RunFunctionAction },
      } = GameUI.CustomUIConfig().invk;

      import Action = invk.Sequence.Action;
      import ComboScore = invk.Components.ComboScore.ComboScore;
      import Component = invk.Component.Component;

      export interface Elements extends Component.Elements {
        score: Panel;
        btnLevelUp: Button;
        btnLevelMax: Button;
        btnRestart: Button;
        btnFullRestart: Button;
        btnStop: Button;
      }

      enum PanelId {
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
              [CustomGameEvent.ComboStarted]: (payload) => this.onComboStarted(payload),
              [CustomGameEvent.ComboStopped]: (payload) => this.onComboStopped(payload),
              [CustomGameEvent.ComboProgress]: (payload) => this.onComboProgress(payload),
            },
            panelEvents: {
              btnLevelUp: { onactivate: () => this.onBtnLevelUp() },
              btnLevelMax: { onactivate: () => this.onBtnLevelMax() },
              btnRestart: { onactivate: () => this.onBtnRestart(false) },
              btnFullRestart: { onactivate: () => this.onBtnRestart(true) },
              btnStop: { onactivate: () => this.onBtnStop() },
            },
          });

          this.comboScore = this.createComboScore(this.elements.score);

          this.debug("init");
        }

        // --- Event handlers -----

        onComboStarted(payload: NetworkedData<CustomEvents.ComboStarted>): void {
          if (payload.id !== StaticId.Freestyle) {
            return;
          }

          this.debug("onComboStarted()", payload);
          this.start();
        }

        onComboStopped(payload: NetworkedData<CustomEvents.ComboStopped>): void {
          if (payload.id !== StaticId.Freestyle) {
            return;
          }

          this.debug("onComboStopped()", payload);
          this.stop();
        }

        onComboProgress(payload: NetworkedData<CustomEvents.ComboProgress>): void {
          if (payload.id !== StaticId.Freestyle) {
            return;
          }

          this.debug("onComboProgress()", payload);
          this.progress(payload.metrics);
        }

        onBtnRestart(isHardReset: boolean): void {
          this.debugFn(() => ["onBtnRestart()", { isHardReset }]);
          this.sendRestart(!!isHardReset);
        }

        onBtnStop(): void {
          this.debug("onBtnStop()");
          this.sendStop();
        }

        onBtnLevelUp(): void {
          this.sendLevelUp({ maxLevel: false });
        }

        onBtnLevelMax(): void {
          this.sendLevelUp({ maxLevel: true });
        }

        // ----- Helpers -----

        sendStop(): void {
          this.sendServer(CustomGameEvent.ComboStop, {});
        }

        sendRestart(isHardReset: boolean): void {
          this.sendServer(CustomGameEvent.ComboRestart, { hardReset: isHardReset });
        }

        sendLevelUp(payload: CustomEvents.FreestyleHeroLevelUp): void {
          this.sendServer(CustomGameEvent.FreestyleHeroLevelUp, payload);
        }

        createComboScore(parent: Panel): ComboScore {
          const component = this.create(LayoutId.ComboScore, PanelId.ComboScore, parent);

          component.panel.AddClass(CssClass.ComboScore);

          return component;
        }

        // ----- Component actions -----

        showAction(): Action {
          return new RemoveClassAction(this.panel, CssClass.FreestyleHide);
        }

        hideAction(): Action {
          return new ParallelSequence()
            .add(this.hideScoreAction())
            .add(this.hideShopAction())
            .addClass(this.panel, CssClass.FreestyleHide);
        }

        // ----- Score actions -----

        updateScoreSummaryAction(options: ComboScore.Inputs["updateSummary"]): Action {
          return new RunFunctionAction(() => this.comboScore.inputs({ updateSummary: options }));
        }

        hideScoreAction(): Action {
          return new RunFunctionAction(() => this.comboScore.inputs({ hide: undefined }));
        }

        // ----- HUD actions -----

        showShopAction(): Action {
          return new RunFunctionAction(() => this.showInventoryShopUi());
        }

        hideShopAction(): Action {
          return new RunFunctionAction(() => this.hideInventoryShopUi());
        }

        // ----- Action runners -----

        start(): void {
          const seq = new Sequence()
            .playSoundEffect(SoundEvent.InvokationFreestyleStart)
            .add(this.hideScoreAction())
            .add(this.showShopAction())
            .wait(Timing.StartDelay)
            .add(this.showAction());

          this.debugFn(() => ["start()", { actions: seq.deepSize() }]);

          seq.run();
        }

        stop(): void {
          const seq = new Sequence().add(this.hideAction());

          this.debugFn(() => ["stop()", { actions: seq.deepSize() }]);

          seq.run();
        }

        progress(metrics: Combo.Metrics): void {
          const options = {
            count: metrics.count || 0,
            endDamage: metrics.damage || 0,
          };

          const seq = new Sequence().add(this.updateScoreSummaryAction(options));

          this.debugFn(() => ["progress()", { actions: seq.deepSize(), ...options }]);

          seq.run();
        }
      }

      export const component = new Freestyle();
    }
  }
}
