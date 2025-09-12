import type { Combo, ComboId, Metrics, Step, StepId } from "@invokation/panorama-lib/combo";
import { StaticId } from "@invokation/panorama-lib/combo";
import type {
  ComboFinished,
  ComboInProgress,
  ComboPreFinish,
  ComboProgress,
  ComboStarted,
  ComboStepError,
  ComboStopped,
} from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent, GameEvent } from "@invokation/panorama-lib/custom_events";
import * as l10n from "@invokation/panorama-lib/l10n";
import * as lua from "@invokation/panorama-lib/lua";
import { SoundEvent } from "@invokation/panorama-lib/panorama";
import type { Action } from "@invokation/panorama-lib/sequence";
import {
  AddClassAction,
  NoopAction,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
  SetDialogVariableLocStringAction,
  StaggeredSequence,
} from "@invokation/panorama-lib/sequence";
import at from "lodash-es/at";
import random from "lodash-es/random";

import type { ChallengeComboStep } from "./challenge/combo_step";
import type { ComboScore, ComboScoreInputs } from "./combo_score";
import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface ChallengeElements extends Elements {
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
  btnCycleHud: Button;
  btnRestart: Button;
  btnFullRestart: Button;
  btnStop: Button;
}

enum PanelId {
  ComboScore = "ComboScore",
}

