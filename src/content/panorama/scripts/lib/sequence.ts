import type { Position } from "./panorama";
import { controlPointParam, GameEntityInput, GameCssClass } from "./panorama";

export class StopSequence { }

export abstract class Action {
  protected actions: Action[] = [];

  protected nth(index: number): Action {
    const action = this.actions[index];

    if (action == null) {
      throw new Error(
        `${this.constructor.name}: invalid action index=${index} actions=${this.length}`,
      );
    }

    return action;
  }

  get isEmpty(): boolean {
    return this.length === 0;
  }

  get length(): number {
    return this.actions.length;
  }

  get deepLength(): number {
    return this.actions.reduce((size, action) => size + action.deepLength, 1);
  }

  add(...actions: Action[]): this {
    this.actions.push(...actions);

    return this;
  }

  start(): void {
    return;
  }

  // return `false` to finish the action.
  update(): boolean {
    return false;
  }

  finish(): void {
    return;
  }
}

// runners {{{

abstract class Runner extends Action {
  protected stopped: boolean = false;

  stop(): void {
    this.stopped = true;
  }

  run(): void {
    this.start();
    this.loop();
  }

  loop(): void {
    const tick = () => {
      try {
        if (this.update()) {
          $.Schedule(0.0, tick);
        } else {
          this.finish();
        }
      } catch (err: unknown) {
        // sequence stopped
        if (err instanceof StopSequence) {
          $.Msg("Runner : StopSequence");

          this.stopped = true;

          return this.finish();
        }

        if (err instanceof Error) {
          this.#logError(err);
        }

        throw err;
      }
    };

    tick();
  }

  #logError(err: Error) {
    if (err.stack != null) {
      $.Warning(err.stack);
    }

    if (err.cause instanceof Error) {
      this.#logError(err.cause);
    }
  }
}

class SequenceRunner extends Runner {
  #index = 0;
  #running = false;

  override start(): void {
    this.#index = 0;
    this.#running = false;
  }

