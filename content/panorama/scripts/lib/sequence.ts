const { lodash: _ } = CustomUIConfig;

// ----------------------------------------------------------------------------
// Valve's sequence_actions.js
// ----------------------------------------------------------------------------

// Sequence actions are objects that you can use to queue up work to happen in a
// sequence over time.

// Base action, which is something that will tick per-frame for a while until it's done.
class Action {
  actions: Action[] = [];

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
}

class PanelAction<T extends Panel> extends Action {
  panel: T;

  constructor(panel: T) {
    super();

    this.panel = panel;
  }
}

// Action to run multiple actions all at once. The action is complete once all sub actions are done.
class RunParallelActions extends Action {
  actionsFinished: boolean[] = [];

  start() {
    this.actionsFinished = new Array(this.actions.length);

    for (let i = 0; i < this.actions.length; ++i) {
      this.actionsFinished[i] = false;
      this.actions[i].start();
    }
  }

  update() {
    let anyTicking = false;

    for (let i = 0; i < this.actions.length; ++i) {
      if (!this.actionsFinished[i]) {
        if (!this.actions[i].update()) {
          this.actions[i].finish();
          this.actionsFinished[i] = true;
        } else {
          anyTicking = true;
        }
      }
    }

    return anyTicking;
  }

  finish() {
    for (let i = 0; i < this.actions.length; ++i) {
      if (!this.actionsFinished[i]) {
        this.actions[i].finish();
        this.actionsFinished[i] = true;
      }
    }
  }
}

// Action to rum multiple actions in parallel, but with a slight stagger start between each of them
class RunStaggeredActions extends Action {
  staggerSeconds: number;
  par: RunParallelActions;

  constructor(staggerSeconds: number) {
    super();

    this.staggerSeconds = staggerSeconds;
    this.par = new RunParallelActions();
  }

  start() {
    for (let i = 0; i < this.actions.length; ++i) {
      const delay = i * this.staggerSeconds;

      if (delay > 0) {
        const seq = new RunSequentialActions();

        seq.actions.push(new WaitAction(delay));
        seq.actions.push(this.actions[i]);

        this.par.actions.push(seq);
      } else {
        this.par.actions.push(this.actions[i]);
      }
    }

    this.par.start();
  }

  update() {
    return this.par.update();
  }

  finish() {
    this.par.finish();
  }
}

// Runs a set of actions but stops as soon as any of them are finished.  continueOtherActions is a bool
// that determines whether to continue ticking the remaining actions, or whether to just finish them immediately.
class RunUntilSingleActionFinishedAction extends Action {
  actionsFinished: boolean[] = [];
  continueOtherActions: boolean;

  constructor(continueOtherActions: boolean) {
    super();

    this.continueOtherActions = continueOtherActions;
  }

  start() {
    this.actionsFinished = new Array(this.actions.length);

    for (let i = 0; i < this.actions.length; ++i) {
      this.actionsFinished[i] = false;
      this.actions[i].start();
    }
  }

  update() {
    if (this.actions.length == 0) return false;

    let anyFinished = false;

    for (let i = 0; i < this.actions.length; ++i) {
      if (!this.actions[i].update()) {
        this.actions[i].finish();
        this.actionsFinished[i] = true;
        anyFinished = true;
      }
    }

    return !anyFinished;
  }

  finish() {
    if (this.continueOtherActions) {
      // If we want to make sure the rest tick out, then build a new RunParallelActions of all
      // the remaining actions, then have it tick out separately.
      const runParallel = new RunParallelActions();

      for (let i = 0; i < this.actions.length; ++i) {
        if (!this.actionsFinished[i]) {
          runParallel.actions.push(this.actions[i]);
        }
      }

      if (runParallel.actions.length > 0) {
        UpdateSingleActionUntilFinished(runParallel);
      }
    } else {
      // Just finish each action immediately
      for (let i = 0; i < this.actions.length; ++i) {
        if (!this.actionsFinished[i]) {
          this.actions[i].finish();
        }
      }
    }
  }
}

// Action to wait for some amount of seconds before resuming
class WaitAction extends Action {
  seconds: number;
  endTimestamp = 0;

  constructor(seconds: number) {
    super();

    this.seconds = seconds;
  }

  start() {
    this.endTimestamp = Date.now() + this.seconds * 1000.0;
  }

  update() {
    return Date.now() < this.endTimestamp;
  }
}

