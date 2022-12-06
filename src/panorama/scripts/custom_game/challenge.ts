namespace invk {
  export namespace Components {
    export namespace Challenge {
      export interface Elements extends Component.Elements {
        sequence: Panel;
        splash: Panel;
        splashTitle: LabelPanel;
        splashHelp: LabelPanel;
        score: Panel;
        timer: Panel;
        timerLabel: LabelPanel;
        waitProgress: ProgressBar;
        waitProgressBar: ProgressBar;
      }

      export type Inputs = never;
      export type Outputs = never;

      const {
        L10n,
        Layout,
        Lua,
        Vendor: { lodash: _ },
        Static: { COMBOS },
        Combo: { StaticID },
        CustomEvents: { Name: CustomEventName },
        Panorama: { SoundEvent },
        Sequence: {
          Sequence,
          ParallelSequence,
          StaggeredSequence,
          AddClassAction,
          NoopAction,
          RemoveClassAction,
          RunFunctionAction,
          SetDialogVariableAction,
        },
      } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        ComboScore = "ComboScore",
      }

      enum CssClass {
        ChallengeHide = "Hide",
        ComboScore = "Level2",
        StepOptional = "ComboStepOptional",
        SplashShow = "Show",
        SplashStart = "start",
        SplashSuccess = "success",
        SplashFailure = "failure",
        ScoreFailure = "Failed",
        TimerHide = "Hide",
        WaitProgressHide = "Hide",
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

      export class Challenge extends Component.Component<Elements, Inputs, Outputs> {
        combo?: Combo.Combo | undefined;
        comboScore: ComboScore.ComboScore;
        comboSteps: Record<Combo.StepID, ChallengeComboStep.ChallengeComboStep>;
        hudMode: HudMode;
        timer: Timer;
        finished: boolean;

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
            },
            customEvents: {
              COMBO_STARTED: "onComboStarted",
              COMBO_STOPPED: "onComboStopped",
              COMBO_IN_PROGRESS: "onComboInProgress",
              COMBO_PROGRESS: "onComboProgress",
              COMBO_STEP_ERROR: "onComboStepError",
              COMBO_PRE_FINISH: "onComboPreFinish",
              COMBO_FINISHED: "onComboFinished",
            },
          });

          this.combo = undefined;
          this.comboSteps = {};
          this.hudMode = HudMode.Visible;
          this.timer = { update: false };
          this.finished = false;
          this.comboScore = this.createComboScore(this.elements.score);

          this.initHudVisibility(this.hudMode);
          this.debug("init");
        }

        // --- Event handlers -----

        onComboStarted(payload: CustomEvents.ComboStarted) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboStarted()", payload);
          this.start(payload.id, Lua.indexArray(payload.next));
        }

        onComboStopped(payload: CustomEvents.ComboStopped) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboStopped()", payload);
          this.stop(payload.id);
        }

        onComboInProgress(payload: CustomEvents.ComboInProgress) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboInProgress()", payload);
          this.inProgress(payload.id);
        }

        onComboProgress(payload: CustomEvents.ComboProgress) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboProgress()", payload);
          this.progress(payload.id, payload.metrics, Lua.indexArray(payload.next));
        }

        onComboStepError(payload: CustomEvents.ComboStepError) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboStepError()", payload);
          this.fail(payload.id, Lua.indexArray(payload.expected), payload.ability);
        }

        onComboPreFinish(payload: CustomEvents.ComboPreFinish) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboPreFinish()", payload);
          this.preFinish(payload.id, payload.metrics, payload.wait);
        }

        onComboFinished(payload: CustomEvents.ComboFinished) {
          if (payload.id === StaticID.Freestyle) return;

          this.debug("onComboFinished()", payload);
          this.finish(payload.id, payload.metrics);
        }

        // ----- Helpers -----

        sendStop() {
          this.sendServer(CustomEventName.COMBO_STOP, {});
        }

        sendRestart(isHardReset: boolean) {
          this.sendServer(CustomEventName.COMBO_RESTART, { hardReset: isHardReset });
        }

        sendRenderViewer(combo: Combo.Combo) {
          this.sendClientSide(CustomEventName.VIEWER_RENDER, { id: combo.id });
        }

        getComboStep(id: Combo.StepID) {
          const step = this.comboSteps[id];

          if (!step) {
            throw new Error(`Could not find ChallengeComboStep for step id ${id}`);
          }

          return step;
        }

        createComboScore(parent: Panel) {
          const component = this.create(Layout.ID.ComboScore, PanelID.ComboScore, parent);

          component.panel.AddClass(CssClass.ComboScore);

          return component;
        }

        createStepPanel(parent: Panel, step: Combo.Step) {
          if (!this.combo) {
            throw new Error(`Tried to createStepPanel() without combo`);
          }

          const id = `combo_step_${step.name}_${step.id}`;
          const component = this.create(Layout.ID.ChallengeComboStep, id, parent);

          if (!step.required) {
            component.panel.AddClass(CssClass.StepOptional);
          }

          this.comboSteps[step.id] = component;

          component.Input("SetStep", { combo: this.combo, step: step });

          return component;
        }

        scrollToStepPanel(stepID: Combo.StepID) {
          this.getComboStep(stepID).panel.ScrollParentToMakePanelFit(1, false);
        }

        stepPanelInput<K extends keyof ChallengeComboStep.Inputs>(
          stepID: Combo.StepID,
          input: K,
          payload: ChallengeComboStep.Inputs[K]
        ) {
          this.getComboStep(stepID).Input(input, payload);
        }

        bumpStepPanel(stepID: Combo.StepID) {
          return this.stepPanelInput(stepID, "StepBump", {});
        }

        activateStepPanel(stepID: Combo.StepID) {
          return this.stepPanelInput(stepID, "SetStepActive", {});
        }

        deactivateStepPanel(stepID: Combo.StepID) {
          return this.stepPanelInput(stepID, "UnsetStepActive", {});
        }

        failStepPanel(stepID: Combo.StepID) {
          return this.stepPanelInput(stepID, "SetStepError", {});
        }

        clearFailedStepPanel(stepID: Combo.StepID) {
          return this.stepPanelInput(stepID, "UnsetStepError", {});
        }

        startTimer() {
          this.timer.start = Date.now();
          this.timer.update = true;

          this.debug("startTimer()", this.timer);
          this.updateTimer();
        }

        updateTimer() {
          if (!this.timer.start || !this.timer.update) return;

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
          if (!this.combo) {
            return new NoopAction();
          }

          this.comboSteps = {};

          const bumpSeq = this.staggeredSequenceOnStepPanels(
            Timing.BumpDelay,
            this.combo.sequence,
            this.bumpStepPanel.bind(this)
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
          if (!this.combo) {
            return new NoopAction();
          }

          const actions = _.map(this.combo.sequence, (step) =>
            this.createStepPanelAction(this.elements.sequence, step)
          );

          return new Sequence().Action(...actions);
        }

        createStepPanelAction(parent: Panel, step: Combo.Step) {
          return new RunFunctionAction(() => this.createStepPanel(parent, step));
        }

        sequenceActionsOnStepPanels(
          steps: Combo.Step[],
          fn: (this: this, stepID: Combo.StepID) => void
        ) {
          return _.map(steps, (step) => new RunFunctionAction(fn, step.id));
        }

        parallelSequenceOnStepPanels(
          steps: Combo.Step[],
          fn: (this: this, stepID: Combo.StepID) => void
        ) {
          return new ParallelSequence().Action(...this.sequenceActionsOnStepPanels(steps, fn));
        }

        staggeredSequenceOnStepPanels(
          delay: number,
          steps: Combo.Step[],
          fn: (this: this, stepID: Combo.StepID) => void
        ) {
          return new StaggeredSequence(delay).Action(
            ...this.sequenceActionsOnStepPanels(steps, fn)
          );
        }

        activateStepPanelsAction(steps: Combo.Step[]) {
          const seq = new Sequence();

          if (_.isEmpty(steps)) {
            return seq;
          }

          const activateSeq = this.parallelSequenceOnStepPanels(
            steps,
            this.activateStepPanel.bind(this)
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

        deactivateStepPanelsAction(steps: Combo.Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.deactivateStepPanel.bind(this));
        }

        bumpStepPanelsAction(steps: Combo.Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.bumpStepPanel.bind(this));
        }

        failStepPanelsAction(steps: Combo.Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.failStepPanel.bind(this));
        }

        clearFailedStepPanelsAction(steps: Combo.Step[]) {
          return this.parallelSequenceOnStepPanels(steps, this.clearFailedStepPanel.bind(this));
        }

        // ----- HUD actions -----

        resetHudVisibilityActions() {
          return _.map(HUD_VISIBILITY_CLASSES, (cls) => new RemoveClassAction(this.panel, cls));
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
          const titleIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "title"], 1));
          const titleText = L10n.lp(L10n.Key.SplashPrefix, state, "title", _.toString(titleIndex));

          const helpIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "help"], 1));
          const helpText = L10n.lp(L10n.Key.SplashPrefix, state, "help", _.toString(helpIndex));

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
          return new RunFunctionAction(() => this.comboScore.Input("UpdateCounter", { count }));
        }

        updateScoreSummaryAction(options: ComboScore.Inputs["UpdateSummary"]) {
          return new RunFunctionAction(() => this.comboScore.Input("UpdateSummary", options));
        }

        hideScoreAction() {
          return new Sequence()
            .RemoveClass(this.elements.score, CssClass.ScoreFailure)
            .Function(() => this.comboScore.Input("Hide", undefined));
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
              wait
            )
            .AnimateProgressBar(this.elements.waitProgressBar, wait, 0, wait);

          return new Sequence()
            .SetAttribute(this.elements.waitProgressBar, "max", wait)
            .RemoveClass(this.elements.waitProgress, CssClass.WaitProgressHide)
            .Action(animate)
            .AddClass(this.elements.waitProgress, CssClass.WaitProgressHide);
        }

        // ----- Composite actions -----

        progressWhenInProgressAction(metrics: Combo.Metrics, next: number[]) {
          if (!this.combo) {
            return new NoopAction();
          }

          const nextSteps = _.at(this.combo.sequence, next);

          return new Sequence()
            .Action(this.clearFailedStepPanelsAction(this.combo.sequence))
            .Action(this.deactivateStepPanelsAction(this.combo.sequence))
            .Action(this.activateStepPanelsAction(nextSteps))
            .Action(this.updateScoreCounterAction(metrics.count || 0));
        }

        progressWhenFinishedAction(metrics: Combo.Metrics) {
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

        start(id: Combo.ID, next: number[]) {
          this.combo = COMBOS.get(id);

          if (!this.combo) {
            this.warn("tried to start() an invalid combo", { id });
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

        stop(id: Combo.ID) {
          if (!this.combo) {
            this.warn("tried to stop() without combo", { id });
            return;
          }

          this.stopTimer();

          this.combo = undefined;
          this.finished = false;

          const seq = new Sequence().Action(this.hideAction()).Action(this.hideTimerAction());

          this.debugFn(() => ["stop()", { id: id, actions: seq.size() }]);

          seq.Run();
        }

        inProgress(id: Combo.ID) {
          if (!this.combo) {
            this.warn("tried to inProgress() without combo", { id });
            return;
          }

          const seq = new Sequence().Action(this.showTimerAction()).Action(this.hideSplashAction());

          this.debugFn(() => ["inProgress()", { id: id }]);
          this.startTimer();

          seq.Run();
        }

        progress(id: Combo.ID, metrics: Combo.Metrics, next: number[]) {
          if (!this.combo) {
            this.warn("tried to progress() without combo", { id });
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

        preFinish(id: Combo.ID, metrics: Combo.Metrics, wait: number) {
          if (!this.combo) {
            this.warn("tried to preFinish() without combo", { id });
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

        finish(id: Combo.ID, metrics: Combo.Metrics) {
          if (!this.combo) {
            this.warn("tried to finish() without combo", { id });
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

        fail(id: Combo.ID, expected: number[], ability: string) {
          if (!this.combo) {
            this.warn("tried to fail() without combo", { id });
            return;
          }

          this.stopTimer();

          const state = ComboState.Failure;
          const expectedSteps = _.at(this.combo.sequence, expected);
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
          const [prev, next] = [this.hudMode, (this.hudMode = HUD_MODES_CYCLE[this.hudMode])];
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
          if (!this.combo) {
            this.warn("tried to ShowDetails() without combo");
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