  override update(): boolean {
    if (this.stopped) {
      return false;
    }

    while (this.#index < this.length) {
      const action = this.nth(this.#index);

      if (!this.#running) {
        action.start();

        this.#running = true;
      }

      if (action.update()) {
        return true;
      }

      action.finish();

      this.#running = false;
      this.#index++;
    }

    return false;
  }

  override finish(): void {
    if (this.stopped) {
      return;
    }

    while (this.#index < this.length) {
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
}

class ParallelRunner extends Runner {
  #finished: boolean[] = [];

  override start(): void {
    this.#finished = new Array(this.length);

    for (const [i, action] of this.actions.entries()) {
      this.#finished[i] = false;

      action.start();
    }
  }

  override update(): boolean {
    if (this.stopped) {
      return false;
    }

    let anyTicking = false;

    for (const [i, action] of this.actions.entries()) {
      if (!this.#finished[i]) {
        if (action.update()) {
          anyTicking = true;
        } else {
          action.finish();

          this.#finished[i] = true;
        }
      }
    }

    return anyTicking;
  }

  override finish(): void {
    if (this.stopped) {
      return;
    }

    for (const [i, action] of this.actions.entries()) {
      if (!this.#finished[i]) {
        action.finish();

        this.#finished[i] = true;
      }
    }
  }
}

class StaggeredRunner extends Runner {
  #runner: SequenceRunner;
  #wait: number;
  #delay: number;

  constructor(delay: number, wait: number = 0.0) {
    super();

    this.#runner = new SequenceRunner();
    this.#wait = wait;
    this.#delay = delay;
  }

  override start(): void {
    if (this.#wait > 0) {
      this.#runner.add(new WaitAction(this.#wait));
    }

    const staggered = new ParallelRunner();

    for (const [i, action] of this.actions.entries()) {
      const delay = i * this.#delay;

      if (delay > 0) {
        const seq = new SequenceRunner();

        seq.add(new WaitAction(delay));
        seq.add(action);

        staggered.add(seq);
      } else {
        staggered.add(action);
      }
    }

    this.#runner.add(staggered);
    this.#runner.start();
  }

  override stop(): void {
    this.#runner.stop();
  }

  override update(): boolean {
    return this.#runner.update();
  }

  override finish(): void {
    this.#runner.finish();
  }
}

class ParallelAnyRunner extends Runner {
  #finished: boolean[] = [];

  override start(): void {
    this.#finished = new Array(this.length);

    for (const [i, action] of this.actions.entries()) {
      this.#finished[i] = false;

      action.start();
    }
  }

  override update(): boolean {
    if (this.stopped || this.isEmpty) {
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
    if (this.stopped) {
      return;
    }

    for (const [i, action] of this.actions.entries()) {
      if (!this.#finished[i]) {
        action.finish();
      }
    }
  }
}

export type ConditionalPredicate = () => boolean;

class ConditionalRunner<T extends Runner> extends Runner {
  #inner: T;
  #predicate: ConditionalPredicate;

  constructor(inner: T, predicate: ConditionalPredicate) {
    super();

    this.#inner = inner;
    this.#predicate = predicate;
  }

  override get isEmpty(): boolean {
    return this.#inner.isEmpty;
  }

  override get length(): number {
    return this.#inner.length;
  }

  override get deepLength(): number {
    return this.#inner.deepLength;
  }

  override add(...actions: Action[]): this {
    this.#inner.add(...actions);

    return this;
  }

  override start(): void {
    this.#inner.start();
  }

  override stop(): void {
    this.#inner.stop();
  }

  override update(): boolean {
    if (!this.#predicate()) {
      $.Msg("ConditionalRunner : stop");

      this.#inner.stop();
    }

    return this.#inner.update();
  }

  override finish(): void {
    this.#inner.finish();
  }
}

// runners }}}
// actions {{{

export class NoopAction extends Action {
  override update(): boolean {
    return false;
  }
}

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

export class WaitActionAction extends Action {
  #action: Action;
  #timeout: number;
  #runner: ParallelAnyRunner;

  constructor(action: Action, timeout: number) {
    super();

    this.#action = action;
    this.#timeout = timeout;
    this.#runner = new ParallelAnyRunner();
  }

  override start(): void {
    this.#runner.add(new WaitAction(this.#timeout));
    this.#runner.add(this.#action);
    this.#runner.start();
  }

  override update(): boolean {
    return this.#runner.update();
  }

  override finish(): void {
    this.#runner.finish();
  }
}

class PanelAction<T extends Panel> extends Action {
  protected panel: T;

  constructor(panel: T) {
    super();

    this.panel = panel;
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

export enum DialogVariableType {
  String,
  LocString,
  PluralLocString,
  Integer,
  Time,
}

interface DialogVariableArgs {
  [DialogVariableType.String]: [string];
  [DialogVariableType.LocString]: [string];
  [DialogVariableType.PluralLocString]: [string, number];
  [DialogVariableType.Integer]: [number];
  [DialogVariableType.Time]: [number];
}

interface DialogVariableString {
  args: DialogVariableArgs[DialogVariableType.String];
}

interface DialogVariableLocString {
  args: DialogVariableArgs[DialogVariableType.LocString];
}

interface DialogVariablePluralLocString {
  args: DialogVariableArgs[DialogVariableType.PluralLocString];
}

interface DialogVariableInteger {
  args: DialogVariableArgs[DialogVariableType.Integer];
}

interface DialogVariableTime {
  args: DialogVariableArgs[DialogVariableType.Time];
}

export class SetDialogVariableAction<
  P extends Panel,
  T extends DialogVariableType,
> extends PanelAction<P> {
  type: DialogVariableType;
  name: string;
  args: DialogVariableArgs[T];

  constructor(panel: P, type: T, name: string, ...args: DialogVariableArgs[T]) {
    super(panel);

    this.type = type;
    this.name = name;
    this.args = args;
  }

  #isString(): this is DialogVariableString {
    return this.type === DialogVariableType.String;
  }

  #isLocString(): this is DialogVariableLocString {
    return this.type === DialogVariableType.LocString;
  }

  #isPluralLocString(): this is DialogVariablePluralLocString {
    return this.type === DialogVariableType.PluralLocString;
  }

  #isInteger(): this is DialogVariableInteger {
    return this.type === DialogVariableType.Integer;
  }

  #isTime(): this is DialogVariableTime {
    return this.type === DialogVariableType.Time;
  }

  override update(): boolean {
    if (this.#isString()) {
      this.panel.SetDialogVariable(this.name, this.args[0]);
    } else if (this.#isLocString()) {
      this.panel.SetDialogVariableLocString(this.name, this.args[0]);
    } else if (this.#isPluralLocString()) {
      this.panel.SetDialogVariablePluralLocStringInt(this.name, this.args[0], this.args[1]);
    } else if (this.#isInteger()) {
      this.panel.SetDialogVariableInt(this.name, this.args[0]);
    } else if (this.#isTime()) {
      this.panel.SetDialogVariableTime(this.name, this.args[0]);
    } else {
      throw new Error(`invalid dialog variable type ${this.type}`);
    }

    return false;
  }
}

export class SetDialogVariableStringAction<T extends Panel> extends SetDialogVariableAction<
  T,
  DialogVariableType.String
> {
  constructor(panel: T, name: string, value: string) {
    super(panel, DialogVariableType.String, name, value);
  }
}

export class SetDialogVariableLocStringAction<T extends Panel> extends SetDialogVariableAction<
  T,
  DialogVariableType.LocString
> {
  constructor(panel: T, name: string, key: string) {
    super(panel, DialogVariableType.LocString, name, key);
  }
}

export class SetDialogVariablePluralLocStringAction<
  T extends Panel,
> extends SetDialogVariableAction<T, DialogVariableType.PluralLocString> {
  constructor(panel: T, name: string, key: string, count: number) {
    super(panel, DialogVariableType.PluralLocString, name, key, count);
  }
}

export class SetDialogVariableIntegerAction<T extends Panel> extends SetDialogVariableAction<
  T,
  DialogVariableType.Integer
> {
  constructor(panel: T, name: string, value: number) {
    super(panel, DialogVariableType.Integer, name, value);
  }
}

export class SetDialogVariableTimeAction<T extends Panel> extends SetDialogVariableAction<
  T,
  DialogVariableType.Time
> {
  constructor(panel: T, name: string, value: number) {
    super(panel, DialogVariableType.Time, name, value);
  }
}

export class AnimateDialogVariableIntegerAction<T extends Panel> extends PanelAction<T> {
  #name: string;
  #startValue: number;
  #endValue: number;
  #duration: number;
  #startTimestamp = 0;
  #endTimestamp = 0;