// Action to wait a single frame
class WaitOneFrameAction extends Action {
  updated = false;

  start() {
    this.updated = false;
  }

  update() {
    if (this.updated) {
      return false;
    }

    this.updated = true;

    return true;
  }
}

// Action that waits for a specific event type to be fired on the given panel.
class WaitEventAction<T extends Panel> extends PanelAction<T> {
  eventName: string;
  receivedEvent = false;

  constructor(panel: T, eventName: string) {
    super(panel);

    this.eventName = eventName;
  }

  start() {
    this.receivedEvent = false;

    $.RegisterEventHandler(this.eventName, this.panel, () => {
      this.receivedEvent = true;
    });
  }

  update() {
    return !this.receivedEvent;
  }
}

// Run an action until it's complete, or until it hits a timeout. continueAfterTimeout is a bool
// determining whether to continue ticking the action after it has timed out
class WaitActionAction extends Action {
  action: Action;
  timeoutDuration: number;
  continueAfterTimeout: boolean;
  allAction: RunUntilSingleActionFinishedAction;

  constructor(action: Action, timeoutDuration: number, continueAfterTimeout: boolean) {
    super();

    this.action = action;
    this.timeoutDuration = timeoutDuration;
    this.continueAfterTimeout = continueAfterTimeout;
    this.allAction = new RunUntilSingleActionFinishedAction(this.continueAfterTimeout);
  }

  start() {
    this.allAction.actions.push(this.action);
    this.allAction.actions.push(new WaitAction(this.timeoutDuration));
    this.allAction.start();
  }

  update() {
    return this.allAction.update();
  }

  finish() {
    this.allAction.finish();
  }
}

// Action to add a class to a panel
class AddClassAction<T extends Panel> extends PanelAction<T> {
  panelClass: string;

  constructor(panel: T, panelClass: string) {
    super(panel);

    this.panelClass = panelClass;
  }

  update() {
    this.panel.AddClass(this.panelClass);

    return false;
  }
}

// Action to remove a class to a panel
class RemoveClassAction<T extends Panel> extends PanelAction<T> {
  panelClass: string;

  constructor(panel: T, panelClass: string) {
    super(panel);

    this.panelClass = panelClass;
  }

  update() {
    this.panel.RemoveClass(this.panelClass);

    return false;
  }
}

// Switch a class on a panel
class SwitchClassAction<T extends Panel> extends PanelAction<T> {
  panelSlot: string;
  panelClass: string;

  constructor(panel: T, panelSlot: string, panelClass: string) {
    super(panel);

    this.panelSlot = panelSlot;
    this.panelClass = panelClass;
  }

  update() {
    this.panel.SwitchClass(this.panelSlot, this.panelClass);

    return false;
  }
}

// Action to wait for a class to appear on a panel
class WaitClassAction<T extends Panel> extends PanelAction<T> {
  panelClass: string;

  constructor(panel: T, panelClass: string) {
    super(panel);

    this.panelClass = panelClass;
  }

  update() {
    return !this.panel.BHasClass(this.panelClass);
  }
}

// Action to set an integer dialog variable
class SetDialogVariableIntAction<T extends Panel> extends PanelAction<T> {
  dialogVariable: string;
  value: number;

  constructor(panel: T, dialogVariable: string, value: number) {
    super(panel);

    this.dialogVariable = dialogVariable;
    this.value = value;
  }

  update() {
    this.panel.SetDialogVariableInt(this.dialogVariable, this.value);

    return false;
  }
}

// Action to animate an integer dialog variable over some duration of seconds
class AnimateDialogVariableIntAction<T extends Panel> extends PanelAction<T> {
  dialogVariable: string;
  startValue: number;
  endValue: number;
  seconds: number;
  startTimestamp = 0;
  endTimestamp = 0;

  constructor(panel: T, dialogVariable: string, start: number, end: number, seconds: number) {
    super(panel);

    this.dialogVariable = dialogVariable;
    this.startValue = start;
    this.endValue = end;
    this.seconds = seconds;
  }

  start() {
    this.startTimestamp = Date.now();
    this.endTimestamp = this.startTimestamp + this.seconds * 1000;
  }

  update() {
    const now = Date.now();

    if (now >= this.endTimestamp) {
      return false;
    }

    const ratio = (now - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);

    this.panel.SetDialogVariableInt(
      this.dialogVariable,
      this.startValue + (this.endValue - this.startValue) * ratio
    );

    return true;
  }