enum CssClass {
  Hide = "Hide",
  ComboScore = "Level2",
  StepOptional = "ComboStepOptional",
  SplashShow = "Show",
  SplashStart = "start",
  SplashSuccess = "success",
  SplashFailure = "failure",
  ScoreFailure = "Failed",
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

enum DialogVar {
  HudVisibility = "hud_visibility",
  WaitProgressValue = "wait_seconds",
}

interface Timer {
  start?: number;
  update: boolean;
  schedule?: number;
}

const { COMBOS } = GameUI.CustomUIConfig().invk;

export type { Challenge };

class Challenge extends Component<ChallengeElements> {
  combo: Combo | undefined;
  comboScore: ComboScore;
  comboSteps: Map<StepId, ChallengeComboStep> = new Map();
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
        btnCycleHud: "BtnCycleHUD",
        btnRestart: "BtnRestart",
        btnFullRestart: "BtnFullRestart",
        btnStop: "BtnStop",
      },
      customEvents: {
        [CustomGameEvent.ComboStarted]: (payload) => this.onComboStarted(payload),
        [CustomGameEvent.ComboStopped]: (payload) => this.onComboStopped(payload),
        [CustomGameEvent.ComboInProgress]: (payload) => this.onComboInProgress(payload),
        [CustomGameEvent.ComboProgress]: (payload) => this.onComboProgress(payload),
        [CustomGameEvent.ComboStepError]: (payload) => this.onComboStepError(payload),
        [CustomGameEvent.ComboPreFinish]: (payload) => this.onComboPreFinish(payload),
        [CustomGameEvent.ComboFinish]: (payload) => this.onComboFinished(payload),
      },
      panelEvents: {
        btnShowDetails: { onactivate: () => this.showDetails() },
        btnCycleHud: { onactivate: () => this.cycleHud() },
        btnRestart: { onactivate: () => this.restart(false) },
        btnFullRestart: { onactivate: () => this.restart(true) },
        btnStop: { onactivate: () => this.stop() },
      },
    });

    this.comboScore = this.createComboScore(this.elements.score);

    this.initHudVisibility(this.hudMode);
    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload: NetworkedData<ComboStarted>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboStarted()", payload);
    this.runStart(payload.id, lua.indexArray(payload.next));
  }

  onComboStopped(payload: NetworkedData<ComboStopped>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboStopped()", payload);
    this.runStop(payload.id);
  }

  onComboInProgress(payload: NetworkedData<ComboInProgress>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboInProgress()", payload);
    this.runInProgress(payload.id);
  }

  onComboProgress(payload: NetworkedData<ComboProgress>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboProgress()", payload);
    this.runProgress(payload.id, payload.metrics, lua.indexArray(payload.next));
  }

  onComboStepError(payload: NetworkedData<ComboStepError>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboStepError()", payload);
    this.runFail(payload.id, lua.indexArray(payload.expected), payload.ability);
  }

  onComboPreFinish(payload: NetworkedData<ComboPreFinish>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboPreFinish()", payload);
    this.runPreFinish(payload.id, payload.metrics, payload.wait);
  }

  onComboFinished(payload: NetworkedData<ComboFinished>): void {
    if (payload.id === StaticId.Freestyle) {
      return;
    }

    this.debug("onComboFinished()", payload);
    this.runFinish(payload.id, payload.metrics);
  }

  // ----- Helpers -----

  sendStop(): void {
    this.sendServer(CustomGameEvent.ComboStop, {});
  }

  sendRestart(isHardReset: boolean): void {
    this.sendServer(CustomGameEvent.ComboRestart, { hardReset: isHardReset });
  }

  sendRenderViewer(combo: Combo): void {
    this.sendClientSide(GameEvent.ViewerRender, { id: combo.id });
  }

  getComboStep(id: StepId): ChallengeComboStep {
    const step = this.comboSteps.get(id);

    if (step == null) {
      throw new Error(`Could not find ChallengeComboStep for step id ${id}`);
    }

    return step;
  }

  createComboScore(parent: Panel): ComboScore {
    const component = this.create(LayoutId.ComboScore, PanelId.ComboScore, parent);

    component.panel.AddClass(CssClass.ComboScore);

    return component;
  }

  createStepPanel(parent: Panel, step: Step): ChallengeComboStep {
    if (this.combo == null) {
      throw new Error("Tried to createStepPanel() without combo");
    }

    const id = `combo_step_${step.name}_${step.id}`;
    const component = this.create(LayoutId.ChallengeComboStep, id, parent);

    if (!step.required) {
      component.panel.AddClass(CssClass.StepOptional);
    }

    this.comboSteps.set(step.id, component);

    component.sendInputs({ setStep: { combo: this.combo, step } });

    return component;
  }

  scrollToStepPanel(stepId: StepId): void {
    this.getComboStep(stepId).panel.ScrollParentToMakePanelFit(1, false);
  }

  bumpStepPanel(stepId: StepId): void {
    this.getComboStep(stepId).sendInputs({ stepBump: undefined });
  }

  activateStepPanel(stepId: StepId): void {
    this.getComboStep(stepId).sendInputs({ setStepActive: undefined });
  }

  deactivateStepPanel(stepId: StepId): void {
    this.getComboStep(stepId).sendInputs({ unsetStepActive: undefined });
  }

  failStepPanel(stepId: StepId): void {
    this.getComboStep(stepId).sendInputs({ setStepError: undefined });
  }

  clearFailedStepPanel(stepId: StepId): void {
    this.getComboStep(stepId).sendInputs({ unsetStepError: undefined });
  }

  startTimer(): void {
    this.timer.start = Date.now();
    this.timer.update = true;

    this.debug("startTimer()", this.timer);
    this.updateTimer();
  }

  updateTimer(): void {
    if (this.timer.start == null || !this.timer.update) {
      return;
    }

    this.elements.timerLabel.text = ((Date.now() - this.timer.start) / 1000).toFixed(1);

    $.Schedule(0.05, () => this.updateTimer());
  }

  stopTimer(): void {
    this.timer.update = false;
  }

  // ----- Component actions -----

  showAction(): Action {
    return new RemoveClassAction(this.panel, CssClass.Hide);
  }

  hideAction(): Action {
    return new ParallelSequence()
      .add(this.hideSplashAction())
      .add(this.hideScoreAction())
      .addClass(this.panel, CssClass.Hide);
  }

  // ----- Sequence actions -----

  renderSequenceAction(): Action {
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
      .add(this.resetSequenceAction())
      .add(this.createStepPanelsAction())
      .add(bumpSeq);
  }

  resetSequenceAction(): Action {
    return new Sequence()
      .scrollToTop(this.elements.sequence)
      .removeChildren(this.elements.sequence);
  }

  createStepPanelsAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    const actions = this.combo.sequence.map((step) =>
      this.createStepPanelAction(this.elements.sequence, step),
    );

    return new Sequence().add(...actions);
  }

  createStepPanelAction(parent: Panel, step: Step): Action {
    return new RunFunctionAction(() => this.createStepPanel(parent, step));
  }

  sequenceActionsOnStepPanels(steps: Step[], fn: (this: this, stepId: StepId) => void): Action[] {
    return steps.map((step) => new RunFunctionAction(fn, step.id));
  }

  parallelSequenceOnStepPanels(steps: Step[], fn: (this: this, stepId: StepId) => void): Action {
    return new ParallelSequence().add(...this.sequenceActionsOnStepPanels(steps, fn));
  }

  staggeredSequenceOnStepPanels(
    delay: number,
    steps: Step[],
    fn: (this: this, stepId: StepId) => void,
  ): Action {
    return new StaggeredSequence(delay).add(...this.sequenceActionsOnStepPanels(steps, fn));
  }

  activateStepPanelsAction(steps: Step[]): Action {
    const seq = new Sequence();

    if (steps.length === 0) {
      return seq;
    }

    const activateSeq = this.parallelSequenceOnStepPanels(steps, this.activateStepPanel.bind(this));

    return seq
      .runFn(() => {
        const firstStep = steps[0];

        if (firstStep) {
          this.scrollToStepPanel(firstStep.id);
        }
      })
      .add(activateSeq);
  }

  deactivateStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.deactivateStepPanel.bind(this));
  }

  bumpStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.bumpStepPanel.bind(this));
  }

  failStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.failStepPanel.bind(this));
  }

  clearFailedStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.clearFailedStepPanel.bind(this));
  }

  // ----- HUD actions -----

  resetHudVisibilityActions(): Action[] {
    return Object.values(HUD_VISIBILITY_CLASSES).map(
      (cls) => new RemoveClassAction(this.panel, cls),
    );
  }

  updateHudVisibilityTooltipAction(mode: HudMode): Action {
    const key = l10n.pKey(l10n.Key.HudVisibilityPrefix, mode);

    return new SetDialogVariableLocStringAction(this.panel, DialogVar.HudVisibility, key);
  }

  switchHudSeq(prevMode: HudMode, nextMode: HudMode): Sequence {
    const prevClass = HUD_VISIBILITY_CLASSES[prevMode];
    const nextClass = HUD_VISIBILITY_CLASSES[nextMode];
    const heroHudFn =
      nextMode === HudMode.NoHands ? this.hideActionPanelUi : this.showActionPanelUi;

    return new Sequence()
      .add(this.updateHudVisibilityTooltipAction(nextMode))
      .replaceClass(this.panel, prevClass, nextClass)
      .runFn(heroHudFn.bind(this));
  }

  // ----- Splash actions -----

  clearSplashAction(): Action {
    return new ParallelSequence()
      .removeClass(this.elements.splash, CssClass.SplashStart)
      .removeClass(this.elements.splash, CssClass.SplashSuccess)
      .removeClass(this.elements.splash, CssClass.SplashFailure);
  }

  showSplashAction(state: ComboState): Action {
    const titleIndex = random(1, SPLASH_MAX_INDICES[state].title);
    const titleText = l10n.lp(l10n.Key.SplashPrefix, state, "title", titleIndex.toString());

    const helpIndex = random(1, SPLASH_MAX_INDICES[state].help);
    const helpText = l10n.lp(l10n.Key.SplashPrefix, state, "help", helpIndex.toString());

    const actions = new ParallelSequence()
      .add(this.clearSplashAction())
      .setAttribute(this.elements.splashTitle, "text", titleText)
      .setAttribute(this.elements.splashHelp, "text", helpText)
      .addClass(this.elements.splash, SPLASH_CLASSES[state]);

    return new Sequence().add(actions).addClass(this.elements.splash, CssClass.SplashShow);
  }

  hideSplashAction(): Action {
    return new ParallelSequence()
      .add(this.clearSplashAction())
      .removeClass(this.elements.splash, CssClass.SplashShow);
  }

  // ----- Score actions -----

  updateScoreCounterAction(count: number): Action {
    return new RunFunctionAction(() => this.comboScore.sendInputs({ updateCounter: { count } }));
  }

  updateScoreSummaryAction(options: ComboScoreInputs["updateSummary"]): Action {
    return new RunFunctionAction(() => this.comboScore.sendInputs({ updateSummary: options }));
  }

  hideScoreAction(): Action {
    return new Sequence()
      .removeClass(this.elements.score, CssClass.ScoreFailure)
      .runFn(() => this.comboScore.sendInputs({ hide: undefined }));
  }

  showTimerAction(): Action {
    return new RemoveClassAction(this.elements.timer, CssClass.Hide);
  }

  hideTimerAction(): Action {
    return new AddClassAction(this.elements.timer, CssClass.Hide);
  }

  countdownWaitAction(wait: number): Action {
    const animate = new ParallelSequence()
      .animateDialogVariableInteger(
        this.elements.waitProgress,
        DialogVar.WaitProgressValue,
        wait,
        0,
        wait,
      )
      .animateProgressBar(this.elements.waitProgressBar, wait, 0, wait);

    return new Sequence()
      .setAttribute(this.elements.waitProgressBar, "max", wait)
      .removeClass(this.elements.waitProgress, CssClass.Hide)
      .add(animate)
      .addClass(this.elements.waitProgress, CssClass.Hide);
  }

  // ----- Composite actions -----

  progressWhenInProgressAction(metrics: Metrics, next: number[]): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    const nextSteps = at(this.combo.sequence, next);

    if (!nextSteps.every((s): s is Step => s != null)) {
      throw new Error(
        `Failed to pick next steps from combo ${this.combo.id}: steps count = ${
          this.combo.sequence.length
        }, indices = [${next.join(", ")}]`,
      );
    }

    return new Sequence()
      .add(this.clearFailedStepPanelsAction(this.combo.sequence))
      .add(this.deactivateStepPanelsAction(this.combo.sequence))
      .add(this.activateStepPanelsAction(nextSteps))
      .add(this.updateScoreCounterAction(metrics.count || 0));
  }

  progressWhenFinishedAction(metrics: Metrics): Action {
    const scoreSummaryOptions = {
      count: metrics.count || 0,
      endDamage: metrics.damage || 0,
    };

    return this.updateScoreSummaryAction(scoreSummaryOptions);
  }

  // ----- Action runners -----

  initHudVisibility(mode: HudMode): void {
    new Sequence()
      .add(this.updateHudVisibilityTooltipAction(mode))
      .add(...this.resetHudVisibilityActions())
      .addClass(this.panel, HUD_VISIBILITY_CLASSES[mode])
      .run();
  }

  runStart(id: ComboId, next: number[]): void {
    this.combo = COMBOS.get(id);

    if (this.combo == null) {
      this.warn("Tried to start() an invalid combo", { id });
      return;
    }

    this.finished = false;

    const seq = new Sequence()
      .add(this.hideScoreAction())
      .add(this.hideSplashAction())
      .add(this.hideTimerAction())
      .wait(Timing.StartDelay)
      .add(this.showAction())
      .add(this.renderSequenceAction())
      .add(this.showSplashAction(ComboState.Start))
      .wait(0.25)
      .runFn(() => this.runProgress(id, {}, next));

    this.debugFn(() => ["start", { id, len: seq.deepLength }]);

    seq.run();
  }

  runStop(id: ComboId): void {
    if (this.combo == null) {
      this.warn("Tried to stop() without combo", { id });
      return;
    }

    this.stopTimer();

    this.combo = undefined;
    this.finished = false;

    const seq = new Sequence().add(this.hideAction()).add(this.hideTimerAction());

    this.debugFn(() => ["stop", { id, len: seq.deepLength }]);

    seq.run();
  }

  runInProgress(id: ComboId): void {
    if (this.combo == null) {
      this.warn("Tried to inProgress() without combo", { id });
      return;
    }

    const seq = new Sequence().add(this.showTimerAction()).add(this.hideSplashAction());

    this.debugFn(() => ["inProgress", { id }]);
    this.startTimer();

    seq.run();
  }

  runProgress(id: ComboId, metrics: Metrics, next: number[]): void {
    if (this.combo == null) {
      this.warn("Tried to progress() without combo", { id });
      return;
    }

    const seq = new Sequence();

    if (this.finished) {
      seq.add(this.progressWhenFinishedAction(metrics));
    } else {
      seq.add(this.progressWhenInProgressAction(metrics, next));
    }

    this.debugFn(() => ["progress", { id, metrics, next, len: seq.deepLength }]);

    seq.run();
  }

  runPreFinish(id: ComboId, metrics: Metrics, wait: number): void {
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
      .add(this.deactivateStepPanelsAction(this.combo.sequence))
      .add(this.bumpStepPanelsAction(this.combo.sequence))
      .add(this.updateScoreSummaryAction(options))
      .add(this.countdownWaitAction(wait));

    this.debugFn(() => ["preFinish", { id, len: seq.deepLength, ...options }]);

    seq.run();
  }

  runFinish(id: ComboId, metrics: Metrics): void {
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
      .playSoundEffect(SOUND_EVENTS[state])
      .add(this.showSplashAction(state))
      .add(this.updateScoreSummaryAction(options));

    this.debugFn(() => ["finish", { id, state, len: seq.deepLength, ...options }]);

    seq.run();
  }

  runFail(id: ComboId, expected: number[], ability: string): void {
    if (this.combo == null) {
      this.warn("Tried to fail() without combo", { id });
      return;
    }

    this.stopTimer();

    const state = ComboState.Failure;
    const expectedSteps = at(this.combo.sequence, expected);

    if (!expectedSteps.every((s): s is Step => s != null)) {
      throw new Error(
        `Failed to pick steps from combo ${id}: steps count = ${
          this.combo.sequence.length
        }, indices = [${expected.join(", ")}]`,
      );
    }

    const seq = new Sequence()
      .playSoundEffect(SOUND_EVENTS[state])
      .add(this.showSplashAction(state))
      .addClass(this.elements.score, SCORE_CLASSES[state])
      .add(this.failStepPanelsAction(expectedSteps))
      .add(this.bumpStepPanelsAction(expectedSteps))
      .add(this.hideTimerAction());

    this.debugFn(() => ["fail", { id, state, ability, expected, len: seq.deepLength }]);

    seq.run();
  }

  cycleHud(): void {
    const prev = this.hudMode;

    this.hudMode = HUD_MODES_CYCLE[this.hudMode];

    const next = this.hudMode;
    const seq = this.switchHudSeq(prev, next);

    this.debugFn(() => ["cycleHud", { prev, next, len: seq.deepLength }]);

    seq.run();
  }

  // ----- UI methods -----

  restart(isHardReset: boolean): void {
    this.debugFn(() => ["restart", { isHardReset }]);
    this.sendRestart(!!isHardReset);
  }

  stop(): void {
    this.debug("stop");
    this.sendStop();
  }

  showDetails() {
    if (this.combo == null) {
      this.warn("Tried to showDetails() without combo");
      return;
    }

    this.debug("showDetails");
    this.sendRenderViewer(this.combo);
  }
}

(() => {
  new Challenge();
})();
