// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace sequence {
    // ----------------------------------------------------------------------------
    // Valve's sequence_actions.js
    // ----------------------------------------------------------------------------

    // Sequence actions are objects that you can use to queue up work to happen in a
    // sequence over time.

    // Base action, which is something that will tick per-frame for a while until it's done.
    export abstract class Action {
      actions: Action[] = [];

      protected nth(index: number): Action {
        const action = this.actions[index];

        if (action == null) {
          throw new Error(
            `${this.constructor.name}: invalid action index=${index} actions.length=${this.actions.length}`,
          );
        }

        return action;
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

      size(): number {
        return this.actions.reduce((size, action) => size + action.size(), 1);
      }
    }

    class RunSequentialActions extends Action {
      index = 0;
      running = false;
      stop = false;

      override start(): void {
        this.index = 0;
        this.running = false;
        this.stop = false;
      }

      override update(): boolean {
        while (this.index < this.actions.length) {
          const action = this.nth(this.index);

          if (!this.running) {
            action.start();

            this.running = true;
          }

          try {
            if (action.update()) return true;
          } catch (err: unknown) {
            return this.handleError(err);
          }

          action.finish();

          this.running = false;
          this.index++;
        }

        return false;
      }

      override finish(): void {
        if (this.stop) return;

        while (this.index < this.actions.length) {
          const action = this.nth(this.index);

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

      private handleError(err: unknown): boolean {
        if (err instanceof StopSequence) {
          const skipCount = this.actions.length - this.index + 1;

          $.Msg("StopSequence", { current: this.index, skipped: skipCount });

          this.stop = true;

          return false;
        }

        throw err;
      }
    }

    // Action to run multiple actions all at once. The action is complete once all sub actions are done.
    class RunParallelActions extends Action {
      actionsFinished: boolean[] = [];

      override start(): void {
        this.actionsFinished = new Array(this.actions.length);

        for (let i = 0; i < this.actions.length; ++i) {
          const action = this.nth(i);

          this.actionsFinished[i] = false;

          action.start();
        }
      }

      override update(): boolean {
        let anyTicking = false;

        for (let i = 0; i < this.actions.length; ++i) {
          const action = this.nth(i);

          if (!this.actionsFinished[i]) {
            if (!action.update()) {
              action.finish();

              this.actionsFinished[i] = true;
            } else {
              anyTicking = true;
            }
          }
        }

        return anyTicking;
      }

      override finish(): void {
        for (let i = 0; i < this.actions.length; ++i) {
          const action = this.nth(i);

          if (!this.actionsFinished[i]) {
            action.finish();

            this.actionsFinished[i] = true;
          }
        }
      }
    }

    // Action to rum multiple actions in parallel, but with a slight stagger start between each of them
    class RunStaggeredActions extends Action {
      private runParallel: RunParallelActions;

      constructor(protected delay: number) {
        super();

        this.runParallel = new RunParallelActions();
      }

      override start(): void {
        for (let i = 0; i < this.actions.length; ++i) {
          const action = this.nth(i);
          const delay = i * this.delay;

          if (delay > 0) {
            const seq = new RunSequentialActions();

            seq.actions.push(new WaitAction(delay));
            seq.actions.push(action);

            this.runParallel.actions.push(seq);
          } else {
            this.runParallel.actions.push(action);
          }
        }

        this.runParallel.start();
      }

      override update(): boolean {
        return this.runParallel.update();
      }

      override finish(): void {
        this.runParallel.finish();
      }
    }

    // Runs a set of actions but stops as soon as any of them are finished.  continueOtherActions is a bool
    // that determines whether to continue ticking the remaining actions, or whether to just finish them immediately.
    class RunUntilSingleActionFinishedAction extends Action {
      finished: boolean[] = [];

      constructor(protected keepRunning: boolean) {
        super();
      }

      override start(): void {
        this.finished = new Array(this.actions.length);

        for (let i = 0; i < this.actions.length; ++i) {
          const action = this.nth(i);

          this.finished[i] = false;

          action.start();
        }
      }

      override update(): boolean {
        if (this.actions.length === 0) return false;

        let anyFinished = false;

        for (let i = 0; i < this.actions.length; ++i) {
          const action = this.nth(i);

          if (!action.update()) {
            action.finish();

            this.finished[i] = true;
            anyFinished = true;
          }
        }

        return !anyFinished;
      }

      override finish(): void {
        if (this.keepRunning) {
          // If we want to make sure the rest tick out, then build a new RunParallelActions of all
          // the remaining actions, then have it tick out separately.
          const runParallel = new RunParallelActions();

          for (let i = 0; i < this.actions.length; ++i) {
            const action = this.nth(i);

            if (!this.finished[i]) {
              runParallel.actions.push(action);
            }
          }

          if (runParallel.actions.length > 0) {
            UpdateSingleActionUntilFinished(runParallel);
          }
        } else {
          // Just finish each action immediately
          for (let i = 0; i < this.actions.length; ++i) {
            const action = this.nth(i);

            if (!this.finished[i]) {
              action.finish();
            }
          }
        }
      }
    }

    export class PanelAction<T extends Panel> extends Action {
      panel: T;

      constructor(panel: T) {
        super();

        this.panel = panel;
      }
    }

    // Action to wait for some amount of seconds before resuming
    export class WaitAction extends Action {
      seconds: number;
      endTimestamp = 0;

      constructor(seconds: number) {
        super();

        this.seconds = seconds;
      }

      override start(): void {
        this.endTimestamp = Date.now() + this.seconds * 1000.0;
      }

      override update(): boolean {
        return Date.now() < this.endTimestamp;
      }
    }

    // Action to wait a single frame
    export class WaitOneFrameAction extends Action {
      updated = false;

      override start(): void {
        this.updated = false;
      }

      override update(): boolean {
        if (this.updated) {
          return false;
        }

        this.updated = true;

        return true;
      }
    }

    // Action that waits for a specific event type to be fired on the given panel.
    export class WaitEventAction<T extends Panel> extends PanelAction<T> {
      eventName: string;
      receivedEvent = false;

      constructor(panel: T, eventName: string) {
        super(panel);

        this.eventName = eventName;
      }

      override start(): void {
        this.receivedEvent = false;

        $.RegisterEventHandler(this.eventName, this.panel, () => {
          this.receivedEvent = true;
        });
      }

      override update(): boolean {
        return !this.receivedEvent;
      }
    }

    // Run an action until it's complete, or until it hits a timeout. continueAfterTimeout is a bool
    // determining whether to continue ticking the action after it has timed out
    export class WaitActionAction extends Action {
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

      override start(): void {
        this.allAction.actions.push(this.action);
        this.allAction.actions.push(new WaitAction(this.timeoutDuration));
        this.allAction.start();
      }

      override update(): boolean {
        return this.allAction.update();
      }

      override finish(): void {
        this.allAction.finish();
      }
    }

    // Action to add a class to a panel
    export class AddClassAction<T extends Panel> extends PanelAction<T> {
      panelClass: string;

      constructor(panel: T, panelClass: string) {
        super(panel);

        this.panelClass = panelClass;
      }

      override update(): boolean {
        this.panel.AddClass(this.panelClass);

        return false;
      }
    }

    // Action to remove a class to a panel
    export class RemoveClassAction<T extends Panel> extends PanelAction<T> {
      panelClass: string;

      constructor(panel: T, panelClass: string) {
        super(panel);

        this.panelClass = panelClass;
      }

      override update(): boolean {
        this.panel.RemoveClass(this.panelClass);

        return false;
      }
    }

    // Switch a class on a panel
    export class SwitchClassAction<T extends Panel> extends PanelAction<T> {
      panelSlot: string;
      panelClass: string;

      constructor(panel: T, panelSlot: string, panelClass: string) {
        super(panel);

        this.panelSlot = panelSlot;
        this.panelClass = panelClass;
      }

      override update(): boolean {
        this.panel.SwitchClass(this.panelSlot, this.panelClass);

        return false;
      }
    }

    // Action to wait for a class to appear on a panel
    export class WaitClassAction<T extends Panel> extends PanelAction<T> {
      panelClass: string;

      constructor(panel: T, panelClass: string) {
        super(panel);

        this.panelClass = panelClass;
      }

      override update(): boolean {
        return !this.panel.BHasClass(this.panelClass);
      }
    }

    // Action to set an integer dialog variable
    export class SetDialogVariableIntAction<T extends Panel> extends PanelAction<T> {
      dialogVariable: string;
      value: number;

      constructor(panel: T, dialogVariable: string, value: number) {
        super(panel);

        this.dialogVariable = dialogVariable;
        this.value = value;
      }

      override update(): boolean {
        this.panel.SetDialogVariableInt(this.dialogVariable, this.value);

        return false;
      }
    }

    // Action to animate an integer dialog variable over some duration of seconds
    export class AnimateDialogVariableIntAction<T extends Panel> extends PanelAction<T> {
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

      override start(): void {
        this.startTimestamp = Date.now();
        this.endTimestamp = this.startTimestamp + this.seconds * 1000;
      }

      override update(): boolean {
        const now = Date.now();

        if (now >= this.endTimestamp) {
          return false;
        }

        const ratio = (now - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);

        this.panel.SetDialogVariableInt(
          this.dialogVariable,
          this.startValue + (this.endValue - this.startValue) * ratio,
        );

        return true;
      }

      override finish(): void {
        this.panel.SetDialogVariableInt(this.dialogVariable, this.endValue);
      }
    }

    // Action to set a progress bar's value
    export class SetProgressBarValueAction extends Action {
      progressBar: ProgressBar;
      value: number;

      constructor(progressBar: ProgressBar, value: number) {
        super();

        this.progressBar = progressBar;
        this.value = value;
      }

      override update(): boolean {
        this.progressBar.value = this.value;

        return false;
      }
    }

    // Action to animate a progress bar
    export class AnimateProgressBarAction extends Action {
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

      override start(): void {
        this.startTimestamp = Date.now();
        this.endTimestamp = this.startTimestamp + this.seconds * 1000;
      }

      override update(): boolean {
        const now = Date.now();

        if (now >= this.endTimestamp) {
          return false;
        }

        const ratio = (now - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);

        this.progressBar.value = this.startValue + (this.endValue - this.startValue) * ratio;

        return true;
      }

      override finish(): void {
        this.progressBar.value = this.endValue;
      }
    }

    // Action to animate a progress bar	with middle
    export class AnimateProgressBarWithMiddleAction extends Action {
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
        seconds: number,
      ) {
        super();

        this.progressBar = progressBar;
        this.startValue = startValue;
        this.endValue = endValue;
        this.seconds = seconds;
      }

      override start(): void {
        this.startTimestamp = Date.now();
        this.endTimestamp = this.startTimestamp + this.seconds * 1000;
      }

      override update(): boolean {
        const now = Date.now();

        if (now >= this.endTimestamp) {
          return false;
        }

        const ratio = (now - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);

        this.progressBar.uppervalue = this.startValue + (this.endValue - this.startValue) * ratio;

        return true;
      }

      override finish(): void {
        this.progressBar.uppervalue = this.endValue;
      }
    }

    // Action to play a sound effect
    export class PlaySoundEffectAction extends Action {
      soundName: string;

      constructor(soundName: string) {
        super();

        this.soundName = soundName;
      }

      override update(): boolean {
        $.DispatchEvent("PlaySoundEffect", this.soundName);

        return false;
      }
    }

    // ----------------------------------------------------------------------------

    // Helper function to asynchronously tick a single action until it's finished, then call finish on it.
    function UpdateSingleActionUntilFinished(action: Action): void {
      const run = () => {
        try {
          if (!action.update()) {
            action.finish();
          } else {
            $.Schedule(0.0, run);
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
      fn: F;
      args: Parameters<F>;

      constructor(fn: F, ...args: Parameters<F>) {
        super();

        this.fn = fn;
        this.args = args;
      }

      override update(): boolean {
        this.fn(...this.args);

        return false;
      }
    }

    export class ReplaceClassAction<T extends Panel> extends PanelAction<T> {
      className: string;
      replacement: string;

      constructor(panel: T, className: string, replacement: string) {
        super(panel);

        this.className = className;
        this.replacement = replacement;
      }

      override update(): boolean {
        this.panel.RemoveClass(this.className);
        this.panel.AddClass(this.replacement);

        return false;
      }
    }

    export class SetAttributeAction<T extends Panel, K extends keyof T> extends PanelAction<T> {
      attribute: K;
      value: T[K];

      constructor(panel: T, attribute: K, value: T[K]) {
        super(panel);

        this.attribute = attribute;
        this.value = value;
      }

      override update(): boolean {
        this.panel[this.attribute] = this.value;

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
      variable: string;
      value: string;

      constructor(panel: T, variable: string, value: string) {
        super(panel);

        this.variable = variable;
        this.value = value;
      }

      override update(): boolean {
        this.panel.SetDialogVariable(this.variable, this.value);

        return false;
      }
    }

    export class SetDialogVariableTimeAction<T extends Panel> extends PanelAction<T> {
      variable: string;
      value: number;

      constructor(panel: T, variable: string, value: number) {
        super(panel);

        this.variable = variable;
        this.value = value;
      }

      override update(): boolean {
        this.panel.SetDialogVariableTime(this.variable, this.value);

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
      delay: number;

      constructor(panel: T, delay: number) {
        super(panel);

        this.delay = delay;
      }

      override update(): boolean {
        this.panel.DeleteAsync(this.delay);

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
      optionID: string;

      constructor(panel: DropDown, optionID: string) {
        super(panel);

        this.optionID = optionID;
      }

      override update(): boolean {
        this.panel.SetSelected(this.optionID);

        return false;
      }
    }

    export class AddOptionAction extends PanelAction<DropDown> {
      option: Panel | (() => Panel);

      constructor(panel: DropDown, option: Panel | (() => Panel)) {
        super(panel);

        this.option = option;
      }

      override update(): boolean {
        const optionPanel = typeof this.option === "function" ? this.option() : this.option;

        this.panel.AddOption(optionPanel);

        return false;
      }
    }

    export class RemoveOptionAction extends PanelAction<DropDown> {
      optionID: string;

      constructor(panel: DropDown, optionID: string) {
        super(panel);

        this.optionID = optionID;
      }

      override update(): boolean {
        this.panel.RemoveOption(this.optionID);

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
      entityName: string;
      inputName: string;
      inputArg: string;

      constructor(panel: ScenePanel, entityName: string, inputName: string, inputArg: string) {
        super(panel);

        this.entityName = entityName;
        this.inputName = inputName;
        this.inputArg = inputArg;
      }

      override update(): boolean {
        this.panel.FireEntityInput(this.entityName, this.inputName, this.inputArg);

        return false;
      }
    }

    abstract class SequenceBase<T extends Action> extends Action {
      constructor(protected action: T) {
        super();
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

      Run(): void {
        RunSingleAction(this.action);
      }

      Action(...actions: Action[]): this {
        this.action.actions.push(...actions);

        return this;
      }

      Noop(): this {
        return this.Action(new NoopAction());
      }

      Function<F extends RunFunction>(fn: F, ...args: Parameters<F>): this {
        return this.Action(new RunFunctionAction(fn, ...args));
      }

      Wait(seconds: number): this {
        return this.Action(new WaitAction(seconds));
      }

      WaitOneFrame(): this {
        return this.Action(new WaitOneFrameAction());
      }

      WaitEvent<T extends Panel>(panel: T, eventName: string): this {
        return this.Action(new WaitEventAction(panel, eventName));
      }

      WaitAction(action: Action, timeoutDuration: number, continueAfterTimeout: boolean): this {
        return this.Action(new WaitActionAction(action, timeoutDuration, continueAfterTimeout));
      }

      Print(...args: unknown[]): this {
        return this.Action(new PrintAction(...args));
      }

      AddClass<T extends Panel>(panel: T, className: string): this {
        return this.Action(new AddClassAction(panel, className));
      }

      RemoveClass<T extends Panel>(panel: T, className: string): this {
        return this.Action(new RemoveClassAction(panel, className));
      }

      SwitchClass<T extends Panel>(panel: T, panelSlot: string, className: string): this {
        return this.Action(new SwitchClassAction(panel, panelSlot, className));
      }

      ReplaceClass<T extends Panel>(panel: T, className: string, replacement: string): this {
        return this.Action(new ReplaceClassAction(panel, className, replacement));
      }

      WaitClass<T extends Panel>(panel: T, className: string): this {
        return this.Action(new WaitClassAction(panel, className));
      }

      DeleteAsync<T extends Panel>(panel: T, delay: number): this {
        return this.Action(new DeleteAsyncAction(panel, delay));
      }

      RemoveChildren<T extends Panel>(panel: T): this {
        return this.Action(new RemoveChildrenAction(panel));
      }

      ScrollToTop<T extends Panel>(panel: T): this {
        return this.Action(new ScrollToTopAction(panel));
      }

      ScrollToBottom<T extends Panel>(panel: T): this {
        return this.Action(new ScrollToBottomAction(panel));
      }

      Enable<T extends Panel>(panel: T): this {
        return this.Action(new EnableAction(panel));
      }

      Disable<T extends Panel>(panel: T): this {
        return this.Action(new DisableAction(panel));
      }

      Focus<T extends Panel>(panel: T): this {
        return this.Action(new FocusAction(panel));
      }

      SetAttribute<T extends Panel, K extends keyof T>(panel: T, attribute: K, value: T[K]): this {
        return this.Action(new SetAttributeAction(panel, attribute, value));
      }

      SetDialogVariable<T extends Panel>(panel: T, dialogVariable: string, value: string): this {
        return this.Action(new SetDialogVariableAction(panel, dialogVariable, value));
      }

      SetDialogVariableInt<T extends Panel>(panel: T, dialogVariable: string, value: number): this {
        return this.Action(new SetDialogVariableIntAction(panel, dialogVariable, value));
      }

      SetDialogVariableTime<T extends Panel>(
        panel: T,
        dialogVariable: string,
        value: number,
      ): this {
        return this.Action(new SetDialogVariableTimeAction(panel, dialogVariable, value));
      }

      AnimateDialogVariableInt<T extends Panel>(
        panel: T,
        dialogVariable: string,
        start: number,
        end: number,
        seconds: number,
      ): this {
        return this.Action(
          new AnimateDialogVariableIntAction(panel, dialogVariable, start, end, seconds),
        );
      }

      SetProgressBarValue(progressBar: ProgressBar, value: number): this {
        return this.Action(new SetProgressBarValueAction(progressBar, value));
      }

      AnimateProgressBar(
        progressBar: ProgressBar,
        startValue: number,
        endValue: number,
        seconds: number,
      ): this {
        return this.Action(
          new AnimateProgressBarAction(progressBar, startValue, endValue, seconds),
        );
      }

      AnimateProgressBarWithMiddle(
        progressBar: ProgressBarWithMiddle,
        startValue: number,
        endValue: number,
        seconds: number,
      ): this {
        return this.Action(
          new AnimateProgressBarWithMiddleAction(progressBar, startValue, endValue, seconds),
        );
      }

      AddOption(panel: DropDown, option: Panel | (() => Panel)): this {
        return this.Action(new AddOptionAction(panel, option));
      }

      RemoveOption(panel: DropDown, optionID: string): this {
        return this.Action(new RemoveOptionAction(panel, optionID));
      }

      RemoveAllOptions(panel: DropDown): this {
        return this.Action(new RemoveAllOptionsAction(panel));
      }

      SelectOption(panel: DropDown, optionID: string): this {
        return this.Action(new SelectOptionAction(panel, optionID));
      }

      PlaySoundEffect(soundName: string): this {
        return this.Action(new PlaySoundEffectAction(soundName));
      }

      FireEntityInput(
        panel: ScenePanel,
        entityName: string,
        inputName: string,
        inputArg: string,
      ): this {
        return this.Action(new FireEntityInputAction(panel, entityName, inputName, inputArg));
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
  }
}