  finish() {
    this.panel.SetDialogVariableInt(this.dialogVariable, this.endValue);
  }
}

// Action to set a progress bar's value
class SetProgressBarValueAction extends Action {
  progressBar: ProgressBar;
  value: number;

  constructor(progressBar: ProgressBar, value: number) {
    super();

    this.progressBar = progressBar;
    this.value = value;
  }

  update() {
    this.progressBar.value = this.value;

    return false;
  }
}

// Action to animate a progress bar
class AnimateProgressBarAction extends Action {
  progressBar: ProgressBar;
  startValue: number;
  endValue: number;
  seconds: number;
  startTimestamp = 0;
  endTimestamp = 0;

  constructor(progressBar: ProgressBar, startValue: number, endValue: number, seconds: number) {
    super();

    this.progressBar = progressBar;
    this.startValue = startValue;
    this.endValue = endValue;
    this.seconds = seconds;
  }

  start() {
    this.startTimestamp = Date.now();
    this.endTimestamp = this.startTimestamp + this.seconds * 1000;
  }

  update() {
    const now = Date.now();

    if (now >= this.endTimestamp) {
      return false;
    }

    const ratio = (now - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);

    this.progressBar.value = this.startValue + (this.endValue - this.startValue) * ratio;

    return true;
  }

  finish() {
    this.progressBar.value = this.endValue;
  }
}

// Action to animate a progress bar	with middle
class AnimateProgressBarWithMiddleAction extends Action {
  progressBar: ProgressBarWithMiddle;
  startValue: number;
  endValue: number;
  seconds: number;
  startTimestamp = 0;
  endTimestamp = 0;

  constructor(
    progressBar: ProgressBarWithMiddle,
    startValue: number,
    endValue: number,
    seconds: number
  ) {
    super();

    this.progressBar = progressBar;
    this.startValue = startValue;
    this.endValue = endValue;
    this.seconds = seconds;
  }

  start() {
    this.startTimestamp = Date.now();
    this.endTimestamp = this.startTimestamp + this.seconds * 1000;
  }

  update() {
    const now = Date.now();

    if (now >= this.endTimestamp) {
      return false;
    }

    const ratio = (now - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);

    this.progressBar.uppervalue = this.startValue + (this.endValue - this.startValue) * ratio;

    return true;
  }

  finish() {
    this.progressBar.uppervalue = this.endValue;
  }
}

function PlaySoundEffect(soundName: string) {
  $.DispatchEvent("PlaySoundEffect", soundName);
}

// Action to play a sound effect
class PlaySoundEffectAction extends Action {
  soundName: string;

  constructor(soundName: string) {
    super();

    this.soundName = soundName;
  }

  update() {
    PlaySoundEffect(this.soundName);

    return false;
  }
}

// ----------------------------------------------------------------------------

// Helper function to asynchronously tick a single action until it's finished, then call finish on it.
function UpdateSingleActionUntilFinished(action: Action) {
  const callback = function () {
    if (!action.update()) {
      action.finish();
    } else {
      $.Schedule(0.0, callback);
    }
  };

  callback();
}

// Call RunSingleAction to start a single action and continue ticking it until it's done
function RunSingleAction(action: Action) {
  action.start();

  UpdateSingleActionUntilFinished(action);
}

// ----------------------------------------------------------------------------
// END sequence_actions.js
// ----------------------------------------------------------------------------

class NoopAction extends Action {
  update() {
    return false;
  }
}

// Action to print a debug message
class PrintAction extends Action {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super();

    this.args = args;
  }

  update() {
    $.Msg(...this.args);

    return false;
  }
}

// Action that simply runs a passed in function. You may include extra arguments and they will be passed to the called function.
class RunFunctionAction extends Action {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(fn: (...args: any[]) => void, ...args: any[]) {
    super();

    this.fn = fn;
    this.args = args;
  }

  update() {
    this.fn(...this.args);

    return false;
  }
}

class ReplaceClassAction<T extends Panel> extends PanelAction<T> {
  className: string;
  replacement: string;

  constructor(panel: T, className: string, replacement: string) {
    super(panel);

    this.className = className;
    this.replacement = replacement;
  }

  update() {
    this.panel.RemoveClass(this.className);
    this.panel.AddClass(this.replacement);

    return false;
  }
}

class SetAttributeAction<T extends Panel, K extends keyof T> extends PanelAction<T> {
  attribute: K;
  value: T[K];

