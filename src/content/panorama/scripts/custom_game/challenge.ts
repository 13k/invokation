// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace Challenge {
      const {
        l10n: L10n,
        layout: Layout,
        lua: Lua,
        combo: { StaticID },
        custom_events: { CustomGameEvent, GameEvent },
        panorama: { SoundEvent },
        singleton: { COMBOS },
        util: { pick, randomInt },
        sequence: {
          AddClassAction,
          NoopAction,
          ParallelSequence,
          RemoveClassAction,
          RunFunctionAction,
          Sequence,
          SetDialogVariableAction,
          StaggeredSequence,
        },
      } = GameUI.CustomUIConfig().invk;

      import Combo = invk.combo.Combo;
      import ComboID = invk.combo.ComboID;
      import Metrics = invk.combo.Metrics;
      import Step = invk.combo.Step;
      import StepID = invk.combo.StepID;

      import Component = invk.component.Component;
      import ChallengeComboStep = invk.components.ChallengeComboStep.ChallengeComboStep;
      import ComboScore = invk.components.ComboScore.ComboScore;

      export interface Elements extends component.Elements {
        sequence: Panel;
        splash: Panel;
        splashTitle: LabelPanel;
        splashHelp: LabelPanel;
        score: Panel;
        timer: Panel;
        timerLabel: LabelPanel;
        waitProgress: ProgressBar;
        waitProgressBar: ProgressBar;
        btnShowDetails: Button;
        btnCycleHUD: Button;
        btnRestart: Button;
        btnFullRestart: Button;
        btnStop: Button;
      }

      enum PanelID {
        ComboScore = "ComboScore",
      }

      enum CssClass {
        Hide = "Hide",
        ChallengeHide = Hide,
        ComboScore = "Level2",
        StepOptional = "ComboStepOptional",
        SplashShow = "Show",
        SplashStart = "start",
        SplashSuccess = "success",
        SplashFailure = "failure",
        ScoreFailure = "Failed",
        TimerHide = Hide,
        WaitProgressHide = Hide,
      }

      enum Timing {
        StartDelay = 0.5,
        BumpDelay = 0.2,
      }

      enum ComboState {
        Start = "start",
        Success = "success",
        Failure = "failure",
      }

      const SCORE_CLASSES = {
        [ComboState.Failure]: CssClass.ScoreFailure,
      };

      const SOUND_EVENTS = {
        [ComboState.Success]: SoundEvent.InvokerKidTakeoverStinger,
        [ComboState.Failure]: SoundEvent.Death,
      };

      const SPLASH_MAX_INDICES = {
        [ComboState.Start]: { title: 1, help: 1 },
        [ComboState.Success]: { title: 2, help: 7 },
        [ComboState.Failure]: { title: 3, help: 9 },
      };

      const SPLASH_CLASSES = {
        [ComboState.Start]: CssClass.SplashStart,
        [ComboState.Success]: CssClass.SplashSuccess,
        [ComboState.Failure]: CssClass.SplashFailure,
      };

      enum HudMode {
        Visible = "visible",
        HideSequence = "hide_sequence",
        NoHands = "no_hands",
      }

      const HUD_MODES_CYCLE: { [E in HudMode]: HudMode } = {
        [HudMode.Visible]: HudMode.HideSequence,
        [HudMode.HideSequence]: HudMode.NoHands,
        [HudMode.NoHands]: HudMode.Visible,
      };

      const HUD_VISIBILITY_CLASSES = {
        [HudMode.Visible]: "HudVisible",
        [HudMode.HideSequence]: "HudHideSequence",
        [HudMode.NoHands]: "HudNoHands",
      };

      enum DVar {
        HudVisibility = "hud_visibility",
        WaitProgressValue = "wait_seconds",
      }

      interface Timer {
        start?: number;
        update: boolean;
        schedule?: number;
      }

      export class Challenge extends Component<Elements> {
        combo: Combo | undefined;
        comboScore: ComboScore;
        comboSteps: Map<StepID, ChallengeComboStep> = new Map();
        hudMode: HudMode = HudMode.Visible;
        timer: Timer = { update: false };
        finished = false;

        constructor() {
          super({
            elements: {
              sequence: "ChallengeSequence",
              splash: "ChallengeSplash",
              splashTitle: "ChallengeSplashTitle",
              splashHelp: "ChallengeSplashHelp",
              score: "ChallengeScore",
              timer: "ChallengeTimer",
              timerLabel: "ChallengeTimerLabel",
              waitProgress: "ChallengeWaitProgress",
              waitProgressBar: "ChallengeWaitProgressBar",
              btnShowDetails: "BtnShowDetails",
              btnCycleHUD: "BtnCycleHUD",
              btnRestart: "BtnRestart",
              btnFullRestart: "BtnFullRestart",
              btnStop: "BtnStop",
            },
            customEvents: {
              [CustomGameEvent.COMBO_STARTED]: (payload) => this.onComboStarted(payload),
              [CustomGameEvent.COMBO_STOPPED]: (payload) => this.onComboStopped(payload),
              [CustomGameEvent.COMBO_IN_PROGRESS]: (payload) => this.onComboInProgress(payload),
              [CustomGameEvent.COMBO_PROGRESS]: (payload) => this.onComboProgress(payload),
              [CustomGameEvent.COMBO_STEP_ERROR]: (payload) => this.onComboStepError(payload),
              [CustomGameEvent.COMBO_PRE_FINISH]: (payload) => this.onComboPreFinish(payload),
              [CustomGameEvent.COMBO_FINISHED]: (payload) => this.onComboFinished(payload),
            },
            panelEvents: {
              btnShowDetails: { onactivate: () => this.ShowDetails() },
              btnCycleHUD: { onactivate: () => this.CycleHUD() },
              btnRestart: { onactivate: () => this.Restart(false) },
              btnFullRestart: { onactivate: () => this.Restart(true) },
              btnStop: { onactivate: () => this.Stop() },
            },
          });

          this.comboScore = this.createComboScore(this.elements.score);

          this.initHudVisibility(this.hudMode);
          this.debug("init");
        }

        // --- Event handlers -----

        onComboStarted(payload: NetworkedData<custom_events.ComboStarted>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboStarted()", payload);
          this.start(payload.id, Lua.indexArray(payload.next));
        }

        onComboStopped(payload: NetworkedData<custom_events.ComboStopped>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboStopped()", payload);
          this.stop(payload.id);
        }

        onComboInProgress(payload: NetworkedData<custom_events.ComboInProgress>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboInProgress()", payload);
          this.inProgress(payload.id);
        }

        onComboProgress(payload: NetworkedData<custom_events.ComboProgress>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboProgress()", payload);
          this.progress(payload.id, payload.metrics, Lua.indexArray(payload.next));
        }

        onComboStepError(payload: NetworkedData<custom_events.ComboStepError>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboStepError()", payload);
          this.fail(payload.id, Lua.indexArray(payload.expected), payload.ability);
        }

        onComboPreFinish(payload: NetworkedData<custom_events.ComboPreFinish>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboPreFinish()", payload);
          this.preFinish(payload.id, payload.metrics, payload.wait);
        }

        onComboFinished(payload: NetworkedData<custom_events.ComboFinished>) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboFinished()", payload);
          this.finish(payload.id, payload.metrics);
        }

        // ----- Helpers -----

        sendStop() {
          this.sendServer(CustomGameEvent.COMBO_STOP, {});
        }

        sendRestart(isHardReset: boolean) {
          this.sendServer(CustomGameEvent.COMBO_RESTART, { hardReset: isHardReset });
        }

        sendRenderViewer(combo: Combo) {
          this.sendClientSide(GameEvent.VIEWER_RENDER, { id: combo.id });
        }

        getComboStep(id: StepID) {
          const step = this.comboSteps.get(id);

          if (step == null) {
            throw new Error(`Could not find ChallengeComboStep for step id ${id}`);
          }

          return step;
        }

        createComboScore(parent: Panel) {
          const component = this.create(Layout.LayoutID.ComboScore, PanelID.ComboScore, parent);

          component.panel.AddClass(CssClass.ComboScore);

          return component;
        }

        createStepPanel(parent: Panel, step: Step) {
          if (this.combo == null) {
            throw new Error("Tried to createStepPanel() without combo");
          }

          const id = `combo_step_${step.name}_${step.id}`;
          const component = this.create(Layout.LayoutID.ChallengeComboStep, id, parent);

          if (!step.required) {
            component.panel.AddClass(CssClass.StepOptional);
          }

          this.comboSteps.set(step.id, component);

          component.input("SetStep", { combo: this.combo, step: step });

          return component;
        }

        scrollToStepPanel(stepID: StepID) {
          this.getComboStep(stepID).panel.ScrollParentToMakePanelFit(1, false);
        }

        stepPanelInput<K extends keyof ChallengeComboStep.Inputs>(
          stepID: StepID,
          input: K,
          payload: ChallengeComboStep.Inputs[K],
        ) {
          this.getComboStep(stepID).input(input, payload);
        }

        bumpStepPanel(stepID: StepID) {
          return this.stepPanelInput(stepID, "StepBump", undefined);
        }

        activateStepPanel(stepID: StepID) {
          return this.stepPanelInput(stepID, "SetStepActive", undefined);
        }

        deactivateStepPanel(stepID: StepID) {
          return this.stepPanelInput(stepID, "UnsetStepActive", undefined);
        }

        failStepPanel(stepID: StepID) {
          return this.stepPanelInput(stepID, "SetStepError", undefined);
        }

        clearFailedStepPanel(stepID: StepID) {
          return this.stepPanelInput(stepID, "UnsetStepError", undefined);
        }

        startTimer() {
          this.timer.start = Date.now();
          this.timer.update = true;

          this.debug("startTimer()", this.timer);
          this.updateTimer();
        }

        updateTimer() {
          if (this.timer.start == null || !this.timer.update) return;

          this.elements.timerLabel.text = ((Date.now() - this.timer.start) / 1000).toFixed(1);

          $.Schedule(0.1, () => this.updateTimer());
        }

        stopTimer() {
          this.timer.update = false;
        }

        // ----- Component actions -----

        showAction() {
          return new RemoveClassAction(this.panel, CssClass.ChallengeHide);
        }

        hideAction() {
          return new ParallelSequence()
            .Action(this.hideSplashAction())
            .Action(this.hideScoreAction())
            .AddClass(this.panel, CssClass.ChallengeHide);
        }

        // ----- Sequence actions -----

        renderSequenceAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          this.comboSteps.clear();

          const bumpSeq = this.staggeredSequenceOnStepPanels(
            Timing.BumpDelay,
            this.combo.sequence,
            this.bumpStepPanel.bind(this),
          );

          return new Sequence()
            .Action(this.resetSequenceAction())
            .Action(this.createStepPanelsAction())
            .Action(bumpSeq);
        }

        resetSequenceAction() {
          return new Sequence()
            .ScrollToTop(this.elements.sequence)
            .RemoveChildren(this.elements.sequence);
        }

        createStepPanelsAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          const actions = this.combo.sequence.map((step) =>
            this.createStepPanelAction(this.elements.sequence, step),
          );

          return new Sequence().Action(...actions);
        }

        createStepPanelAction(parent: Panel, step: Step) {
          return new RunFunctionAction(() => this.createStepPanel(parent, step));
        }

        sequenceActionsOnStepPanels(steps: Step[], fn: (this: this, stepID: StepID) => void) {
          return steps.map((step) => new RunFunctionAction(fn, step.id));
        }

        parallelSequenceOnStepPanels(steps: Step[], fn: (this: this, stepID: StepID) => void) {
          return new ParallelSequence().Action(...this.sequenceActionsOnStepPanels(steps, fn));
        }

        staggeredSequenceOnStepPanels(
          delay: number,
          steps: Step[],
          fn: (this: this, stepID: StepID) => void,
        ) {
          return new StaggeredSequence(delay).Action(
            ...this.sequenceActionsOnStepPanels(steps, fn),
          );
        }

        activateStepPanelsAction(steps: Step[]) {
          const seq = new Sequence();

          if (steps.length === 0) {
            return seq;
          }

          const activateSeq = this.parallelSequenceOnStepPanels(
            steps,
            this.activateStepPanel.bind(this),
          );

          return seq
            .Function(() => {
              const firstStep = steps[0];

              if (firstStep) {
                this.scrollToStepPanel(firstStep.id);
              }
            })
            .Action(activateSeq);
        }

        deactivateStepPanelsAction(steps: Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.deactivateStepPanel.bind(this));
        }

        bumpStepPanelsAction(steps: Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.bumpStepPanel.bind(this));
        }

        failStepPanelsAction(steps: Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.failStepPanel.bind(this));
        }

        clearFailedStepPanelsAction(steps: Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.clearFailedStepPanel.bind(this));
        }

        // ----- HUD actions -----

        resetHudVisibilityActions() {
          return Object.values(HUD_VISIBILITY_CLASSES).map(
            (cls) => new RemoveClassAction(this.panel, cls),
          );
        }

        updateHudVisibilityTooltipAction(mode: HudMode) {
          const hudVisibilityTooltip = L10n.lp(L10n.Key.HudVisibilityPrefix, mode);

          return new SetDialogVariableAction(this.panel, DVar.HudVisibility, hudVisibilityTooltip);
        }

        switchHudAction(prevMode: HudMode, nextMode: HudMode) {
          const prevClass = HUD_VISIBILITY_CLASSES[prevMode];
          const nextClass = HUD_VISIBILITY_CLASSES[nextMode];
          const heroHudFn =
            nextMode === HudMode.NoHands ? this.hideActionPanelUI : this.showActionPanelUI;

          return new Sequence()
            .Action(this.updateHudVisibilityTooltipAction(nextMode))
            .ReplaceClass(this.panel, prevClass, nextClass)
            .Function(heroHudFn.bind(this));
        }

        // ----- Splash actions -----

        clearSplashAction() {
          return new ParallelSequence()
            .RemoveClass(this.elements.splash, CssClass.SplashStart)
            .RemoveClass(this.elements.splash, CssClass.SplashSuccess)
            .RemoveClass(this.elements.splash, CssClass.SplashFailure);
        }

        showSplashAction(state: ComboState) {
          const titleIndex = randomInt(1, SPLASH_MAX_INDICES[state].title);
          const titleText = L10n.lp(L10n.Key.SplashPrefix, state, "title", titleIndex.toString());

          const helpIndex = randomInt(1, SPLASH_MAX_INDICES[state].help);
          const helpText = L10n.lp(L10n.Key.SplashPrefix, state, "help", helpIndex.toString());

          const actions = new ParallelSequence()
            .Action(this.clearSplashAction())
            .SetAttribute(this.elements.splashTitle, "text", titleText)
            .SetAttribute(this.elements.splashHelp, "text", helpText)
            .AddClass(this.elements.splash, SPLASH_CLASSES[state]);

          return new Sequence().Action(actions).AddClass(this.elements.splash, CssClass.SplashShow);
        }

        hideSplashAction() {
          return new ParallelSequence()
            .Action(this.clearSplashAction())
            .RemoveClass(this.elements.splash, CssClass.SplashShow);
        }

        // ----- Score actions -----

        updateScoreCounterAction(count: number) {
          return new RunFunctionAction(() => this.comboScore.input("UpdateCounter", { count }));
        }

        updateScoreSummaryAction(options: ComboScore.Inputs["UpdateSummary"]) {
          return new RunFunctionAction(() => this.comboScore.input("UpdateSummary", options));
        }

        hideScoreAction() {
          return new Sequence()
            .RemoveClass(this.elements.score, CssClass.ScoreFailure)
            .Function(() => this.comboScore.input("Hide", undefined));
        }

        showTimerAction() {
          return new RemoveClassAction(this.elements.timer, CssClass.TimerHide);
        }

        hideTimerAction() {
          return new AddClassAction(this.elements.timer, CssClass.TimerHide);
        }

        countdownWaitAction(wait: number) {
          const animate = new ParallelSequence()
            .AnimateDialogVariableInt(
              this.elements.waitProgress,
              DVar.WaitProgressValue,
              wait,
              0,
              wait,
            )
            .AnimateProgressBar(this.elements.waitProgressBar, wait, 0, wait);

          return new Sequence()
            .SetAttribute(this.elements.waitProgressBar, "max", wait)
            .RemoveClass(this.elements.waitProgress, CssClass.WaitProgressHide)
            .Action(animate)
            .AddClass(this.elements.waitProgress, CssClass.WaitProgressHide);
        }

        // ----- Composite actions -----

        progressWhenInProgressAction(metrics: Metrics, next: number[]) {
          if (this.combo == null) {
            return new NoopAction();
          }

          const nextSteps = pick(this.combo.sequence, next);

          if (!nextSteps.every((s): s is Step => s != null)) {
            throw new Error(
              `Failed to pick next steps from combo ${this.combo.id}: steps count = ${
                this.combo.sequence.length
              }, indices = [${next.join(", ")}]`,
            );
          }

          return new Sequence()
            .Action(this.clearFailedStepPanelsAction(this.combo.sequence))
            .Action(this.deactivateStepPanelsAction(this.combo.sequence))
            .Action(this.activateStepPanelsAction(nextSteps))
            .Action(this.updateScoreCounterAction(metrics.count || 0));
        }

        progressWhenFinishedAction(metrics: Metrics) {
          const scoreSummaryOptions = {
            count: metrics.count || 0,
            endDamage: metrics.damage || 0,
          };

          return this.updateScoreSummaryAction(scoreSummaryOptions);
        }

        // ----- Action runners -----

        initHudVisibility(mode: HudMode) {
          new Sequence()
            .Action(this.updateHudVisibilityTooltipAction(mode))
            .Action(...this.resetHudVisibilityActions())
            .AddClass(this.panel, HUD_VISIBILITY_CLASSES[mode])
            .Run();
        }

        start(id: ComboID, next: number[]) {
          this.combo = COMBOS.get(id);

          if (this.combo == null) {
            this.warn("Tried to start() an invalid combo", { id });
            return;
          }

          this.finished = false;

          const seq = new Sequence()
            .Action(this.hideScoreAction())
            .Action(this.hideSplashAction())
            .Action(this.hideTimerAction())
            .Wait(Timing.StartDelay)
            .Action(this.showAction())
            .Action(this.renderSequenceAction())
            .Action(this.showSplashAction(ComboState.Start))
            .Wait(0.25)
            .Function(() => this.progress(id, {}, next));

          this.debugFn(() => ["start()", { id, actions: seq.size() }]);

          seq.Run();
        }

        stop(id: ComboID) {
          if (this.combo == null) {
            this.warn("Tried to stop() without combo", { id });
            return;
          }

          this.stopTimer();

          this.combo = undefined;
          this.finished = false;

          const seq = new Sequence().Action(this.hideAction()).Action(this.hideTimerAction());

          this.debugFn(() => ["stop()", { id: id, actions: seq.size() }]);

          seq.Run();
        }

        inProgress(id: ComboID) {
          if (this.combo == null) {
            this.warn("Tried to inProgress() without combo", { id });
            return;
          }

          const seq = new Sequence().Action(this.showTimerAction()).Action(this.hideSplashAction());

          this.debugFn(() => ["inProgress()", { id: id }]);
          this.startTimer();

          seq.Run();
        }

        progress(id: ComboID, metrics: Metrics, next: number[]) {
          if (this.combo == null) {
            this.warn("Tried to progress() without combo", { id });
            return;
          }

          const seq = new Sequence();

          if (this.finished) {
            seq.Action(this.progressWhenFinishedAction(metrics));
          } else {
            seq.Action(this.progressWhenInProgressAction(metrics, next));
          }

          this.debugFn(() => [
            "progress()",
            { id: id, metrics: metrics, next: next, actions: seq.size() },
          ]);

          seq.Run();
        }

        preFinish(id: ComboID, metrics: Metrics, wait: number) {
          if (this.combo == null) {
            this.warn("Tried to preFinish() without combo", { id });
            return;
          }

          const options = {
            count: metrics.count || 0,
            startDamage: 0,
            endDamage: metrics.damage || 0,
          };

          this.finished = true;

          const seq = new Sequence()
            .Action(this.deactivateStepPanelsAction(this.combo.sequence))
            .Action(this.bumpStepPanelsAction(this.combo.sequence))
            .Action(this.updateScoreSummaryAction(options))
            .Action(this.countdownWaitAction(wait));

          this.debugFn(() => ["preFinish()", { id: id, actions: seq.size(), ...options }]);

          seq.Run();
        }

        finish(id: ComboID, metrics: Metrics) {
          if (this.combo == null) {
            this.warn("Tried to finish() without combo", { id });
            return;
          }

          this.stopTimer();

          const options = {
            count: metrics.count || 0,
            endDamage: metrics.damage || 0,
          };

          const state = ComboState.Success;
          const seq = new Sequence()
            .PlaySoundEffect(SOUND_EVENTS[state])
            .Action(this.showSplashAction(state))
            .Action(this.updateScoreSummaryAction(options));

          this.debugFn(() => ["finish()", { id, state, actions: seq.size(), ...options }]);

          seq.Run();
        }

        fail(id: ComboID, expected: number[], ability: string) {
          if (this.combo == null) {
            this.warn("Tried to fail() without combo", { id });
            return;
          }

          this.stopTimer();

          const state = ComboState.Failure;
          const expectedSteps = pick(this.combo.sequence, expected);

          if (!expectedSteps.every((s): s is Step => s != null)) {
            throw new Error(
              `Failed to pick steps from combo ${id}: steps count = ${
                this.combo.sequence.length
              }, indices = [${expected.join(", ")}]`,
            );
          }

          const seq = new Sequence()
            .PlaySoundEffect(SOUND_EVENTS[state])
            .Action(this.showSplashAction(state))
            .AddClass(this.elements.score, SCORE_CLASSES[state])
            .Action(this.failStepPanelsAction(expectedSteps))
            .Action(this.bumpStepPanelsAction(expectedSteps))
            .Action(this.hideTimerAction());

          this.debugFn(() => ["fail()", { id, state, ability, expected, actions: seq.size() }]);

          seq.Run();
        }

        cycleHUD() {
          const prev = this.hudMode;

          this.hudMode = HUD_MODES_CYCLE[this.hudMode];

          const next = this.hudMode;
          const seq = this.switchHudAction(prev, next);

          this.debugFn(() => ["cycleHUD()", { prev, next, actions: seq.size() }]);

          return seq.Run();
        }

        // ----- UI methods -----

        Restart(isHardReset: boolean) {
          this.debugFn(() => ["Restart()", { isHardReset: isHardReset }]);
          this.sendRestart(!!isHardReset);
        }

        Stop() {
          this.debug("Stop()");
          this.sendStop();
        }

        ShowDetails() {
          if (this.combo == null) {
            this.warn("Tried to ShowDetails() without combo");
            return;
          }

          this.debug("ShowDetails()");
          this.sendRenderViewer(this.combo);
        }

        CycleHUD() {
          this.cycleHUD();
        }
      }

      export const component = new Challenge();
    }
  }
}
