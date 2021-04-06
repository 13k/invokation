"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _, L10n, COMBOS } = global;
  const { LuaIndexArray } = global.Util;
  const { CSS_CLASSES, EVENTS, FREESTYLE_COMBO_ID, LAYOUTS } = global.Const;
  const {
    Sequence,
    ParallelSequence,
    StaggeredSequence,
    RunFunctionAction,
    RemoveClassAction,
    AddClassAction,
    SetDialogVariableAction,
  } = global.Sequence;

  const CHILDREN = {
    COMBO_SCORE: {
      id: "score-component",
      cssClass: "level2",
    },
  };

  const STATES = {
    START: "start",
    SUCCESS: "success",
    FAILURE: "failure",
  };

  const DIALOG_VARS = {
    HUD_VISIBILITY: "hud_visibility",
    WAIT_PROGRESS: {
      WAIT_SECONDS: "wait_seconds",
      MAX: "max",
    },
  };

  const START_DELAY = 0.5;
  const BUMP_DELAY = 0.2;

  const L10N_PREFIXES = {
    HUD_VISIBILITY: "invokation_combo_hud_visibility",
    SPLASH: "invokation_combo_splash",
  };

  const SOUNDS = {
    [STATES.SUCCESS]: "kidvoker_takeover_stinger",
    [STATES.FAILURE]: "ui.death_stinger",
  };

  const SPLASH_MAX_INDICES = {
    [STATES.START]: { title: 1, help: 1 },
    [STATES.SUCCESS]: { title: 2, help: 7 },
    [STATES.FAILURE]: { title: 3, help: 9 },
  };

  const SPLASH_CLASSES = {
    [STATES.START]: "start",
    [STATES.SUCCESS]: "success",
    [STATES.FAILURE]: "failure",
  };

  const HUD_MODES = {
    VISIBLE: "visible",
    HIDE_SEQ: "hide_seq",
    NO_HANDS: "no_hands",
  };

  const HUD_MODES_CLASSES = {
    [HUD_MODES.VISIBLE]: "hud-visible",
    [HUD_MODES.HIDE_SEQ]: "hud-hide-sequence",
    [HUD_MODES.NO_HANDS]: "hud-no-hands",
  };

  const SCORE_CLASSES = {
    [STATES.FAILURE]: "failed",
  };

  const SCORE_INPUTS = {
    HIDE: "Hide",
    UPDATE_COUNTER: "UpdateCounter",
    UPDATE_SUMMARY: "UpdateSummary",
  };

  const COMBO_STEP_INPUTS = {
    SET_STEP: "SetStep",
    BUMP: "StepBump",
    SET_ACTIVE: "SetStepActive",
    UNSET_ACTIVE: "UnsetStepActive",
    SET_ERROR: "SetStepError",
    UNSET_ERROR: "UnsetStepError",
  };

  const comboStepId = ({ id, name }) => `combo_step_${name}_${id}`;

  class Challenge extends Component {
    constructor() {
      super({
        elements: {
          sequence: "sequence",
          splash: "splash",
          splashTitle: "splash-title",
          splashHelp: "splash-help",
          score: "score",
          timer: "timer",
          timerLabel: "timer-label",
          waitProgress: "wait-progress",
          waitProgressBar: "wait-progressbar",
        },
        customEvents: {
          "!COMBO_STARTED": "onComboStarted",
          "!COMBO_STOPPED": "onComboStopped",
          "!COMBO_IN_PROGRESS": "onComboInProgress",
          "!COMBO_PROGRESS": "onComboProgress",
          "!COMBO_STEP_ERROR": "onComboStepError",
          "!COMBO_PRE_FINISH": "onComboPreFinish",
          "!COMBO_FINISHED": "onComboFinished",
        },
      });

      this.hudMode = HUD_MODES.VISIBLE;
      this.timer = {
        start: null,
        update: false,
        schedule: null,
      };

      this.$comboScore = this.createComboScorePanel(this.$score);

      this.initHudVisibility(this.hudMode);
      this.debug("init");
    }

    // --- Event handlers -----

    onComboStarted(payload) {
      const { id, next } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStarted()", payload);
      this.start(id, LuaIndexArray(next));
    }

    onComboStopped(payload) {
      const { id } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStopped()", payload);
      this.stop(id);
    }

    onComboInProgress(payload) {
      const { id } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboInProgress()", payload);
      this.inProgress(id);
    }

    onComboProgress(payload) {
      const { id, metrics, next } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboProgress()", payload);
      this.progress(id, metrics, LuaIndexArray(next));
    }

    onComboStepError(payload) {
      const { id, ability, expected } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboStepError()", payload);
      this.fail(id, LuaIndexArray(expected), ability);
    }

    onComboPreFinish(payload) {
      const { id, metrics, wait } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboPreFinish()", payload);
      this.preFinish(id, metrics, wait);
    }

    onComboFinished(payload) {
      const { id, metrics } = payload;

      if (id === FREESTYLE_COMBO_ID) {
        return;
      }

      this.debug("onComboFinished()", payload);
      this.finish(id, metrics);
    }

    // ----- Helpers -----

    sendStop() {
      this.sendServer(EVENTS.COMBO_STOP);
    }

    sendRestart(isHardReset) {
      this.sendServer(EVENTS.COMBO_RESTART, { hardReset: isHardReset });
    }

    sendRenderViewer(combo) {
      this.sendClientSide(EVENTS.VIEWER_RENDER, { id: combo.id });
    }

    createComboScorePanel(parent) {
      const { id, cssClass } = CHILDREN.COMBO_SCORE;

      return this.createComponent(parent, id, LAYOUTS.COMBO_SCORE, {
        classes: [cssClass],
      });
    }

    createStepPanel(parent, step) {
      const id = comboStepId(step);
      const panel = this.createComponent(parent, id, LAYOUTS.CHALLENGE.COMBO_STEP);

      this.stepsPanels[step.id] = panel;

      panel.component.Input(COMBO_STEP_INPUTS.SET_STEP, { combo: this.combo, step });

      return panel;
    }

    scrollToStepPanel(step) {
      const panel = this.stepsPanels[step.id];
      panel.ScrollParentToMakePanelFit(1, false);
    }

    stepPanelInput(step, input) {
      const panel = this.stepsPanels[step.id];
      panel.component.Input(input);
    }

    bumpStepPanel(step) {
      return this.stepPanelInput(step, COMBO_STEP_INPUTS.BUMP);
    }

    activateStepPanel(step) {
      return this.stepPanelInput(step, COMBO_STEP_INPUTS.SET_ACTIVE);
    }

    deactivateStepPanel(step) {
      return this.stepPanelInput(step, COMBO_STEP_INPUTS.UNSET_ACTIVE);
    }

    failStepPanel(step) {
      return this.stepPanelInput(step, COMBO_STEP_INPUTS.SET_ERROR);
    }

    clearFailedStepPanel(step) {
      return this.stepPanelInput(step, COMBO_STEP_INPUTS.UNSET_ERROR);
    }

    startTimer() {
      this.timer.start = Date.now();
      this.timer.update = true;
      this.debug("startTimer()", this.timer);
      this.updateTimer();
    }

    updateTimer() {
      if (!this.timer.update) {
        return;
      }

      this.$timerLabel.text = ((Date.now() - this.timer.start) / 1000).toFixed(1);

      $.Schedule(0.1, this.updateTimer.bind(this));
    }

    stopTimer() {
      this.timer.start = null;
      this.timer.update = false;
    }

    // ----- Component actions -----

    showAction() {
      return new RemoveClassAction(this.$ctx, CSS_CLASSES.HIDE);
    }

    hideAction() {
      return new ParallelSequence()
        .Action(this.hideSplashAction())
        .Action(this.hideScoreAction())
        .AddClass(this.$ctx, CSS_CLASSES.HIDE);
    }

    // ----- Sequence actions -----

    renderSequenceAction() {
      this.stepsPanels = {};

      const bumpSeq = this.staggeredSequenceOnStepPanels(
        BUMP_DELAY,
        this.combo.sequence,
        "bumpStepPanel"
      );

      return new Sequence()
        .Action(this.resetSequenceAction())
        .Action(this.createStepPanelsAction())
        .Action(bumpSeq);
    }

    resetSequenceAction() {
      return new Sequence().ScrollToTop(this.$sequence).RemoveChildren(this.$sequence);
    }

    createStepPanelsAction() {
      const createActions = _.map(
        this.combo.sequence,
        _.bind(this.createStepPanelAction, this, this.$sequence)
      );

      return new Sequence().Action(createActions);
    }

    createStepPanelAction(parent, step) {
      return new RunFunctionAction(() => this.createStepPanel(parent, step));
    }

    sequenceActionsOnStepPanels(steps, fn) {
      fn = this.handler(fn);

      return _.map(steps, (step) => new RunFunctionAction(fn, step));
    }

    parallelSequenceOnStepPanels(steps, fn) {
      return new ParallelSequence().Action(this.sequenceActionsOnStepPanels(steps, fn));
    }

    staggeredSequenceOnStepPanels(delay, steps, fn) {
      return new StaggeredSequence(delay).Action(this.sequenceActionsOnStepPanels(steps, fn));
    }

    activateStepPanelsAction(steps) {
      const seq = new Sequence();

      if (_.isEmpty(steps)) {
        return seq;
      }

      const activateSeq = this.parallelSequenceOnStepPanels(steps, "activateStepPanel");

      return seq.RunFunction(() => this.scrollToStepPanel(steps[0])).Action(activateSeq);
    }

    deactivateStepPanelsAction(steps) {
      return this.parallelSequenceOnStepPanels(steps, "deactivateStepPanel");
    }

    bumpStepPanelsAction(steps) {
      return this.parallelSequenceOnStepPanels(steps, "bumpStepPanel");
    }

    failStepPanelsAction(steps) {
      return this.parallelSequenceOnStepPanels(steps, "failStepPanel");
    }

    clearFailedStepPanelsAction(steps) {
      return this.parallelSequenceOnStepPanels(steps, "clearFailedStepPanel");
    }

    // ----- HUD actions -----

    resetHudVisibilityActions() {
      return _.map(HUD_MODES_CLASSES, (cls) => new RemoveClassAction(this.$ctx, cls));
    }

    updateHudVisibilityTooltipAction(mode) {
      const hudVisibilityTooltip = L10n.LocalizeParameterized(L10N_PREFIXES.HUD_VISIBILITY, mode);

      return new SetDialogVariableAction(
        this.$ctx,
        DIALOG_VARS.HUD_VISIBILITY,
        hudVisibilityTooltip
      );
    }

    switchHudAction(prevMode, nextMode) {
      const prevClass = HUD_MODES_CLASSES[prevMode];
      const nextClass = HUD_MODES_CLASSES[nextMode];
      const heroHudFn =
        nextMode === HUD_MODES.NO_HANDS ? this.hideActionPanelUI : this.showActionPanelUI;

      return new Sequence()
        .Action(this.updateHudVisibilityTooltipAction(nextMode))
        .ReplaceClass(this.$ctx, prevClass, nextClass)
        .RunFunction(heroHudFn.bind(this));
    }

    // ----- Splash actions -----

    clearSplashAction() {
      return new ParallelSequence()
        .RemoveClass(this.$splash, SPLASH_CLASSES[STATES.START])
        .RemoveClass(this.$splash, SPLASH_CLASSES[STATES.SUCCESS])
        .RemoveClass(this.$splash, SPLASH_CLASSES[STATES.FAILURE]);
    }

    showSplashAction(state) {
      const titleIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "title"], 1));
      const helpIndex = _.random(1, _.get(SPLASH_MAX_INDICES, [state, "help"], 1));
      const title = L10n.LocalizeParameterized(L10N_PREFIXES.SPLASH, [state, "title", titleIndex]);
      const help = L10n.LocalizeParameterized(L10N_PREFIXES.SPLASH, [state, "help", helpIndex]);

      const actions = new ParallelSequence()
        .Action(this.clearSplashAction())
        .SetAttribute(this.$splashTitle, "text", title)
        .SetAttribute(this.$splashHelp, "text", help)
        .AddClass(this.$splash, state);

      return new Sequence().Action(actions).AddClass(this.$splash, CSS_CLASSES.SHOW);
    }

    hideSplashAction() {
      return new ParallelSequence()
        .Action(this.clearSplashAction())
        .RemoveClass(this.$splash, CSS_CLASSES.SHOW);
    }

    // ----- Score actions -----

    updateScoreCounterAction(count) {
      return new RunFunctionAction(() =>
        this.$comboScore.component.Input(SCORE_INPUTS.UPDATE_COUNTER, { count })
      );
    }

    updateScoreSummaryAction(options) {
      return new RunFunctionAction(() =>
        this.$comboScore.component.Input(SCORE_INPUTS.UPDATE_SUMMARY, options)
      );
    }

    hideScoreAction() {
      return new Sequence()
        .RemoveClass(this.$score, SCORE_CLASSES[STATES.FAILURE])
        .RunFunction(() => this.$comboScore.component.Input(SCORE_INPUTS.HIDE));
    }

    showTimerAction() {
      return new RemoveClassAction(this.$timer, CSS_CLASSES.HIDE);
    }

    hideTimerAction() {
      return new AddClassAction(this.$timer, CSS_CLASSES.HIDE);
    }

    countdownWaitAction(wait) {
      const animate = new ParallelSequence()
        .AnimateDialogVariableInt(
          this.$waitProgress,
          DIALOG_VARS.WAIT_PROGRESS.WAIT_SECONDS,
          wait,
          0,
          wait
        )
        .AnimateProgressBar(this.$waitProgressBar, wait, 0, wait);

      return new Sequence()
        .SetAttribute(this.$waitProgressBar, "max", wait)
        .RemoveClass(this.$waitProgress, CSS_CLASSES.HIDE)
        .Action(animate)
        .AddClass(this.$waitProgress, CSS_CLASSES.HIDE);
    }

    // ----- Composite actions -----

    progressWhenInProgressAction(metrics, next) {
      const nextSteps = _.at(this.combo.sequence, next);

      return new Sequence()
        .Action(this.clearFailedStepPanelsAction(this.combo.sequence))
        .Action(this.deactivateStepPanelsAction(this.combo.sequence))
        .Action(this.activateStepPanelsAction(nextSteps))
        .Action(this.updateScoreCounterAction(metrics.count));
    }

    progressWhenFinishedAction(metrics) {
      const scoreSummaryOptions = {
        count: metrics.count || 0,
        endDamage: metrics.damage || 0,
      };

      return this.updateScoreSummaryAction(scoreSummaryOptions);
    }

    // ----- Action runners -----

    initHudVisibility(mode) {
      return new Sequence()
        .Action(this.updateHudVisibilityTooltipAction(mode))
        .Action(this.resetHudVisibilityActions())
        .AddClass(this.$ctx, HUD_MODES_CLASSES[mode])
        .Start();
    }

    start(id, next) {
      this.combo = COMBOS.Get(id);
      this.finished = false;

      const seq = new Sequence()
        .Action(this.hideScoreAction())
        .Action(this.hideSplashAction())
        .Action(this.hideTimerAction())
        .Wait(START_DELAY)
        .Action(this.showAction())
        .Action(this.renderSequenceAction())
        .Action(this.showSplashAction(STATES.START))
        .Wait(0.25)
        .RunFunction(() => this.progress(this.combo.id, {}, next));

      this.debugFn(() => ["start()", { id: this.combo.id, actions: seq.size() }]);

      return seq.Start();
    }

    stop(id) {
      this.stopTimer();
      this.combo = null;
      this.finished = false;

      const seq = new Sequence().Action(this.hideAction()).Action(this.hideTimerAction());

      this.debugFn(() => ["stop()", { id, actions: seq.size() }]);

      return seq.Start();
    }

    inProgress(id) {
      const seq = new Sequence().Action(this.showTimerAction()).Action(this.hideSplashAction());

      this.debugFn(() => ["inProgress()", { id }]);
      this.startTimer();

      return seq.Start();
    }

    progress(id, metrics, next) {
      const seq = new Sequence();

      if (this.finished) {
        seq.Action(this.progressWhenFinishedAction(metrics));
      } else {
        seq.Action(this.progressWhenInProgressAction(metrics, next));
      }

      this.debugFn(() => ["progress()", { id, metrics, next, actions: seq.size() }]);

      return seq.Start();
    }

    preFinish(id, metrics, wait) {
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

      this.debugFn(() => ["preFinish()", _.assign({ id, actions: seq.size() }, options)]);

      return seq.Start();
    }

    finish(id, metrics) {
      this.stopTimer();

      const options = {
        count: metrics.count || 0,
        endDamage: metrics.damage || 0,
      };

      const seq = new Sequence()
        .PlaySoundEffect(SOUNDS[STATES.SUCCESS])
        .Action(this.showSplashAction(STATES.SUCCESS))
        .Action(this.updateScoreSummaryAction(options));

      this.debugFn(() => ["finish()", _.assign({ id, actions: seq.size() }, options)]);

      return seq.Start();
    }

    fail(id, expected, ability) {
      this.stopTimer();

      const expectedSteps = _.at(this.combo.sequence, expected);

      const seq = new Sequence()
        .PlaySoundEffect(SOUNDS.failure)
        .Action(this.showSplashAction(STATES.FAILURE))
        .AddClass(this.$score, SCORE_CLASSES[STATES.FAILURE])
        .Action(this.failStepPanelsAction(expectedSteps))
        .Action(this.bumpStepPanelsAction(expectedSteps))
        .Action(this.hideTimerAction());

      this.debugFn(() => ["fail()", { id, ability, expected, actions: seq.size() }]);

      return seq.Start();
    }

    toggleHUD() {
      const prevMode = this.hudMode;
      let nextMode = HUD_MODES.VISIBLE;

      switch (prevMode) {
        case HUD_MODES.VISIBLE:
          nextMode = HUD_MODES.HIDE_SEQ;
          break;
        case HUD_MODES.HIDE_SEQ:
          nextMode = HUD_MODES.NO_HANDS;
          break;
        case HUD_MODES.NO_HANDS:
          nextMode = HUD_MODES.VISIBLE;
          break;
      }

      this.hudMode = nextMode;
      const seq = this.switchHudAction(prevMode, nextMode);

      this.debugFn(() => ["toggleHUD()", { prevMode, nextMode, actions: seq.size() }]);

      return seq.Start();
    }

    // ----- UI methods -----

    Restart(isHardReset) {
      this.debugFn(() => ["Restart()", { isHardReset }]);
      this.sendRestart(!!isHardReset);
    }

    Stop() {
      this.debug("Stop()");
      this.sendStop();
    }

    ShowDetails() {
      this.debug("ShowDetails()");
      this.sendRenderViewer(this.combo);
    }

    ToggleHUD() {
      this.toggleHUD();
    }
  }

  context.challenge = new Challenge();
})(GameUI.CustomUIConfig(), this);
