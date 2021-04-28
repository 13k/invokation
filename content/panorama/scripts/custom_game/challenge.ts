import { at, get, random } from "lodash";
import type { ChallengeComboStep, Inputs as StepInputs } from "./challenge_combo_step";
import type { ComboScore, Inputs as ComboScoreInputs } from "./combo_score";
import { COMBOS } from "./custom_ui_manifest";
import type { Combo, ComboID, ProgressMetrics, ScoreSummaryMetrics, Step } from "./lib/combo";
import { FREESTYLE_COMBO_ID } from "./lib/combo";
import { Component } from "./lib/component";
import { ComponentLayout, COMPONENTS } from "./lib/const/component";
import {
  ComboFinishedEvent,
  ComboInProgressEvent,
  ComboPreFinishEvent,
  ComboProgressEvent,
  ComboStartedEvent,
  ComboStepErrorEvent,
  ComboStoppedEvent,
  CustomEvent,
} from "./lib/const/events";
import type { PanelWithComponent } from "./lib/const/panorama";
import { CSSClass } from "./lib/const/panorama";
import { CustomEvents } from "./lib/custom_events";
import { localizeParameterized } from "./lib/l10n";
import { fromSequence } from "./lib/lua";
import {
  Action,
  AddClassAction,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
  SerialSequence,
  SetDialogVariableAction,
  StaggeredSequence,
} from "./lib/sequence";
import { UI } from "./lib/ui";

export type Inputs = never;
export type Outputs = never;

interface Elements {
  sequence: Panel;
  splash: Panel;
  splashTitle: LabelPanel;
  splashHelp: LabelPanel;
  score: Panel;
  timer: Panel;
  timerLabel: LabelPanel;
  waitProgress: LabelPanel;
  waitProgressBar: ProgressBar;
}

type ComboScorePanel = PanelWithComponent<ComboScore>;
type StepPanel = PanelWithComponent<ChallengeComboStep>;

interface ChallengeTimer {
  start: number | null;
  update: boolean;
  schedule: number | null;
}

const { inputs: STEP_INPUTS } = COMPONENTS.CHALLENGE_COMBO_STEP;
const { inputs: SCORE_INPUTS } = COMPONENTS.COMBO_SCORE;

const DYN_ELEMS = {
  COMBO_SCORE: {
    id: "score-component",
    cssClass: "level2",
  },
};

enum State {
  Start = "start",
  Success = "success",
  Failure = "failure",
}

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
  [State.Success]: "kidvoker_takeover_stinger",
  [State.Failure]: "ui.death_stinger",
};

const SPLASH_MAX_INDICES = {
  [State.Start]: { title: 1, help: 1 },
  [State.Success]: { title: 2, help: 7 },
  [State.Failure]: { title: 3, help: 9 },
};

const SPLASH_CLASSES = {
  [State.Start]: "start",
  [State.Success]: "success",
  [State.Failure]: "failure",
};

enum HudMode {
  Visible = "visible",
  HideSeq = "hide_seq",
  NoHands = "no_hands",
}

const HUD_MODES_CLASSES = {
  [HudMode.Visible]: "hud-visible",
  [HudMode.HideSeq]: "hud-hide-sequence",
  [HudMode.NoHands]: "hud-no-hands",
};

const SCORE_CLASSES = {
  [State.Failure]: "failed",
};

const comboStepID = ({ index, name }: Step) => `combo_step_${index}_${name}`;