  constructor(panel: T, name: string, startValue: number, endValue: number, duration: number) {
    super(panel);

    this.#name = name;
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
      this.#name,
      this.#startValue + (this.#endValue - this.#startValue) * ratio,
    );

    return true;
  }

  override finish(): void {
    this.panel.SetDialogVariableInt(this.#name, this.#endValue);
  }
}

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

export class EmitSoundAction extends Action {
  #soundName: string;
  #callback: ((id: number) => void) | undefined;

  constructor(soundName: string, callback?: (id: number) => void) {
    super();

    this.#soundName = soundName;
    this.#callback = callback;
  }

  override update(): boolean {
    const id = Game.EmitSound(this.#soundName);

    if (this.#callback) {
      this.#callback(id);
    }

    return false;
  }
}

export class StopSoundAction extends Action {
  #soundHandle: number;

  constructor(soundHandle: number) {
    super();

    this.#soundHandle = soundHandle;
  }

  override update(): boolean {
    Game.StopSound(this.#soundHandle);

    return false;
  }
}

// actions }}}
// sequences {{{

abstract class SequenceBase<T extends Runner> extends Runner {
  #inner: T;

  constructor(runner: T) {
    super();

    this.#inner = runner;
  }

  // ----- Runner API -----

  override get isEmpty(): boolean {
    return this.#inner.isEmpty;
  }

  override get length(): number {
    return this.#inner.length;
  }

  override get deepLength(): number {
    return this.#inner.deepLength;
  }