  constructor(panel: T, attribute: K, value: T[K]) {
    super(panel);

    this.attribute = attribute;
    this.value = value;
  }

  update() {
    this.panel[this.attribute] = this.value;

    return false;
  }
}

class EnableAction<T extends Panel> extends SetAttributeAction<T, "enabled"> {
  constructor(panel: T) {
    super(panel, "enabled", true);
  }
}

class DisableAction<T extends Panel> extends SetAttributeAction<T, "enabled"> {
  constructor(panel: T) {
    super(panel, "enabled", false);
  }
}

class SetDialogVariableAction<T extends Panel> extends PanelAction<T> {
  variable: string;
  value: string;

  constructor(panel: T, variable: string, value: string) {
    super(panel);

    this.variable = variable;
    this.value = value;
  }

  update() {
    this.panel.SetDialogVariable(this.variable, this.value);

    return false;
  }
}

class SetDialogVariableTimeAction<T extends Panel> extends PanelAction<T> {
  variable: string;
  value: number;

  constructor(panel: T, variable: string, value: number) {
    super(panel);

    this.variable = variable;
    this.value = value;
  }

  update() {
    this.panel.SetDialogVariableTime(this.variable, this.value);

    return false;
  }
}

class ScrollToTopAction<T extends Panel> extends PanelAction<T> {
  update() {
    this.panel.ScrollToTop();

    return false;
  }
}

class ScrollToBottomAction<T extends Panel> extends PanelAction<T> {
  update() {
    this.panel.ScrollToBottom();

    return false;
  }
}

class DeleteAsyncAction<T extends Panel> extends PanelAction<T> {
  delay: number;

  constructor(panel: T, delay: number) {
    super(panel);

    this.delay = delay;
  }

  update() {
    this.panel.DeleteAsync(this.delay);

    return false;
  }
}

class RemoveChildrenAction<T extends Panel> extends PanelAction<T> {
  update() {
    this.panel.RemoveAndDeleteChildren();

    return false;
  }
}

class SelectOptionAction extends PanelAction<DropDown> {
  optionID: string;

  constructor(panel: DropDown, optionID: string) {
    super(panel);

    this.optionID = optionID;
  }

  update() {
    this.panel.SetSelected(this.optionID);

    return false;
  }
}

class AddOptionAction extends PanelAction<DropDown> {
  option: Panel | (() => Panel);

  constructor(panel: DropDown, option: Panel | (() => Panel)) {
    super(panel);

    this.option = option;
  }

  update() {
    const optionPanel = typeof this.option === "function" ? this.option() : this.option;

    this.panel.AddOption(optionPanel);

    return false;
  }
}

class RemoveOptionAction extends PanelAction<DropDown> {
  optionID: string;

  constructor(panel: DropDown, optionID: string) {
    super(panel);

    this.optionID = optionID;
  }

  update() {
    this.panel.RemoveOption(this.optionID);

    return false;
  }
}

class RemoveAllOptionsAction extends PanelAction<DropDown> {
  update() {
    this.panel.RemoveAllOptions();

    return false;
  }
}

class FocusAction<T extends Panel> extends PanelAction<T> {
  update() {
    this.panel.SetFocus();

    return false;
  }
}

class FireEntityInputAction extends PanelAction<ScenePanel> {
  entityName: string;
  inputName: string;
  inputArg: string;

  constructor(panel: ScenePanel, entityName: string, inputName: string, inputArg: string) {
    super(panel);

    this.entityName = entityName;
    this.inputName = inputName;
    this.inputArg = inputArg;
  }

  update() {
    this.panel.FireEntityInput(this.entityName, this.inputName, this.inputArg);

    return false;
  }
}

