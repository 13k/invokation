// ----------------------------------------------------------------------------
// Valve's sequence_actions.js
// ----------------------------------------------------------------------------

// Sequence actions are objects that you can use to queue up work to happen in a
// sequence over time.

// Base action, which is something that will tick per-frame for a while until it's done.
export abstract class Action {
  protected actions: Action[] = [];

  protected nth(index: number): Action {
    const action = this.actions[index];

    if (action == null) {
      throw new Error(
        `${this.constructor.name}: invalid action index=${index} actions=${this.actions.length}`,
      );
    }

    return action;
  }

  add(...actions: Action[]): this {
    this.actions.push(...actions);

    return this;
  }

  // The start function is called before the action starts executing.
  start(): void {
    return;
  }

  // The update function is called once per frame until it returns false signalling that the action is done.
  update(): boolean {
    return false;
  }

  // After the update function is complete, the finish function is called
  finish(): void {
    return;
  }

  get isEmpty(): boolean {
    return this.actions.length === 0;
  }

  deepSize(): number {
    return this.actions.reduce((size, action) => size + action.deepSize(), 1);
  }
}

class RunSequentialActions extends Action {
  #index = 0;
  #running = false;
  #stop = false;

  override start(): void {
    this.#index = 0;
    this.#running = false;
    this.#stop = false;
  }