export class Challenge extends Component {
  #elements: Elements;
  #hudMode: HudMode = HudMode.Visible;
  #timer: ChallengeTimer;
  #comboScore: ComboScorePanel;
  #stepsPanels: Record<Step["index"], StepPanel> = {};
  #finished = false;
  combo?: Combo;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      sequence: "sequence",
      splash: "splash",
      splashTitle: "splash-title",
      splashHelp: "splash-help",
      score: "score",
      timer: "timer",
      timerLabel: "timer-label",
      waitProgress: "wait-progress",
      waitProgressBar: "wait-progressbar",
    });

    this.#timer = {
      start: null,
      update: false,
      schedule: null,
    };

    this.#comboScore = this.createComboScorePanel(this.#elements.score);

    this.onCustomEvent(CustomEvent.COMBO_STARTED, this.onComboStarted);
    this.onCustomEvent(CustomEvent.COMBO_STOPPED, this.onComboStopped);
    this.onCustomEvent(CustomEvent.COMBO_IN_PROGRESS, this.onComboInProgress);
    this.onCustomEvent(CustomEvent.COMBO_PROGRESS, this.onComboProgress);
    this.onCustomEvent(CustomEvent.COMBO_STEP_ERROR, this.onComboStepError);
    this.onCustomEvent(CustomEvent.COMBO_PRE_FINISH, this.onComboPreFinish);
    this.onCustomEvent(CustomEvent.COMBO_FINISHED, this.onComboFinished);

    this.initHudVisibility(this.#hudMode);
    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload: NetworkedData<ComboStartedEvent>): void {
    const { id, next } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStarted()", payload);
    this.start(id, fromSequence(next));
  }

  onComboStopped(payload: NetworkedData<ComboStoppedEvent>): void {
    const { id } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStopped()", payload);
    this.stop(id);
  }

  onComboInProgress(payload: NetworkedData<ComboInProgressEvent>): void {
    const { id } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboInProgress()", payload);
    this.inProgress(id);
  }

  onComboProgress(payload: NetworkedData<ComboProgressEvent>): void {
    const { id, metrics, next } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboProgress()", payload);
    this.progress(id, metrics, fromSequence(next));
  }

  onComboStepError(payload: NetworkedData<ComboStepErrorEvent>): void {
    const { id, ability, expected } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStepError()", payload);
    this.fail(id, fromSequence(expected), ability);
  }

  onComboPreFinish(payload: NetworkedData<ComboPreFinishEvent>): void {
    const { id, metrics, wait } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboPreFinish()", payload);
    this.preFinish(id, metrics, wait);
  }

  onComboFinished(payload: NetworkedData<ComboFinishedEvent>): void {
    const { id, metrics } = payload;

    if (id === FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboFinished()", payload);
    this.finish(id, metrics);
  }

  // ----- Helpers -----

  hasCombo(): this is { combo: Combo } {
    return this.combo != null;
  }

  sendStop(): void {
    CustomEvents.sendServer(CustomEvent.COMBO_STOP);
  }

  sendRestart(hardReset: boolean): void {
    CustomEvents.sendServer(CustomEvent.COMBO_RESTART, { hardReset });
  }

  sendRenderViewer({ id }: Combo): void {
    CustomEvents.sendClientSide(CustomEvent.VIEWER_RENDER, { id });
  }

  createComboScorePanel(parent: Panel): ComboScorePanel {
    const { id, cssClass } = DYN_ELEMS.COMBO_SCORE;

    return this.createComponent(parent, id, ComponentLayout.ComboScore, {
      classes: [cssClass],
    });
  }

  createStepPanel(parent: Panel, step: Step): Panel {
    if (!this.hasCombo()) {
      throw Error("Challenge.createStepPanel called without a combo set");
    }

    const id = comboStepID(step);
    const setStepPayload: StepInputs[typeof STEP_INPUTS.SET_STEP] = { combo: this.combo, step };
    const panel = this.createComponent(parent, id, ComponentLayout.ChallengeComboStep, {
      inputs: {
        [STEP_INPUTS.SET_STEP]: setStepPayload,
      },
    });

    this.#stepsPanels[step.index] = panel;

    return panel;
  }

  scrollToStepPanel(step: Step): void {
    const panel = this.#stepsPanels[step.index];

    panel.ScrollParentToMakePanelFit();
  }

  stepPanelInput(step: Step, input: keyof typeof STEP_INPUTS): void {
    const panel = this.#stepsPanels[step.index];

    panel.component.input(STEP_INPUTS[input]);
  }

  bumpStepPanel(step: Step): void {
    this.stepPanelInput(step, "BUMP");
  }

  activateStepPanel(step: Step): void {
    this.stepPanelInput(step, "SET_ACTIVE");
  }

  deactivateStepPanel(step: Step): void {
    this.stepPanelInput(step, "UNSET_ACTIVE");
  }

  failStepPanel(step: Step): void {
    this.stepPanelInput(step, "SET_ERROR");
  }

  clearFailedStepPanel(step: Step): void {
    this.stepPanelInput(step, "UNSET_ERROR");
  }

  startTimer(): void {
    this.#timer.start = Date.now();
    this.#timer.update = true;
    this.debug("startTimer()", this.#timer);
    this.updateTimer();
  }

  updateTimer(): void {
    if (!this.#timer.update) {
      return;
    }

    if (this.#timer.start == null) {
      this.warn("Challenge.updateTimer called when timer.start is null");
      return;
    }

    this.#elements.timerLabel.text = ((Date.now() - this.#timer.start) / 1000).toFixed(1);

    $.Schedule(0.1, this.updateTimer.bind(this));
  }

  stopTimer(): void {
    this.#timer.start = null;
    this.#timer.update = false;
  }

  // ----- Component actions -----

  showAction(): Action {
    return new RemoveClassAction(this.ctx, CSSClass.Hide);
  }

  hideAction(): Action {
    return new ParallelSequence()
      .Action(this.hideSplashAction())
      .Action(this.hideScoreAction())
      .AddClass(this.ctx, CSSClass.Hide);
  }

  // ----- Sequence actions -----

  renderSequenceAction(): Action {
    return new SerialSequence()
      .Action(this.resetSequenceAction())
      .Action(this.createStepPanelsAction())
      .RunFunction(() => {
        if (!this.hasCombo()) {
          throw Error("Challenge.renderSequenceAction called without a combo set");
        }

        this.staggeredSequenceOnStepPanels(BUMP_DELAY, this.combo.sequence, this.bumpStepPanel);
      });
  }

  resetSequenceAction(): Action {
    return new SerialSequence()
      .ScrollToTop(this.#elements.sequence)
      .RemoveChildren(this.#elements.sequence)
      .RunFunction(() => {
        this.#stepsPanels = {};
      });
  }

  createStepPanelsAction(): Action {
    if (!this.hasCombo()) {
      throw Error("Challenge.createStepPanelsAction called without a combo set");
    }

    const createActions = this.combo.sequence.map(
      this.createStepPanelAction.bind(this, this.#elements.sequence)
    );

    return new SerialSequence().Action(...createActions);
  }

  createStepPanelAction(parent: Panel, step: Step): Action {
    return new RunFunctionAction(() => {
      this.createStepPanel(parent, step);
    });
  }

  sequenceActionsOnStepPanels(steps: Step[], fn: (step: Step) => void): Action[] {
    return steps.map((step) => new RunFunctionAction(fn.bind(this), step));
  }

  parallelSequenceOnStepPanels(steps: Step[], fn: (step: Step) => void): Action {
    return new ParallelSequence().Action(...this.sequenceActionsOnStepPanels(steps, fn));
  }

  staggeredSequenceOnStepPanels(delay: number, steps: Step[], fn: (step: Step) => void): Action {
    return new StaggeredSequence({ delay }).Action(...this.sequenceActionsOnStepPanels(steps, fn));
  }

  activateStepPanelsAction(steps: Step[]): Action {
    const seq = new SerialSequence();

    if (steps.length === 0) {
      return seq;
    }

    const activateSeq = this.parallelSequenceOnStepPanels(steps, this.activateStepPanel);

    return seq.RunFunction(() => this.scrollToStepPanel(steps[0])).Action(activateSeq);
  }

  deactivateStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.deactivateStepPanel);
  }

  bumpStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.bumpStepPanel);
  }

  failStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.failStepPanel);
  }

  clearFailedStepPanelsAction(steps: Step[]): Action {
    return this.parallelSequenceOnStepPanels(steps, this.clearFailedStepPanel);
  }

  // ----- HUD actions -----

  resetHudVisibilityActions(): Action[] {
    return Object.entries(HUD_MODES_CLASSES).map(([, cls]) => new RemoveClassAction(this.ctx, cls));
  }

  updateHudVisibilityTooltipAction(mode: HudMode): Action {
    const hudVisibilityTooltip = localizeParameterized(L10N_PREFIXES.HUD_VISIBILITY, mode);

    return new SetDialogVariableAction(this.ctx, DIALOG_VARS.HUD_VISIBILITY, hudVisibilityTooltip);
  }

  switchHudAction(prevMode: HudMode, nextMode: HudMode): Sequence {
    const prevClass = HUD_MODES_CLASSES[prevMode];
    const nextClass = HUD_MODES_CLASSES[nextMode];
    const heroHudFn = nextMode === HudMode.NoHands ? UI.hideActionPanelUI : UI.showActionPanelUI;

    return new SerialSequence()
      .Action(this.updateHudVisibilityTooltipAction(nextMode))
      .SwitchClass(this.ctx, prevClass, nextClass)
      .RunFunction(heroHudFn);
  }

  // ----- Splash actions -----

  clearSplashAction(): Action {
    return new ParallelSequence()
      .RemoveClass(this.#elements.splash, SPLASH_CLASSES[State.Start])
      .RemoveClass(this.#elements.splash, SPLASH_CLASSES[State.Success])
      .RemoveClass(this.#elements.splash, SPLASH_CLASSES[State.Failure]);
  }

  showSplashAction(state: State): Action {
    const titleIndex = random(1, get(SPLASH_MAX_INDICES, [state, "title"], 1));
    const helpIndex = random(1, get(SPLASH_MAX_INDICES, [state, "help"], 1));

    const title = localizeParameterized(L10N_PREFIXES.SPLASH, state, "title", String(titleIndex));

    const help = localizeParameterized(L10N_PREFIXES.SPLASH, state, "help", String(helpIndex));

    const actions = new ParallelSequence()
      .Action(this.clearSplashAction())
      .SetText(this.#elements.splashTitle, title)
      .SetText(this.#elements.splashHelp, help)
      .AddClass(this.#elements.splash, state);

    return new SerialSequence().Action(actions).AddClass(this.#elements.splash, CSSClass.Show);
  }

  hideSplashAction(): Action {
    return new ParallelSequence()
      .Action(this.clearSplashAction())
      .RemoveClass(this.#elements.splash, CSSClass.Show);
  }

  // ----- Score actions -----

  updateScoreCounterAction(metrics: ComboScoreInputs[typeof SCORE_INPUTS.UPDATE_COUNTER]): Action {
    return new RunFunctionAction(() => {
      this.#comboScore.component.input(SCORE_INPUTS.UPDATE_COUNTER, metrics);
    });
  }

  updateScoreSummaryAction(metrics: ComboScoreInputs[typeof SCORE_INPUTS.UPDATE_SUMMARY]): Action {
    return new RunFunctionAction(() => {
      this.#comboScore.component.input(SCORE_INPUTS.UPDATE_SUMMARY, metrics);
    });
  }

  hideScoreAction(): Action {
    return new SerialSequence()
      .RemoveClass(this.#elements.score, SCORE_CLASSES[State.Failure])
      .RunFunction(() => {
        this.#comboScore.component.input(SCORE_INPUTS.HIDE);
      });
  }

  showTimerAction(): Action {
    return new RemoveClassAction(this.#elements.timer, CSSClass.Hide);
  }

  hideTimerAction(): Action {
    return new AddClassAction(this.#elements.timer, CSSClass.Hide);
  }

  countdownWaitAction(wait: number): Action {
    const { WAIT_SECONDS } = DIALOG_VARS.WAIT_PROGRESS;

    const animate = new ParallelSequence()
      .AnimateDialogVariableInt(this.#elements.waitProgress, WAIT_SECONDS, wait, 0, wait)
      .AnimateProgressBar(this.#elements.waitProgressBar, wait, 0, wait);

    return new SerialSequence()
      .SetProgressBar(this.#elements.waitProgressBar, { max: wait })
      .RemoveClass(this.#elements.waitProgress, CSSClass.Hide)
      .Action(animate)
      .AddClass(this.#elements.waitProgress, CSSClass.Hide);
  }

  // ----- Composite actions -----

  progressWhenInProgressAction(metrics: ProgressMetrics, next: ComboID[]): Action {
    if (!this.hasCombo()) {
      throw Error("Challenge.progressWhenInProgressAction called without a combo set");
    }

    const nextSteps = at(this.combo.sequence, next);

    return new SerialSequence()
      .Action(this.clearFailedStepPanelsAction(this.combo.sequence))
      .Action(this.deactivateStepPanelsAction(this.combo.sequence))
      .Action(this.activateStepPanelsAction(nextSteps))
      .Action(this.updateScoreCounterAction(metrics));
  }

  progressWhenFinishedAction(metrics: ProgressMetrics): Action {
    const scoreSummaryOptions: ScoreSummaryMetrics = {
      count: metrics.count ?? 0,
      endDamage: metrics.damage ?? 0,
    };

    return this.updateScoreSummaryAction(scoreSummaryOptions);
  }

  // ----- Action runners -----

  initHudVisibility(mode: HudMode): void {
    new SerialSequence()
      .Action(this.updateHudVisibilityTooltipAction(mode))
      .Action(...this.resetHudVisibilityActions())
      .AddClass(this.ctx, HUD_MODES_CLASSES[mode])
      .run();
  }

  start(id: ComboID, next: ComboID[]): void {
    this.combo = COMBOS.get(id);

    if (!this.hasCombo()) {
      this.warn("start(): could not find combo", { id });
      return;
    }

    this.#finished = false;

    const seq = new SerialSequence()
      .Action(this.hideScoreAction())
      .Action(this.hideSplashAction())
      .Action(this.hideTimerAction())
      .Wait(START_DELAY)
      .Action(this.showAction())
      .Action(this.renderSequenceAction())
      .Action(this.showSplashAction(State.Start))
      .Wait(0.25)
      .RunFunction(() => this.progress(id, {}, next));

    this.debugFn(() => ["start()", { id, actions: seq.length }]);

    seq.run();
  }

  stop(id: ComboID): void {
    this.stopTimer();
    this.combo = undefined;
    this.#finished = false;

    const seq = new SerialSequence().Action(this.hideAction()).Action(this.hideTimerAction());

    this.debugFn(() => ["stop()", { id, actions: seq.length }]);

    seq.run();
  }

  inProgress(id: ComboID): void {
    const seq = new SerialSequence().Action(this.showTimerAction()).Action(this.hideSplashAction());

    this.startTimer();
    this.debugFn(() => ["inProgress()", { id }]);

    seq.run();
  }

  progress(id: ComboID, metrics: ProgressMetrics, next: ComboID[]): void {
    const seq = new SerialSequence();

    if (this.#finished) {
      seq.Action(this.progressWhenFinishedAction(metrics));
    } else {
      seq.Action(this.progressWhenInProgressAction(metrics, next));
    }

    this.debugFn(() => ["progress()", { id, metrics, next, actions: seq.length }]);

    seq.run();
  }

  preFinish(id: ComboID, metrics: ProgressMetrics, wait: number): void {
    if (!this.hasCombo()) {
      throw Error("Challenge.preFinish called without a combo set");
    }

    const summaryMetrics: ScoreSummaryMetrics = {
      count: metrics.count ?? 0,
      startDamage: 0,
      endDamage: metrics.damage ?? 0,
    };

    this.#finished = true;

    const seq = new SerialSequence()
      .Action(this.deactivateStepPanelsAction(this.combo.sequence))
      .Action(this.bumpStepPanelsAction(this.combo.sequence))
      .Action(this.updateScoreSummaryAction(summaryMetrics))
      .Action(this.countdownWaitAction(wait));

    this.debugFn(() => ["preFinish()", { id, actions: seq.length, ...summaryMetrics }]);

    seq.run();
  }

  finish(id: ComboID, metrics: ProgressMetrics): void {
    this.stopTimer();

    const summaryMetrics: ScoreSummaryMetrics = {
      count: metrics.count ?? 0,
      endDamage: metrics.damage ?? 0,
    };

    const seq = new SerialSequence()
      .PlaySoundEffect(SOUNDS[State.Success])
      .Action(this.showSplashAction(State.Success))
      .Action(this.updateScoreSummaryAction(summaryMetrics));

    this.debugFn(() => ["finish()", { id, actions: seq.length, ...summaryMetrics }]);

    seq.run();
  }

  fail(id: ComboID, expected: ComboID[], ability: string): void {
    if (!this.hasCombo()) {
      throw Error("Challenge.fail called without a combo set");
    }

    this.stopTimer();

    const expectedSteps = at(this.combo.sequence, expected);

    const seq = new SerialSequence()
      .PlaySoundEffect(SOUNDS.failure)
      .Action(this.showSplashAction(State.Failure))
      .AddClass(this.#elements.score, SCORE_CLASSES[State.Failure])
      .Action(this.failStepPanelsAction(expectedSteps))
      .Action(this.bumpStepPanelsAction(expectedSteps))
      .Action(this.hideTimerAction());

    this.debugFn(() => ["fail()", { id, ability, expected, actions: seq.length }]);

    seq.run();
  }

  toggleHUD(): void {
    const prevMode = this.#hudMode;
    let nextMode = HudMode.Visible;

    switch (prevMode) {
      case HudMode.Visible:
        nextMode = HudMode.HideSeq;
        break;
      case HudMode.HideSeq:
        nextMode = HudMode.NoHands;
        break;
      case HudMode.NoHands:
        nextMode = HudMode.Visible;
        break;
    }

    this.#hudMode = nextMode;

    const seq = this.switchHudAction(prevMode, nextMode);

    this.debugFn(() => ["toggleHUD()", { prevMode, nextMode, actions: seq.length }]);

    seq.run();
  }

  // ----- UI methods -----

  Restart(hardReset: boolean): void {
    this.debugFn(() => ["Restart()", { hardReset }]);
    this.sendRestart(!!hardReset);
  }

  Stop(): void {
    this.debug("Stop()");
    this.sendStop();
  }

  ShowDetails(): void {
    if (!this.hasCombo()) {
      throw Error("Challenge.ShowDetails called without a combo set");
    }

    this.debug("ShowDetails()");
    this.sendRenderViewer(this.combo);
  }

  ToggleHUD(): void {
    this.toggleHUD();
  }
}

//   context.challenge = new Challenge();
// })(GameUI.CustomUIConfig(), this);