class StopSequence {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSequence(action: any): action is { size(): number } {
  return (
    action instanceof Sequence ||
    action instanceof ParallelSequence ||
    action instanceof ParallelAnySequence ||
    action instanceof StaggeredSequence
  );
}

function actionSize(action: Action) {
  return isSequence(action) ? action.size() : 1;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

function SequenceMixin<TBase extends Constructor<Action>>(Base: TBase) {
  return class SequenceMixin extends Base {
    size() {
      return _.reduce(this.actions, (size, action) => size + actionSize(action), 1);
    }

    Run() {
      RunSingleAction(this);
    }

    Action(...actions: Action[]) {
      this.actions.push(...actions);

      return this;
    }

    Noop() {
      return this.Action(new NoopAction());
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Function(fn: (...args: any[]) => void, ...args: any[]) {
      return this.Action(new RunFunctionAction(fn, ...args));
    }

    Wait(seconds: number) {
      return this.Action(new WaitAction(seconds));
    }

    WaitOneFrame() {
      return this.Action(new WaitOneFrameAction());
    }

    WaitEvent<T extends Panel>(panel: T, eventName: string) {
      return this.Action(new WaitEventAction(panel, eventName));
    }

    WaitAction(action: Action, timeoutDuration: number, continueAfterTimeout: boolean) {
      return this.Action(new WaitActionAction(action, timeoutDuration, continueAfterTimeout));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Print(...args: any[]) {
      return this.Action(new PrintAction(...args));
    }

    AddClass<T extends Panel>(panel: T, className: string) {
      return this.Action(new AddClassAction(panel, className));
    }

    RemoveClass<T extends Panel>(panel: T, className: string) {
      return this.Action(new RemoveClassAction(panel, className));
    }

    SwitchClass<T extends Panel>(panel: T, panelSlot: string, className: string) {
      return this.Action(new SwitchClassAction(panel, panelSlot, className));
    }

    ReplaceClass<T extends Panel>(panel: T, className: string, replacement: string) {
      return this.Action(new ReplaceClassAction(panel, className, replacement));
    }

    WaitClass<T extends Panel>(panel: T, className: string) {
      return this.Action(new WaitClassAction(panel, className));
    }

    DeleteAsync<T extends Panel>(panel: T, delay: number) {
      return this.Action(new DeleteAsyncAction(panel, delay));
    }

    RemoveChildren<T extends Panel>(panel: T) {
      return this.Action(new RemoveChildrenAction(panel));
    }

    ScrollToTop<T extends Panel>(panel: T) {
      return this.Action(new ScrollToTopAction(panel));
    }

    ScrollToBottom<T extends Panel>(panel: T) {
      return this.Action(new ScrollToBottomAction(panel));
    }

    Enable<T extends Panel>(panel: T) {
      return this.Action(new EnableAction(panel));
    }

    Disable<T extends Panel>(panel: T) {
      return this.Action(new DisableAction(panel));
    }

    Focus<T extends Panel>(panel: T) {
      return this.Action(new FocusAction(panel));
    }

    SetAttribute<T extends Panel, K extends keyof T>(panel: T, attribute: K, value: T[K]) {
      return this.Action(new SetAttributeAction(panel, attribute, value));
    }

    SetDialogVariable<T extends Panel>(panel: T, dialogVariable: string, value: string) {
      return this.Action(new SetDialogVariableAction(panel, dialogVariable, value));
    }

    SetDialogVariableInt<T extends Panel>(panel: T, dialogVariable: string, value: number) {
      return this.Action(new SetDialogVariableIntAction(panel, dialogVariable, value));
    }

    SetDialogVariableTime<T extends Panel>(panel: T, dialogVariable: string, value: number) {
      return this.Action(new SetDialogVariableTimeAction(panel, dialogVariable, value));
    }

    AnimateDialogVariableInt<T extends Panel>(
      panel: T,
      dialogVariable: string,
      start: number,
      end: number,
      seconds: number
    ) {
      return this.Action(
        new AnimateDialogVariableIntAction(panel, dialogVariable, start, end, seconds)
      );
    }

    SetProgressBarValue(progressBar: ProgressBar, value: number) {
      return this.Action(new SetProgressBarValueAction(progressBar, value));
    }

    AnimateProgressBar(
      progressBar: ProgressBar,
      startValue: number,
      endValue: number,
      seconds: number
    ) {
      return this.Action(new AnimateProgressBarAction(progressBar, startValue, endValue, seconds));
    }

    AnimateProgressBarWithMiddle(
      progressBar: ProgressBarWithMiddle,
      startValue: number,
      endValue: number,
      seconds: number
    ) {
      return this.Action(
        new AnimateProgressBarWithMiddleAction(progressBar, startValue, endValue, seconds)
      );
    }

    AddOption(panel: DropDown, option: Panel | (() => Panel)) {
      return this.Action(new AddOptionAction(panel, option));
    }

    RemoveOption(panel: DropDown, optionID: string) {
      return this.Action(new RemoveOptionAction(panel, optionID));
    }

    RemoveAllOptions(panel: DropDown) {
      return this.Action(new RemoveAllOptionsAction(panel));
    }

    SelectOption(panel: DropDown, optionID: string) {
      return this.Action(new SelectOptionAction(panel, optionID));
    }

    PlaySoundEffect(soundName: string) {
      return this.Action(new PlaySoundEffectAction(soundName));
    }

    FireEntityInput(panel: ScenePanel, entityName: string, inputName: string, inputArg: string) {
      return this.Action(new FireEntityInputAction(panel, entityName, inputName, inputArg));
    }
  };
}

class RunSequentialActions extends Action {
  index = 0;
  running = false;
  stop = false;

  start() {
    this.index = 0;
    this.running = false;
    this.stop = false;
  }

  update() {
    while (this.index < this.actions.length) {
      const action = this.actions[this.index];

      if (!this.running) {
        action.start();

        this.running = true;
      }

      let continueRunning;

      try {
        continueRunning = action.update();
      } catch (
        err: any // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        if (err instanceof StopSequence) {
          const skipCount = this.actions.length - this.index + 1;

          $.Msg("StopSequence", { current: this.index, skipped: skipCount });

          this.stop = true;

          return false;
        }

        if ("stack" in err) {
          $.Msg(err.stack);
        }

        throw err;
      }

      if (continueRunning) {
        return true;
      }

      action.finish();

      this.running = false;
      this.index++;
    }

    return false;
  }

  finish() {
    if (this.stop) return;

    while (this.index < this.actions.length) {
      const action = this.actions[this.index];

      if (!this.running) {
        action.start();

        this.running = true;

        action.update();
      }

      action.finish();

      this.index++;
      this.running = false;
    }
  }
}

const Sequence = SequenceMixin(RunSequentialActions);
const ParallelSequence = SequenceMixin(RunParallelActions);
const ParallelAnySequence = SequenceMixin(RunUntilSingleActionFinishedAction);
const StaggeredSequence = SequenceMixin(RunStaggeredActions);

const module = {
  // sequences
  Sequence,
  ParallelSequence,
  ParallelAnySequence,
  StaggeredSequence,
  // actions
  Action,
  NoopAction,
  PrintAction,
  RunFunctionAction,
  WaitAction,
  WaitOneFrameAction,
  WaitEventAction,
  WaitActionAction,
  AddClassAction,
  RemoveClassAction,
  SwitchClassAction,
  ReplaceClassAction,
  WaitClassAction,
  ScrollToTopAction,
  ScrollToBottomAction,
  DeleteAsyncAction,
  RemoveChildrenAction,
  EnableAction,
  DisableAction,
  FocusAction,
  SetAttributeAction,
  SetDialogVariableAction,
  SetDialogVariableIntAction,
  AnimateDialogVariableIntAction,
  SetDialogVariableTimeAction,
  SetProgressBarValueAction,
  AnimateProgressBarAction,
  AnimateProgressBarWithMiddleAction,
  AddOptionAction,
  RemoveOptionAction,
  RemoveAllOptionsAction,
  SelectOptionAction,
  PlaySoundEffectAction,
  FireEntityInputAction,
  // exceptions
  StopSequence,
};

export type SequenceModule = typeof module;
export type {
  // sequences
  Sequence,
  ParallelSequence,
  ParallelAnySequence,
  StaggeredSequence,
  // actions
  Action,
  NoopAction,
  PrintAction,
  RunFunctionAction,
  WaitAction,
  WaitOneFrameAction,
  WaitEventAction,
  WaitActionAction,
  AddClassAction,
  RemoveClassAction,
  SwitchClassAction,
  ReplaceClassAction,
  WaitClassAction,
  ScrollToTopAction,
  ScrollToBottomAction,
  DeleteAsyncAction,
  RemoveChildrenAction,
  EnableAction,
  DisableAction,
  FocusAction,
  SetAttributeAction,
  SetDialogVariableAction,
  SetDialogVariableIntAction,
  AnimateDialogVariableIntAction,
  SetDialogVariableTimeAction,
  SetProgressBarValueAction,
  AnimateProgressBarAction,
  AnimateProgressBarWithMiddleAction,
  AddOptionAction,
  RemoveOptionAction,
  RemoveAllOptionsAction,
  SelectOptionAction,
  PlaySoundEffectAction,
  FireEntityInputAction,
  // exceptions
  StopSequence,
};

CustomUIConfig.Sequence = module;