  override update(): boolean {
    while (this.#index < this.actions.length) {
      const action = this.nth(this.#index);

      if (!this.#running) {
        action.start();

        this.#running = true;
      }

      try {
        if (action.update()) {
          return true;
        }
      } catch (err: unknown) {
        return this.#handleError(err);
      }

      action.finish();

      this.#running = false;
      this.#index++;
    }

    return false;
  }

  override finish(): void {
    if (this.#stop) {
      return;
    }

    while (this.#index < this.actions.length) {
      const action = this.nth(this.#index);

      if (!this.#running) {
        action.start();

        this.#running = true;

        action.update();
      }

      action.finish();

      this.#running = false;
      this.#index++;
    }
  }

  #handleError(err: unknown): boolean {
    if (err instanceof StopSequence) {
      const skipCount = this.actions.length - this.#index + 1;

      $.Msg("StopSequence", { current: this.#index, skipped: skipCount });

      this.#stop = true;

      return false;
    }

    throw err;
  }
}

// Action to run multiple actions all at once. The action is complete once all sub actions are done.
class RunParallelActions extends Action {
  #actionsFinished: boolean[] = [];

  override start(): void {
    this.#actionsFinished = new Array(this.actions.length);

    for (const [i, action] of this.actions.entries()) {
      this.#actionsFinished[i] = false;

      action.start();
    }
  }

  override update(): boolean {
    let anyTicking = false;

    for (const [i, action] of this.actions.entries()) {
      if (!this.#actionsFinished[i]) {
        if (action.update()) {
          anyTicking = true;
        } else {
          action.finish();

          this.#actionsFinished[i] = true;
        }
      }
    }

    return anyTicking;
  }

  override finish(): void {
    for (const [i, action] of this.actions.entries()) {
      if (!this.#actionsFinished[i]) {
        action.finish();

        this.#actionsFinished[i] = true;
      }
    }
  }
}

// Action to rum multiple actions in parallel, but with a slight stagger start between each of them
class RunStaggeredActions extends Action {
  #delay: number;
  #runParallel: RunParallelActions;

  constructor(delay: number) {
    super();

    this.#delay = delay;
    this.#runParallel = new RunParallelActions();
  }

  override start(): void {
    for (const [i, action] of this.actions.entries()) {
      const delay = i * this.#delay;

      if (delay > 0) {
        const seq = new RunSequentialActions();

        seq.add(new WaitAction(delay));
        seq.add(action);

        this.#runParallel.add(seq);
      } else {
        this.#runParallel.add(action);
      }
    }

    this.#runParallel.start();
  }

  override update(): boolean {
    return this.#runParallel.update();
  }

  override finish(): void {
    this.#runParallel.finish();
  }
}

// Runs a set of actions but stops as soon as any of them are finished.  continueOtherActions is a bool
// that determines whether to continue ticking the remaining actions, or whether to just finish them immediately.
class RunUntilSingleActionFinishedAction extends Action {
  #keepRunning = false;
  #finished: boolean[] = [];

  constructor(keepRunning: boolean) {
    super();

    this.#keepRunning = keepRunning;
  }

  override start(): void {
    this.#finished = new Array(this.actions.length);

    for (const [i, action] of this.actions.entries()) {
      this.#finished[i] = false;

      action.start();
    }
  }

  override update(): boolean {
    if (this.isEmpty) {
      return false;
    }

    let anyFinished = false;

    for (const [i, action] of this.actions.entries()) {
      if (!action.update()) {
        action.finish();

        anyFinished = true;
        this.#finished[i] = true;
      }
    }

    return !anyFinished;
  }

  override finish(): void {
    if (this.#keepRunning) {
      // If we want to make sure the rest tick out, then build a new RunParallelActions of all
      // the remaining actions, then have it tick out separately.
      const runParallel = new RunParallelActions();

      for (const [i, action] of this.actions.entries()) {
        if (!this.#finished[i]) {
          runParallel.add(action);
        }
      }

      if (!runParallel.isEmpty) {
        UpdateSingleActionUntilFinished(runParallel);
      }
    } else {
      // Just finish each action immediately
      for (const [i, action] of this.actions.entries()) {
        if (!this.#finished[i]) {
          action.finish();
        }
      }
    }
  }
}

export class PanelAction<T extends Panel> extends Action {
  protected panel: T;

  constructor(panel: T) {
    super();

    this.panel = panel;
  }
}

// Action to wait for some amount of seconds before resuming
export class WaitAction extends Action {
  #duration: number;
  #endTimestamp = 0;

  constructor(duration: number) {
    super();

    this.#duration = duration;
  }

  override start(): void {
    this.#endTimestamp = Date.now() + this.#duration * 1000.0;
  }

  override update(): boolean {
    return Date.now() < this.#endTimestamp;
  }
}

// Action to wait a single frame
export class WaitOneFrameAction extends Action {
  #updated = false;

  override start(): void {
    this.#updated = false;
  }

  override update(): boolean {
    if (this.#updated) {
      return false;
    }

    this.#updated = true;

    return true;
  }
}

// Action that waits for a specific event type to be fired on the given panel.
export class WaitEventAction<T extends Panel> extends PanelAction<T> {
  #eventName: string;
  #receivedEvent = false;

  constructor(panel: T, eventName: string) {
    super(panel);

    this.#eventName = eventName;
  }

  override start(): void {
    this.#receivedEvent = false;

    $.RegisterEventHandler(this.#eventName, this.panel, () => {
      this.#receivedEvent = true;
    });
  }

  override update(): boolean {
    return !this.#receivedEvent;
  }
}

// Run an action until it's complete, or until it hits a timeout. continueAfterTimeout is a bool
// determining whether to continue ticking the action after it has timed out
export class WaitActionAction extends Action {
  #action: Action;
  #timeoutDuration: number;
  #continueAfterTimeout: boolean;
  #runner: RunUntilSingleActionFinishedAction;

  constructor(action: Action, timeoutDuration: number, continueAfterTimeout: boolean) {
    super();

    this.#action = action;
    this.#timeoutDuration = timeoutDuration;
    this.#continueAfterTimeout = continueAfterTimeout;
    this.#runner = new RunUntilSingleActionFinishedAction(this.#continueAfterTimeout);
  }

  override start(): void {
    this.#runner.add(this.#action);
    this.#runner.add(new WaitAction(this.#timeoutDuration));
    this.#runner.start();
  }

  override update(): boolean {
    return this.#runner.update();
  }

  override finish(): void {
    this.#runner.finish();
  }
}

// Action to add a CSS class to a panel
export class AddClassAction<T extends Panel> extends PanelAction<T> {
  #cssClass: string;

  constructor(panel: T, cssClass: string) {
    super(panel);

    this.#cssClass = cssClass;
  }

  override update(): boolean {
    this.panel.AddClass(this.#cssClass);

    return false;
  }
}

// Action to remove a CSS class to a panel
export class RemoveClassAction<T extends Panel> extends PanelAction<T> {
  #cssClass: string;

  constructor(panel: T, cssClass: string) {
    super(panel);

    this.#cssClass = cssClass;
  }

  override update(): boolean {
    this.panel.RemoveClass(this.#cssClass);

    return false;
  }
}

// Switch a CSS class on a panel
export class SwitchClassAction<T extends Panel> extends PanelAction<T> {
  #original: string;
  #replacement: string;

  constructor(panel: T, original: string, replacement: string) {
    super(panel);

    this.#original = original;
    this.#replacement = replacement;
  }

  override update(): boolean {
    this.panel.SwitchClass(this.#original, this.#replacement);

    return false;
  }
}

// Action to wait for a class to appear on a panel
export class WaitClassAction<T extends Panel> extends PanelAction<T> {
  #cssClass: string;

  constructor(panel: T, cssClass: string) {
    super(panel);

    this.#cssClass = cssClass;
  }

  override update(): boolean {
    return !this.panel.BHasClass(this.#cssClass);
  }
}

// Action to set an integer dialog variable
export class SetDialogVariableIntAction<T extends Panel> extends PanelAction<T> {
  #dvar: string;
  #value: number;

  constructor(panel: T, dvar: string, value: number) {
    super(panel);

    this.#dvar = dvar;
    this.#value = value;
  }

  override update(): boolean {
    this.panel.SetDialogVariableInt(this.#dvar, this.#value);

    return false;
  }
}

// Action to animate an integer dialog variable over some duration of seconds
export class AnimateDialogVariableIntAction<T extends Panel> extends PanelAction<T> {
  #dvar: string;
  #startValue: number;
  #endValue: number;
  #duration: number;
  #startTimestamp = 0;
  #endTimestamp = 0;

  constructor(panel: T, dvar: string, startValue: number, endValue: number, duration: number) {
    super(panel);

    this.#dvar = dvar;
    this.#startValue = startValue;
    this.#endValue = endValue;
    this.#duration = duration;
  }

  override start(): void {
    this.#startTimestamp = Date.now();
    this.#endTimestamp = this.#startTimestamp + this.#duration * 1000;
  }

  override update(): boolean {
    const now = Date.now();

    if (now >= this.#endTimestamp) {
      return false;
    }

    const ratio = (now - this.#startTimestamp) / (this.#endTimestamp - this.#startTimestamp);

    this.panel.SetDialogVariableInt(
      this.#dvar,
      this.#startValue + (this.#endValue - this.#startValue) * ratio,
    );

    return true;
  }

  override finish(): void {
    this.panel.SetDialogVariableInt(this.#dvar, this.#endValue);
  }
}

// Action to set a progress bar's value
export class SetProgressBarValueAction extends PanelAction<ProgressBar> {
  #value: number;

  constructor(panel: ProgressBar, value: number) {
    super(panel);

    this.#value = value;
  }

  override update(): boolean {
    this.panel.value = this.#value;

    return false;
  }
}

// Action to animate a progress bar
export class AnimateProgressBarAction extends PanelAction<ProgressBar> {
  #startValue: number;
  #endValue: number;
  #duration: number;
  #startTimestamp = 0;
  #endTimestamp = 0;

  constructor(panel: ProgressBar, startValue: number, endValue: number, duration: number) {
    super(panel);

    this.#startValue = startValue;
    this.#endValue = endValue;
    this.#duration = duration;
  }

  override start(): void {
    this.#startTimestamp = Date.now();
    this.#endTimestamp = this.#startTimestamp + this.#duration * 1000;
  }

  override update(): boolean {
    const now = Date.now();

    if (now >= this.#endTimestamp) {
      return false;
    }

    const ratio = (now - this.#startTimestamp) / (this.#endTimestamp - this.#startTimestamp);

    this.panel.value = this.#startValue + (this.#endValue - this.#startValue) * ratio;

    return true;
  }

  override finish(): void {
    this.panel.value = this.#endValue;
  }
}

// Action to animate a progress bar	with middle
export class AnimateProgressBarWithMiddleAction extends PanelAction<ProgressBarWithMiddle> {
  #startValue: number;
  #endValue: number;
  #duration: number;
  #startTimestamp = 0;
  #endTimestamp = 0;

  constructor(
    panel: ProgressBarWithMiddle,
    startValue: number,
    endValue: number,
    duration: number,
  ) {
    super(panel);

    this.#startValue = startValue;
    this.#endValue = endValue;
    this.#duration = duration;
  }

  override start(): void {
    this.#startTimestamp = Date.now();
    this.#endTimestamp = this.#startTimestamp + this.#duration * 1000;
  }

  override update(): boolean {
    const now = Date.now();

    if (now >= this.#endTimestamp) {
      return false;
    }

    const ratio = (now - this.#startTimestamp) / (this.#endTimestamp - this.#startTimestamp);

    this.panel.uppervalue = this.#startValue + (this.#endValue - this.#startValue) * ratio;

    return true;
  }

  override finish(): void {
    this.panel.uppervalue = this.#endValue;
  }
}

// Action to play a sound effect
export class PlaySoundEffectAction extends Action {
  #soundName: string;

  constructor(soundName: string) {
    super();

    this.#soundName = soundName;
  }

  override update(): boolean {
    $.DispatchEvent("PlaySoundEffect", this.#soundName);

    return false;
  }
}

// ----------------------------------------------------------------------------

// Helper function to asynchronously tick a single action until it's finished, then call finish on it.
function UpdateSingleActionUntilFinished(action: Action): void {
  const run = () => {
    try {
      if (action.update()) {
        $.Schedule(0.0, run);
      } else {
        action.finish();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        warnStack(err);
      }

      throw err;
    }
  };

  run();
}

// Call RunSingleAction to start a single action and continue ticking it until it's done
function RunSingleAction(action: Action): void {
  action.start();

  UpdateSingleActionUntilFinished(action);
}

function warnStack(err: Error) {
  if (err.stack != null) {
    $.Warning(err.stack);
  }

  if (err.cause instanceof Error) {
    warnStack(err.cause);
  }
}

// ----------------------------------------------------------------------------
// END sequence_actions.js
// ----------------------------------------------------------------------------

export class NoopAction extends Action {
  override update(): boolean {
    return false;
  }
}

// Action to print a debug message
export class PrintAction extends Action {
  args: unknown[];

  constructor(...args: unknown[]) {
    super();

    this.args = args;
  }

  override update(): boolean {
    $.Msg(...this.args);

    return false;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: can't know types ahead of time
type RunFunction = (...args: any[]) => void;

// Action that simply runs a passed in function. You may include extra arguments and they will be passed to the called function.
export class RunFunctionAction<F extends RunFunction> extends Action {
  #fn: F;
  #args: Parameters<F>;

  constructor(fn: F, ...args: Parameters<F>) {
    super();

    this.#fn = fn;
    this.#args = args;
  }

  override update(): boolean {
    this.#fn(...this.#args);

    return false;
  }
}

export class ReplaceClassAction<T extends Panel> extends PanelAction<T> {
  #original: string;
  #replacement: string;

  constructor(panel: T, original: string, replacement: string) {
    super(panel);

    this.#original = original;
    this.#replacement = replacement;
  }

  override update(): boolean {
    this.panel.RemoveClass(this.#original);
    this.panel.AddClass(this.#replacement);

    return false;
  }
}

export class SetAttributeAction<T extends Panel, K extends keyof T> extends PanelAction<T> {
  #attribute: K;
  #value: T[K];

  constructor(panel: T, attribute: K, value: T[K]) {
    super(panel);

    this.#attribute = attribute;
    this.#value = value;
  }

  override update(): boolean {
    this.panel[this.#attribute] = this.#value;

    return false;
  }
}

export class EnableAction<T extends Panel> extends SetAttributeAction<T, "enabled"> {
  constructor(panel: T) {
    super(panel, "enabled", true);
  }
}

export class DisableAction<T extends Panel> extends SetAttributeAction<T, "enabled"> {
  constructor(panel: T) {
    super(panel, "enabled", false);
  }
}

export class SetDialogVariableAction<T extends Panel> extends PanelAction<T> {
  #dvar: string;
  #value: string;

  constructor(panel: T, dvar: string, value: string) {
    super(panel);

    this.#dvar = dvar;
    this.#value = value;
  }

  override update(): boolean {
    this.panel.SetDialogVariable(this.#dvar, this.#value);

    return false;
  }
}

export class SetDialogVariableTimeAction<T extends Panel> extends PanelAction<T> {
  #dvar: string;
  #value: number;

  constructor(panel: T, dvar: string, value: number) {
    super(panel);

    this.#dvar = dvar;
    this.#value = value;
  }

  override update(): boolean {
    this.panel.SetDialogVariableTime(this.#dvar, this.#value);

    return false;
  }
}

export class ScrollToTopAction<T extends Panel> extends PanelAction<T> {
  override update(): boolean {
    this.panel.ScrollToTop();

    return false;
  }
}

export class ScrollToBottomAction<T extends Panel> extends PanelAction<T> {
  override update(): boolean {
    this.panel.ScrollToBottom();

    return false;
  }
}

export class DeleteAsyncAction<T extends Panel> extends PanelAction<T> {
  #delay: number;

  constructor(panel: T, delay: number) {
    super(panel);

    this.#delay = delay;
  }

  override update(): boolean {
    this.panel.DeleteAsync(this.#delay);

    return false;
  }
}

export class RemoveChildrenAction<T extends Panel> extends PanelAction<T> {
  override update(): boolean {
    this.panel.RemoveAndDeleteChildren();

    return false;
  }
}

export class SelectOptionAction extends PanelAction<DropDown> {
  #optionId: string;

  constructor(panel: DropDown, optionId: string) {
    super(panel);

    this.#optionId = optionId;
  }

  override update(): boolean {
    this.panel.SetSelected(this.#optionId);

    return false;
  }
}

export class AddOptionAction extends PanelAction<DropDown> {
  #option: Panel | (() => Panel);

  constructor(panel: DropDown, option: Panel | (() => Panel)) {
    super(panel);

    this.#option = option;
  }

  override update(): boolean {
    const optionPanel = typeof this.#option === "function" ? this.#option() : this.#option;

    this.panel.AddOption(optionPanel);

    return false;
  }
}

export class RemoveOptionAction extends PanelAction<DropDown> {
  #optionId: string;

  constructor(panel: DropDown, optionId: string) {
    super(panel);

    this.#optionId = optionId;
  }

  override update(): boolean {
    this.panel.RemoveOption(this.#optionId);

    return false;
  }
}

export class RemoveAllOptionsAction extends PanelAction<DropDown> {
  override update(): boolean {
    this.panel.RemoveAllOptions();

    return false;
  }
}

export class FocusAction<T extends Panel> extends PanelAction<T> {
  override update(): boolean {
    this.panel.SetFocus();

    return false;
  }
}

export class FireEntityInputAction extends PanelAction<ScenePanel> {
  #entityName: string;
  #inputName: string;
  #inputArg: string;

  constructor(panel: ScenePanel, entityName: string, inputName: string, inputArg: string) {
    super(panel);

    this.#entityName = entityName;
    this.#inputName = inputName;
    this.#inputArg = inputArg;
  }

  override update(): boolean {
    this.panel.FireEntityInput(this.#entityName, this.#inputName, this.#inputArg);

    return false;
  }
}

abstract class SequenceBase<T extends Action> extends Action {
  protected action: T;

  constructor(action: T) {
    super();

    this.action = action;
  }

  override add(...actions: Action[]): this {
    this.action.add(...actions);

    return this;
  }

  override start(): void {
    this.action.start();
  }

  override update(): boolean {
    return this.action.update();
  }

  override finish(): void {
    this.action.finish();
  }

  run(): void {
    RunSingleAction(this.action);
  }

  // ----- actions -----

  noop(): this {
    return this.add(new NoopAction());
  }

  print(...args: unknown[]): this {
    return this.add(new PrintAction(...args));
  }

  runFn<F extends RunFunction>(fn: F, ...args: Parameters<F>): this {
    return this.add(new RunFunctionAction(fn, ...args));
  }

  wait(duration: number): this {
    return this.add(new WaitAction(duration));
  }

  waitOneFrame(): this {
    return this.add(new WaitOneFrameAction());
  }

  waitEvent<T extends Panel>(panel: T, eventName: string): this {
    return this.add(new WaitEventAction(panel, eventName));
  }

  waitAction(action: Action, timeoutDuration: number, continueAfterTimeout: boolean): this {
    return this.add(new WaitActionAction(action, timeoutDuration, continueAfterTimeout));
  }

  addClass<T extends Panel>(panel: T, cssClass: string): this {
    return this.add(new AddClassAction(panel, cssClass));
  }

  removeClass<T extends Panel>(panel: T, cssClass: string): this {
    return this.add(new RemoveClassAction(panel, cssClass));
  }

  switchClass<T extends Panel>(panel: T, original: string, replacement: string): this {
    return this.add(new SwitchClassAction(panel, original, replacement));
  }

  replaceClass<T extends Panel>(panel: T, original: string, replacement: string): this {
    return this.add(new ReplaceClassAction(panel, original, replacement));
  }

  waitClass<T extends Panel>(panel: T, cssClass: string): this {
    return this.add(new WaitClassAction(panel, cssClass));
  }

  deleteAsync<T extends Panel>(panel: T, delay: number): this {
    return this.add(new DeleteAsyncAction(panel, delay));
  }

  removeChildren<T extends Panel>(panel: T): this {
    return this.add(new RemoveChildrenAction(panel));
  }

  scrollToTop<T extends Panel>(panel: T): this {
    return this.add(new ScrollToTopAction(panel));
  }

  scrollToBottom<T extends Panel>(panel: T): this {
    return this.add(new ScrollToBottomAction(panel));
  }

  enable<T extends Panel>(panel: T): this {
    return this.add(new EnableAction(panel));
  }

  disable<T extends Panel>(panel: T): this {
    return this.add(new DisableAction(panel));
  }

  focus<T extends Panel>(panel: T): this {
    return this.add(new FocusAction(panel));
  }

  setAttribute<T extends Panel, K extends keyof T>(panel: T, attribute: K, value: T[K]): this {
    return this.add(new SetAttributeAction(panel, attribute, value));
  }

  setDialogVariable<T extends Panel>(panel: T, dvar: string, value: string): this {
    return this.add(new SetDialogVariableAction(panel, dvar, value));
  }

  setDialogVariableInt<T extends Panel>(panel: T, dvar: string, value: number): this {
    return this.add(new SetDialogVariableIntAction(panel, dvar, value));
  }

  setDialogVariableTime<T extends Panel>(panel: T, dvar: string, value: number): this {
    return this.add(new SetDialogVariableTimeAction(panel, dvar, value));
  }

  animateDialogVariableInt<T extends Panel>(
    panel: T,
    dvar: string,
    start: number,
    end: number,
    duration: number,
  ): this {
    return this.add(new AnimateDialogVariableIntAction(panel, dvar, start, end, duration));
  }

  setProgressBarValue(panel: ProgressBar, value: number): this {
    return this.add(new SetProgressBarValueAction(panel, value));
  }

  animateProgressBar(
    panel: ProgressBar,
    startValue: number,
    endValue: number,
    duration: number,
  ): this {
    return this.add(new AnimateProgressBarAction(panel, startValue, endValue, duration));
  }

  animateProgressBarWithMiddle(
    panel: ProgressBarWithMiddle,
    startValue: number,
    endValue: number,
    duration: number,
  ): this {
    return this.add(new AnimateProgressBarWithMiddleAction(panel, startValue, endValue, duration));
  }

  addOption(panel: DropDown, option: Panel | (() => Panel)): this {
    return this.add(new AddOptionAction(panel, option));
  }

  removeOption(panel: DropDown, optionId: string): this {
    return this.add(new RemoveOptionAction(panel, optionId));
  }

  removeAllOptions(panel: DropDown): this {
    return this.add(new RemoveAllOptionsAction(panel));
  }

  selectOption(panel: DropDown, optionId: string): this {
    return this.add(new SelectOptionAction(panel, optionId));
  }

  playSoundEffect(soundName: string): this {
    return this.add(new PlaySoundEffectAction(soundName));
  }

  fireEntityInput(
    panel: ScenePanel,
    entityName: string,
    inputName: string,
    inputArg: string,
  ): this {
    return this.add(new FireEntityInputAction(panel, entityName, inputName, inputArg));
  }
}

export class Sequence extends SequenceBase<RunSequentialActions> {
  constructor() {
    super(new RunSequentialActions());
  }
}

export class ParallelSequence extends SequenceBase<RunParallelActions> {
  constructor() {
    super(new RunParallelActions());
  }
}

export class ParallelAnySequence extends SequenceBase<RunUntilSingleActionFinishedAction> {
  constructor(keepRunning: boolean) {
    super(new RunUntilSingleActionFinishedAction(keepRunning));
  }
}

export class StaggeredSequence extends SequenceBase<RunStaggeredActions> {
  constructor(delay: number) {
    super(new RunStaggeredActions(delay));
  }
}

export class StopSequence {}