  override add(...actions: Action[]): this {
    this.#inner.add(...actions);

    return this;
  }

  override start(): void {
    this.#inner.start();
  }

  override stop(): void {
    this.#inner.stop();
  }

  override update(): boolean {
    return this.#inner.update();
  }

  override finish(): void {
    this.#inner.finish();
  }

  // ----- actions -----

  tap(tapFn: (seq: this) => void): this {
    tapFn(this);

    return this;
  }

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

  waitAction(action: Action, timeout: number): this {
    return this.add(new WaitActionAction(action, timeout));
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

  waitEvent<T extends Panel>(panel: T, eventName: string): this {
    return this.add(new WaitEventAction(panel, eventName));
  }

  waitClass<T extends Panel>(panel: T, cssClass: string): this {
    return this.add(new WaitClassAction(panel, cssClass));
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

  removeChildren<T extends Panel>(panel: T): this {
    return this.add(new RemoveChildrenAction(panel));
  }

  deleteAsync<T extends Panel>(panel: T, delay: number): this {
    return this.add(new DeleteAsyncAction(panel, delay));
  }

  scrollToTop<T extends Panel>(panel: T): this {
    return this.add(new ScrollToTopAction(panel));
  }

  scrollToBottom<T extends Panel>(panel: T): this {
    return this.add(new ScrollToBottomAction(panel));
  }

  setAttribute<T extends Panel, K extends keyof T>(panel: T, attribute: K, value: T[K]): this {
    return this.add(new SetAttributeAction(panel, attribute, value));
  }

  setDialogVariable<T extends Panel>(
    panel: T,
    type: DialogVariableType,
    name: string,
    ...args: DialogVariableArgs[typeof type]
  ): this {
    return this.add(new SetDialogVariableAction(panel, type, name, ...args));
  }

  setDialogVariableString<T extends Panel>(panel: T, name: string, value: string): this {
    return this.add(new SetDialogVariableStringAction(panel, name, value));
  }

  setDialogVariableLocString<T extends Panel>(panel: T, name: string, key: string): this {
    return this.add(new SetDialogVariableLocStringAction(panel, name, key));
  }

  setDialogVariablePluralLocString<T extends Panel>(
    panel: T,
    name: string,
    key: string,
    count: number,
  ): this {
    return this.add(new SetDialogVariablePluralLocStringAction(panel, name, key, count));
  }

  setDialogVariableInteger<T extends Panel>(panel: T, name: string, value: number): this {
    return this.add(new SetDialogVariableIntegerAction(panel, name, value));
  }

  setDialogVariableTime<T extends Panel>(panel: T, name: string, value: number): this {
    return this.add(new SetDialogVariableTimeAction(panel, name, value));
  }

  animateDialogVariableInteger<T extends Panel>(
    panel: T,
    name: string,
    start: number,
    end: number,
    duration: number,
  ): this {
    return this.add(new AnimateDialogVariableIntegerAction(panel, name, start, end, duration));
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

  emitSound(soundName: string, callback?: (id: number) => void): this {
    return this.add(new EmitSoundAction(soundName, callback));
  }

  stopSound(soundHandle: number): this {
    return this.add(new StopSoundAction(soundHandle));
  }

  playSoundEffect(soundName: string): this {
    return this.add(new PlaySoundEffectAction(soundName));
  }

  waitSceneLoad(panel: ScenePanel): this {
    return this.waitClass(panel, GameCssClass.ScenePanelLoaded);
  }

  fireEntityInput(
    panel: ScenePanel,
    entityName: string,
    inputName: string,
    inputArg: string,
  ): this {
    return this.add(new FireEntityInputAction(panel, entityName, inputName, inputArg));
  }

  startEntity(panel: ScenePanel, entityName: string): this {
    return this.fireEntityInput(panel, entityName, GameEntityInput.Start, "");
  }

  stopEntityEndcap(panel: ScenePanel, entityName: string): this {
    return this.fireEntityInput(panel, entityName, GameEntityInput.StopEndcap, "");
  }

  setEntityAnimation(panel: ScenePanel, entityName: string, animation: string): this {
    return this.fireEntityInput(panel, entityName, GameEntityInput.SetAnimation, animation);
  }

  setEntityControlPoint(
    panel: ScenePanel,
    entityName: string,
    index: number,
    pos: Position
  ): this {
    return this.fireEntityInput(
      panel,
      entityName,
      GameEntityInput.SetControlPoint,
      controlPointParam(index, pos),
    );
  }

  // ----- nested sequences -----

  seq(fn: (seq: Sequence) => void): this {
    const seq = new Sequence();

    fn(seq);

    this.add(seq);

    return this;
  }

  seqAfter(wait: number, fn: (seq: Sequence) => void): this {
    return this.seq((seq) => {
      seq.wait(wait);
      fn(seq);
    });
  }

  seqWhile(
    predicate: ConditionalPredicate,
    fn: ((seq: ConditionalSequence) => void)
  ): this {
    const seq = new ConditionalSequence(predicate);

    fn(seq);

    this.add(seq);

    return this;
  }

  parallel(
    fn: ((seq: ParallelSequence) => void)
  ): this {
    const seq = new ParallelSequence();

    fn(seq);

    this.add(seq);

    return this;
  }

  parallelAfter(wait: number, fn: (seq: ParallelSequence) => void): this {
    return this.seqAfter(wait, (seq) => { seq.parallel(fn) });
  }

  parallelWhile(
    predicate: ConditionalPredicate,
    fn: ((seq: ConditionalParallelSequence) => void)
  ): this {
    const seq = new ConditionalParallelSequence(predicate);

    fn(seq);

    this.add(seq);

    return this;
  }

  parallelAny(fn: ((seq: ParallelAnySequence) => void)): this {
    const seq = new ParallelAnySequence();

    fn(seq);

    this.add(seq);

    return this;
  }

  parallelAnyWhile(
    predicate: ConditionalPredicate,
    fn: ((seq: ConditionalParallelAnySequence) => void)
  ): this {
    const seq = new ConditionalParallelAnySequence(predicate);

    fn(seq);

    this.add(seq);

    return this;
  }

  stagger(delay: number, wait: number, fn: ((seq: StaggeredSequence) => void)): this {
    const seq = new StaggeredSequence(delay, wait);

    fn(seq);

    this.add(seq);

    return this;
  }

  staggerNow(delay: number, fn: ((seq: StaggeredSequence) => void)): this {
    const seq = new StaggeredSequence(delay);

    fn(seq);

    this.add(seq);

    return this;
  }
}

export class Sequence extends SequenceBase<SequenceRunner> {
  constructor() {
    super(new SequenceRunner());
  }
}

export class ConditionalSequence extends SequenceBase<ConditionalRunner<SequenceRunner>> {
  constructor(predicate: ConditionalPredicate) {
    super(new ConditionalRunner(new SequenceRunner(), predicate));
  }
}

export class ParallelSequence extends SequenceBase<ParallelRunner> {
  constructor() {
    super(new ParallelRunner());
  }
}

export class ConditionalParallelSequence extends SequenceBase<ConditionalRunner<ParallelRunner>> {
  constructor(predicate: ConditionalPredicate) {
    super(new ConditionalRunner(new ParallelRunner(), predicate));
  }
}

export class ParallelAnySequence extends SequenceBase<ParallelAnyRunner> {
  constructor() {
    super(new ParallelAnyRunner());
  }
}

export class ConditionalParallelAnySequence extends SequenceBase<ConditionalRunner<ParallelAnyRunner>> {
  constructor(predicate: ConditionalPredicate) {
    super(new ConditionalRunner(new ParallelAnyRunner(), predicate));
  }
}

export class StaggeredSequence extends SequenceBase<StaggeredRunner> {
  constructor(delay: number, wait: number = 0.0) {
    super(new StaggeredRunner(delay, wait));
  }
}

export class ConditionalStaggeredSequence extends SequenceBase<ConditionalRunner<StaggeredRunner>> {
  constructor(delay: number, wait: number, predicate: ConditionalPredicate) {
    super(new ConditionalRunner(new StaggeredRunner(delay, wait), predicate));
  }
}

// sequences }}}
