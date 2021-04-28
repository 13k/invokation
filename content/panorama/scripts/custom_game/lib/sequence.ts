import { omitBy, reduce } from "lodash";
import type {
  AbilityImageOwnWritable,
  HeroImageOwnWritable,
  ItemImageOwnWritable,
  PanelWithText,
  ProgressBarOwnWritable,
} from "./const/panorama";
import type { UIPanelEvent } from "./const/ui_events";
import { ENV } from "./env";
import { UIEvents } from "./ui_events";

//-------------------------------------------------------------------------------
// Helpers
//-------------------------------------------------------------------------------

function runAction(action: Action): void {
  action.start();

  updateAction(action);
}

function updateAction(action: Action): void {
  const callback = function () {
    if (!action.update()) {
      action.finish();
    } else {
      $.Schedule(0.0, callback);
    }
  };

  callback();
}

type LerpGenerator = Generator<number, void, never>;

function* lerp(duration: number, time: TimeFn): LerpGenerator {
  const startTime = time();
  const endTime = startTime + duration;

  while (true) {
    const now = time();

    if (now >= endTime) {
      return;
    }

    const ratio = (now - startTime) / (endTime - startTime);

    yield ratio;
  }
}

function* linearAnimation(
  start: number,
  end: number,
  duration: number,
  time: TimeFn
): AnimationGenerator {
  const lerpGen = lerp(duration, time);

  while (true) {
    const it = lerpGen.next();

    if (it.done || it.value == null) {
      return;
    }

    const value = start + (end - start) * it.value;

    yield value;
  }
}

export type TimeFn = () => number;
export type AnimationGenerator = Generator<number, void, never>;
export type AnimationFn = (
  start: number,
  end: number,
  duration: number,
  time: TimeFn
) => AnimationGenerator;

//-------------------------------------------------------------------------------
// Exceptions
//-------------------------------------------------------------------------------

export class StopSequence extends Error {}

//-------------------------------------------------------------------------------
// Base actions
//-------------------------------------------------------------------------------

/**
 * Action is a routine that will tick per-frame until it's done.
 */
export abstract class Action {
  started: boolean;
  finished: boolean;

  constructor() {
    this.started = false;
    this.finished = false;
  }

  /** The start function is called before the action starts executing. */
  start(): void {
    this.started = true;
  }

  /** The update function is called once per frame until it returns `false` signalling that the
   * action is done. */
  abstract update(): boolean;

  /** After the update function is complete, the finish function is called. */
  finish(): void {
    this.finished = true;
  }
}

export abstract class PanelAction<T extends Panel> extends Action {
  constructor(public panel: T) {
    super();
  }
}

export abstract class PanelClassAction<T extends Panel> extends PanelAction<T> {
  constructor(panel: T, public className: string) {
    super(panel);
  }

  add(): void {
    this.panel.AddClass(this.className);
  }

  remove(): void {
    this.panel.RemoveClass(this.className);
  }

  toggle(): void {
    this.panel.ToggleClass(this.className);
  }

  trigger(): void {
    this.panel.TriggerClass(this.className);
  }

  switch(replacement: string): void {
    this.panel.SwitchClass(this.className, replacement);
  }

  get isPresent(): boolean {
    return this.panel.BHasClass(this.className);
  }
}

export abstract class PanelAttributeAction<T extends Panel> extends PanelAction<T> {
  constructor(panel: T, public attribute: string) {
    super(panel);
  }

  setStr(value: string): void {
    this.panel.SetAttributeString(this.attribute, value);
  }

  setInt(value: number): void {
    this.panel.SetAttributeInt(this.attribute, value);
  }

  setUInt32(value: number): void {
    this.panel.SetAttributeUInt32(this.attribute, value);
  }
}

export abstract class PanelDialogVarAction<T extends Panel> extends PanelAction<T> {
  constructor(panel: T, public variable: string) {
    super(panel);
  }

  setStr(value: string): void {
    this.panel.SetDialogVariable(this.variable, value);
  }

  setInt(value: number): void {
    this.panel.SetDialogVariableInt(this.variable, value);
  }

  setTime(value: number): void {
    this.panel.SetDialogVariableTime(this.variable, value);
  }

  setL10n(value: string): void {
    this.panel.SetDialogVariableLocString(this.variable, value);
  }

  setL10nPlural(value: string, count: number): void {
    this.panel.SetDialogVariablePluralLocStringInt(this.variable, value, count);
  }
}

//-------------------------------------------------------------------------------
// Basic actions
//-------------------------------------------------------------------------------

export class NoopAction extends Action {
  update(): boolean {
    return false;
  }
}

export class StopSequenceAction extends Action {
  constructor(public reason: string) {
    super();
  }

  update(): boolean {
    throw new StopSequence(this.reason);
  }
}

export class PrintAction extends Action {
  args: unknown[];

  constructor(...args: unknown[]) {
    super();

    this.args = args;
  }

  update(): boolean {
    $.Msg(...this.args);

    return false;
  }
}

export class WarningAction extends Action {
  args: unknown[];

  constructor(...args: unknown[]) {
    super();

    this.args = args;
  }

  update(): boolean {
    $.Warning(...this.args);

    return false;
  }
}

export class WaitAction extends Action {
  endTime: number;

  constructor(public duration: number) {
    super();

    this.endTime = 0;
  }

  start(): void {
    super.start();

    this.endTime = Game.Time() + this.duration;
  }

  update(): boolean {
    return Game.Time() < this.endTime;
  }
}

export class WaitOneFrameAction extends Action {
  updated: boolean;

  constructor() {
    super();

    this.updated = false;
  }

  update(): boolean {
    if (this.updated) {
      return false;
    }

    this.updated = true;

    return true;
  }
}

export class WaitConditionAction<T extends (...args: unknown[]) => boolean> extends Action {
  args: Parameters<T>;

  constructor(public predicate: T, ...args: Parameters<T>) {
    super();

    this.args = args;
  }

  update(): boolean {
    return !this.predicate(...this.args);
  }
}

export class WaitActionAction extends Action {
  seq: Sequence;

  constructor(public action: Action, public timeout: number, public ignoreTimeout: boolean) {
    super();

    this.seq = new ParallelAnySequence({ runAll: this.ignoreTimeout });
  }

  start(): void {
    super.start();

    this.seq.Action(this.action).Wait(this.timeout).start();
  }

  update(): boolean {
    return this.seq.update();
  }

  finish(): void {
    this.seq.finish();
    super.finish();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RunFunctionAction<T extends (...args: any[]) => Action | void> extends Action {
  args: Parameters<T>;

  constructor(public fn: T, ...args: Parameters<T>) {
    super();

    this.args = args;
  }

  update(): boolean {
    const ret = this.fn(...this.args);

    if (ret instanceof Action) {
      runAction(ret);
    }

    return false;
  }
}

export class PlaySoundEffectAction extends Action {
  constructor(public soundEvent: string) {
    super();
  }

  update(): boolean {
    UIEvents.playSound(this.soundEvent);

    return false;
  }
}

//-------------------------------------------------------------------------------
// Panel actions
//-------------------------------------------------------------------------------

export class WaitEventAction<T extends Panel> extends PanelAction<T> {
  receivedEvent: boolean;

  constructor(panel: T, public event: UIPanelEvent) {
    super(panel);

    this.receivedEvent = false;
  }

  start(): void {
    super.start();

    this.receivedEvent = false;

    UIEvents.listen(this.panel, this.event, () => {
      this.receivedEvent = true;
    });
  }

  update(): boolean {
    return !this.receivedEvent;
  }
}

export class FocusAction<T extends Panel> extends PanelAction<T> {
  update(): boolean {
    this.panel.SetFocus();

    return false;
  }
}

export class ScrollToTopAction<T extends Panel> extends PanelAction<T> {
  update(): boolean {
    this.panel.ScrollToTop();

    return false;
  }
}

export class ScrollToBottomAction<T extends Panel> extends PanelAction<T> {
  update(): boolean {
    this.panel.ScrollToBottom();

    return false;
  }
}

export class DeleteAsyncAction<T extends Panel> extends PanelAction<T> {
  constructor(panel: T, public delay: number) {
    super(panel);
  }

  update(): boolean {
    this.panel.DeleteAsync(this.delay);

    return false;
  }
}

export class RemoveChildrenAction<T extends Panel> extends PanelAction<T> {
  update(): boolean {
    this.panel.RemoveAndDeleteChildren();

    return false;
  }
}

//-------------------------------------------------------------------------------
// Panel class actions
//-------------------------------------------------------------------------------

export class AddClassAction<T extends Panel> extends PanelClassAction<T> {
  update(): boolean {
    this.add();

    return false;
  }
}

export class RemoveClassAction<T extends Panel> extends PanelClassAction<T> {
  update(): boolean {
    this.remove();

    return false;
  }
}

export class ToggleClassAction<T extends Panel> extends PanelClassAction<T> {
  update(): boolean {
    this.toggle();

    return false;
  }
}

export class TriggerClassAction<T extends Panel> extends PanelClassAction<T> {
  update(): boolean {
    this.trigger();

    return false;
  }
}

export class SwitchClassAction<T extends Panel> extends PanelClassAction<T> {
  constructor(panel: T, className: string, public replacement: string) {
    super(panel, className);
  }

  update(): boolean {
    this.switch(this.replacement);

    return false;
  }
}

export class WaitClassAction<T extends Panel> extends PanelClassAction<T> {
  update(): boolean {
    return !this.isPresent;
  }
}

//-------------------------------------------------------------------------------
// Panel property actions
//-------------------------------------------------------------------------------

export class SetPropertyAction<T, K extends keyof T> extends Action {
  constructor(public panel: { [Key in K]: T[K] }, public property: K, public value: T[K]) {
    super();
  }

  update(): boolean {
    this.panel[this.property] = this.value;

    return false;
  }
}

export class SetPropertiesAction<T> extends Action {
  constructor(public panel: Writable<T>, public properties: Partial<Writable<T>>) {
    super();

    this.properties = omitBy<Partial<Writable<T>>>(properties, (value) => value == null);
  }

  update(): boolean {
    Object.assign(this.panel, this.properties);

    return false;
  }
}

export class ShowAction<T extends { visible: boolean }> extends SetPropertyAction<T, "visible"> {
  constructor(panel: Panel) {
    super(panel, "visible", true);
  }
}

export class HideAction<T extends { visible: boolean }> extends SetPropertyAction<T, "visible"> {
  constructor(panel: Panel) {
    super(panel, "visible", false);
  }
}

export class EnableAction<T extends { enabled: boolean }> extends SetPropertyAction<T, "enabled"> {
  constructor(panel: Panel) {
    super(panel, "enabled", true);
  }
}

export class DisableAction<T extends { enabled: boolean }> extends SetPropertyAction<T, "enabled"> {
  constructor(panel: Panel) {
    super(panel, "enabled", false);
  }
}

export class CheckAction<T extends { checked: boolean }> extends SetPropertyAction<T, "checked"> {
  constructor(panel: Panel) {
    super(panel, "checked", true);
  }
}

export class UncheckAction<T extends { checked: boolean }> extends SetPropertyAction<T, "checked"> {
  constructor(panel: T) {
    super(panel, "checked", false);
  }
}

export class SetTextAction<T extends { text: string }> extends SetPropertyAction<T, "text"> {
  constructor(panel: T, value: string) {
    super(panel, "text", value);
  }
}

export class AnimateNumericPropertyAction<T, K extends keyof T> extends Action {
  gen?: AnimationGenerator;

  constructor(
    public panel: IsNumericProperty<T, K>,
    public property: K,
    public startValue: number,
    public endValue: number,
    public duration: number,
    public timeFn: TimeFn = Game.Time,
    public animFn: AnimationFn = linearAnimation
  ) {
    super();
  }

  start(): void {
    super.start();

    this.gen = this.animFn(this.startValue, this.endValue, this.duration, this.timeFn);
  }

  update(): boolean {
    if (this.gen == null) {
      throw Error(
        `Tried to update() an ${this.constructor.name} action with null animation generator`
      );
    }

    const { value, done } = this.gen.next();

    if (done || value == null) {
      return false;
    }

    this.panel[this.property] = value;

    return true;
  }

  finish(): void {
    this.panel[this.property] = this.endValue;

    super.finish();
  }
}

//-------------------------------------------------------------------------------
// Panel attribute actions
//-------------------------------------------------------------------------------

export class SetAttributeAction<T extends Panel> extends PanelAttributeAction<T> {
  constructor(panel: T, attribute: string, public value: string) {
    super(panel, attribute);
  }

  update(): boolean {
    this.setStr(this.value);

    return false;
  }
}

export class SetAttributeIntAction<T extends Panel> extends PanelAttributeAction<T> {
  constructor(panel: T, attribute: string, public value: number) {
    super(panel, attribute);
  }

  update(): boolean {
    this.setInt(this.value);

    return false;
  }
}

export class SetAttributeUInt32Action<T extends Panel> extends PanelAttributeAction<T> {
  constructor(panel: T, attribute: string, public value: number) {
    super(panel, attribute);
  }

  update(): boolean {
    this.setUInt32(this.value);

    return false;
  }
}

//-------------------------------------------------------------------------------
// Panel dialog variable actions
//-------------------------------------------------------------------------------

export class SetDialogVariableAction<T extends Panel> extends PanelDialogVarAction<T> {
  constructor(panel: T, variable: string, public value: string) {
    super(panel, variable);
  }

  update(): boolean {
    this.setStr(this.value);

    return false;
  }
}

export class SetDialogVariableIntAction<T extends Panel> extends PanelDialogVarAction<T> {
  constructor(panel: T, variable: string, public value: number) {
    super(panel, variable);
  }

  update(): boolean {
    this.setInt(this.value);

    return false;
  }
}

export class SetDialogVariableTimeAction<T extends Panel> extends PanelDialogVarAction<T> {
  constructor(panel: T, variable: string, public value: number) {
    super(panel, variable);
  }

  update(): boolean {
    this.setTime(this.value);

    return false;
  }
}

export class SetDialogVariableL10nAction<T extends Panel> extends PanelDialogVarAction<T> {
  constructor(panel: T, variable: string, public value: string, public count?: number) {
    super(panel, variable);
  }

  update(): boolean {
    if (this.count != null) {
      this.setL10nPlural(this.value, this.count);
    } else {
      this.setL10n(this.value);
    }

    return false;
  }
}

export class AnimateDialogVariableIntAction<T extends Panel> extends PanelDialogVarAction<T> {
  gen?: AnimationGenerator;

  constructor(
    panel: T,
    variable: string,
    public startValue: number,
    public endValue: number,
    public duration: number,
    public timeFn: TimeFn = Game.Time,
    public animFn: AnimationFn = linearAnimation
  ) {
    super(panel, variable);
  }

  start(): void {
    super.start();

    this.gen = this.animFn(this.startValue, this.endValue, this.duration, this.timeFn);
  }

  update(): boolean {
    if (this.gen == null) {
      throw Error(
        `Tried to update() an ${this.constructor.name} action with null animation generator`
      );
    }

    const { value, done } = this.gen.next();

    if (done || value == null) {
      return false;
    }

    this.setInt(Math.floor(value));

    return true;
  }

  finish(): void {
    this.setInt(this.endValue);
    super.finish();
  }
}

//-------------------------------------------------------------------------------
// ImagePanel actions
//-------------------------------------------------------------------------------

export class SetImageAction<T extends ImagePanel> extends PanelAction<T> {
  constructor(panel: T, public value: string) {
    super(panel);
  }

  update(): boolean {
    this.panel.SetImage(this.value);

    return false;
  }
}

export class SetScalingAction<T extends ImagePanel> extends PanelAction<T> {
  constructor(panel: T, public value: ScalingFunction) {
    super(panel);
  }

  update(): boolean {
    this.panel.SetScaling(this.value);

    return false;
  }
}

export class SetAbilityImageAction extends SetPropertiesAction<AbilityImage> {
  constructor(panel: Writable<AbilityImage>, { abilityname }: Partial<AbilityImageOwnWritable>) {
    super(panel, { abilityname });
  }
}

export class SetItemImageAction extends SetPropertiesAction<ItemImage> {
  constructor(panel: Writable<ItemImage>, { itemname }: Partial<ItemImageOwnWritable>) {
    super(panel, { itemname });
  }
}

export class SetHeroImageAction extends SetPropertiesAction<HeroImage> {
  constructor(
    panel: Writable<HeroImage>,
    { heroid, heroname, heroimagestyle }: Partial<HeroImageOwnWritable>
  ) {
    super(panel, { heroid, heroname, heroimagestyle });
  }
}

export class SetEconItemAction<T extends EconItemPanel> extends PanelAction<T> {
  id: number;
  style?: number;

  constructor(panel: T, { id, style }: { id: number; style?: number }) {
    super(panel);

    this.id = id;
    this.style = style;
  }

  update(): boolean {
    if (this.style) {
      this.panel.SetItemByDefinitionAndStyle(this.id, this.style);
    } else {
      this.panel.SetItemByDefinition(this.id);
    }

    return false;
  }
}

//-------------------------------------------------------------------------------
// DropDown actions
//-------------------------------------------------------------------------------

export class SelectOptionAction<T extends DropDown> extends PanelAction<T> {
  constructor(panel: T, public optionID: string) {
    super(panel);
  }

  update(): boolean {
    this.panel.SetSelected(this.optionID);

    return false;
  }
}

export class AddOptionAction<T extends DropDown> extends PanelAction<T> {
  constructor(panel: T, public option: Panel | (() => Panel)) {
    super(panel);
  }

  update(): boolean {
    const optionPanel = typeof this.option === "function" ? this.option() : this.option;

    this.panel.AddOption(optionPanel);

    return false;
  }
}

export class RemoveOptionAction<T extends DropDown> extends PanelAction<T> {
  constructor(panel: T, public optionID: string) {
    super(panel);
  }

  update(): boolean {
    this.panel.RemoveOption(this.optionID);

    return false;
  }
}

export class RemoveAllOptionsAction<T extends DropDown> extends PanelAction<T> {
  update(): boolean {
    this.panel.RemoveAllOptions();

    return false;
  }
}

//-------------------------------------------------------------------------------
// ProgressBar actions
//-------------------------------------------------------------------------------

export class SetProgressBarAction extends SetPropertiesAction<ProgressBar> {
  constructor(panel: Writable<ProgressBar>, { value, min, max }: Partial<ProgressBarOwnWritable>) {
    super(panel, { value, min, max });
  }
}

export class AnimateProgressBarAction extends AnimateNumericPropertyAction<ProgressBar, "value"> {
  constructor(panel: ProgressBar, start: number, end: number, duration: number) {
    super(panel, "value", start, end, duration);
  }
}

export class AnimateProgressBarWithMiddleAction extends AnimateNumericPropertyAction<
  ProgressBarWithMiddle,
  "uppervalue"
> {
  constructor(panel: ProgressBarWithMiddle, start: number, end: number, duration: number) {
    super(panel, "uppervalue", start, end, duration);
  }
}

//-------------------------------------------------------------------------------
// ScenePanel actions
//-------------------------------------------------------------------------------

export class FireEntityInputAction<T extends ScenePanel> extends PanelAction<T> {
  constructor(panel: T, public entityID: string, public inputName: string, public value: string) {
    super(panel);
  }

  update(): boolean {
    this.panel.FireEntityInput(this.entityID, this.inputName, this.value);

    return false;
  }
}

//-------------------------------------------------------------------------------
// Sequences
//-------------------------------------------------------------------------------

const isSequence = (object: unknown): object is Sequence => object instanceof Sequence;
const actionDeepLength = (action: Action) => (isSequence(action) ? action.deepLength : 1);

/** Base sequence class. */
export abstract class Sequence extends Action {
  actions: Action[];
  interrupted: boolean;

  /**
   * Creates a new sequence.
   */
  constructor() {
    super();

    this.actions = [];
    this.started = false;
    this.interrupted = false;
    this.finished = false;
  }

  get length(): number {
    return this.actions.length;
  }

  get deepLength(): number {
    return reduce(this.actions, (sum, action) => sum + actionDeepLength(action), 0);
  }

  get isEmpty(): boolean {
    return this.length === 0;
  }

  append(...actions: Action[]): this {
    this.actions = this.actions.concat(actions);

    return this;
  }

  /** Child classes should override this method. */
  abstract _start(): void;
  /** Child classes should override this method. */
  abstract _update(): boolean;
  /** Child classes should override this method. */
  abstract _finish(): void;

  start(): void {
    super.start();

    this._start();
  }

  update(): boolean {
    if (this.isEmpty) {
      return false;
    }

    try {
      return this._update();
    } catch (err) {
      if (err instanceof StopSequence) {
        if (ENV.development) {
          $.Warning(`StopSequence ${err.message}`);
        }

        this.interrupted = true;

        return false;
      }

      throw err;
    }
  }

  finish(): void {
    if (this.finished) {
      return;
    }

    if (this.interrupted) {
      super.finish();
      return;
    }

    this._finish();
    super.finish();
  }

  run(): void {
    try {
      runAction(this);
    } catch (err) {
      if (err.stack) {
        $.Warning(err.stack);
      }

      throw err;
    }
  }

  Action(...actions: Action[]): this {
    return this.append(...actions);
  }

  Noop(): this {
    return this.Action(new NoopAction());
  }

  StopSequence(reason: string): this {
    return this.Action(new StopSequenceAction(reason));
  }

  Print(...args: unknown[]): this {
    return this.Action(new PrintAction(...args));
  }

  Warn(...args: unknown[]): this {
    return this.Action(new WarningAction(...args));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RunFunction<T extends (...args: any[]) => Action | void>(fn: T, ...args: Parameters<T>): this {
    return this.Action(new RunFunctionAction(fn, ...args));
  }

  Wait(duration: number): this {
    return this.Action(new WaitAction(duration));
  }

  WaitOneFrame(): this {
    return this.Action(new WaitOneFrameAction());
  }

  WaitCondition<T extends (...args: unknown[]) => boolean>(
    predicate: T,
    ...args: Parameters<T>
  ): this {
    return this.Action(new WaitConditionAction(predicate, ...args));
  }

  WaitEvent(panel: Panel, eventName: UIPanelEvent): this {
    return this.Action(new WaitEventAction(panel, eventName));
  }

  WaitAction(action: Action, timeout: number, ignoreTimeout: boolean): this {
    return this.Action(new WaitActionAction(action, timeout, ignoreTimeout));
  }

  AddClass(panel: Panel, className: string): this {
    return this.Action(new AddClassAction(panel, className));
  }

  RemoveClass(panel: Panel, className: string): this {
    return this.Action(new RemoveClassAction(panel, className));
  }

  ToggleClass(panel: Panel, className: string): this {
    return this.Action(new ToggleClassAction(panel, className));
  }

  TriggerClass(panel: Panel, className: string): this {
    return this.Action(new TriggerClassAction(panel, className));
  }

  SwitchClass(panel: Panel, className: string, replacement: string): this {
    return this.Action(new SwitchClassAction(panel, className, replacement));
  }

  WaitClass(panel: Panel, className: string): this {
    return this.Action(new WaitClassAction(panel, className));
  }

  DeleteAsync(panel: Panel, delay: number): this {
    return this.Action(new DeleteAsyncAction(panel, delay));
  }

  RemoveChildren(panel: Panel): this {
    return this.Action(new RemoveChildrenAction(panel));
  }

  ScrollToTop(panel: Panel): this {
    return this.Action(new ScrollToTopAction(panel));
  }

  ScrollToBottom(panel: Panel): this {
    return this.Action(new ScrollToBottomAction(panel));
  }

  Show(panel: Panel): this {
    return this.Action(new ShowAction(panel));
  }

  Hide(panel: Panel): this {
    return this.Action(new HideAction(panel));
  }

  Enable(panel: Panel): this {
    return this.Action(new EnableAction(panel));
  }

  Disable(panel: Panel): this {
    return this.Action(new DisableAction(panel));
  }

  Check(panel: Panel): this {
    return this.Action(new CheckAction(panel));
  }

  Uncheck(panel: Panel): this {
    return this.Action(new UncheckAction(panel));
  }

  Focus(panel: Panel): this {
    return this.Action(new FocusAction(panel));
  }

  SetProperty<T, K extends keyof T>(panel: { [Key in K]: T[K] }, property: K, value: T[K]): this {
    return this.Action(new SetPropertyAction(panel, property, value));
  }

  SetText(panel: PanelWithText, value: string): this {
    return this.Action(new SetTextAction(panel, value));
  }

  SetScaling(panel: ImagePanel, value: ScalingFunction): this {
    return this.Action(new SetScalingAction(panel, value));
  }

  SetImage(panel: ImagePanel, value: string): this {
    return this.Action(new SetImageAction(panel, value));
  }

  SetAbilityImage(panel: AbilityImage, { abilityname }: Partial<AbilityImageOwnWritable>): this {
    return this.Action(new SetAbilityImageAction(panel, { abilityname }));
  }

  SetItemImage(panel: ItemImage, { itemname }: Partial<ItemImageOwnWritable>): this {
    return this.Action(new SetItemImageAction(panel, { itemname }));
  }

  SetHeroImage(
    panel: HeroImage,
    { heroid, heroname, heroimagestyle }: Partial<HeroImageOwnWritable>
  ): this {
    return this.Action(new SetHeroImageAction(panel, { heroid, heroname, heroimagestyle }));
  }

  SetEconItem(panel: EconItemPanel, { id, style }: { id: number; style?: number }): this {
    return this.Action(new SetEconItemAction(panel, { id, style }));
  }

  SetAttribute(panel: Panel, attribute: string, value: string): this {
    return this.Action(new SetAttributeAction(panel, attribute, value));
  }

  SetAttributeInt(panel: Panel, attribute: string, value: number): this {
    return this.Action(new SetAttributeIntAction(panel, attribute, value));
  }

  SetAttributeUInt32(panel: Panel, attribute: string, value: number): this {
    return this.Action(new SetAttributeUInt32Action(panel, attribute, value));
  }

  SetDialogVariable(panel: Panel, variable: string, value: string): this {
    return this.Action(new SetDialogVariableAction(panel, variable, value));
  }

  SetDialogVariableInt(panel: Panel, variable: string, value: number): this {
    return this.Action(new SetDialogVariableIntAction(panel, variable, value));
  }

  SetDialogVariableTime(panel: Panel, variable: string, value: number): this {
    return this.Action(new SetDialogVariableTimeAction(panel, variable, value));
  }

  SetDialogVariableL10n(panel: Panel, variable: string, value: string, count?: number): this {
    return this.Action(new SetDialogVariableL10nAction(panel, variable, value, count));
  }

  AnimateDialogVariableInt(
    panel: Panel,
    variable: string,
    start: number,
    end: number,
    duration: number
  ): this {
    return this.Action(new AnimateDialogVariableIntAction(panel, variable, start, end, duration));
  }

  SetProgressBar(panel: ProgressBar, { value, min, max }: Partial<ProgressBarOwnWritable>): this {
    return this.Action(new SetProgressBarAction(panel, { value, min, max }));
  }

  AnimateProgressBar(panel: ProgressBar, start: number, end: number, duration: number): this {
    return this.Action(new AnimateProgressBarAction(panel, start, end, duration));
  }

  AnimateProgressBarWithMiddle(
    panel: ProgressBarWithMiddle,
    start: number,
    end: number,
    duration: number
  ): this {
    return this.Action(new AnimateProgressBarWithMiddleAction(panel, start, end, duration));
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

  PlaySoundEffect(soundEvent: string): this {
    return this.Action(new PlaySoundEffectAction(soundEvent));
  }

  FireEntityInput(panel: ScenePanel, entityID: string, inputName: string, value: string): this {
    return this.Action(new FireEntityInputAction(panel, entityID, inputName, value));
  }
}

/**
 * Sequence that runs actions in serial order until all actions are finished.
 */
export class SerialSequence extends Sequence {
  index: number;
  running: boolean;

  constructor() {
    super();

    this.index = 0;
    this.running = false;
  }

  get currentAction(): Action {
    return this.actions[this.index];
  }

  _start(): void {
    this.index = 0;
    this.running = false;
  }

  _update(): boolean {
    while (this.index < this.length) {
      if (!this.running) {
        this.currentAction.start();
        this.running = true;
      }

      if (!this.currentAction.update()) {
        this.currentAction.finish();
        this.index++;
        this.running = false;
      } else {
        return true;
      }
    }

    return false;
  }

  _finish(): void {
    while (this.index < this.length) {
      if (!this.running) {
        this.currentAction.start();
        this.running = true;
        this.currentAction.update();
      }

      this.currentAction.finish();
      this.index++;
      this.running = false;
    }
  }
}

/**
 * Sequence that runs actions in parallel until all actions are finished.
 */
export class ParallelSequence extends Sequence {
  _start(): void {
    this.actions.forEach((action) => action.start());
  }

  _update(): boolean {
    let anyTicking = false;

    this.actions.forEach((action) => {
      if (!action.finished) {
        if (!action.update()) {
          action.finish();
        } else {
          anyTicking = true;
        }
      }
    });

    return anyTicking;
  }

  _finish(): void {
    this.actions.forEach((action) => action.finish());
  }
}

/**
 * Sequence that runs actions in parallel until the first action finishes.
 */
export class ParallelAnySequence extends Sequence {
  runAll: boolean;

  /**
   * Creates a ParallelAnySequence.
   * @param {Object} options Sequence options.
   * @param {boolean} options.runAll Whether to continue running the remaining actions or not.
   */
  constructor({ runAll }: { runAll: boolean }) {
    super();

    this.runAll = runAll;
  }

  _start(): void {
    this.actions.forEach((action) => action.start());
  }

  _update(): boolean {
    let anyFinished = false;

    this.actions.forEach((action) => {
      if (!action.update()) {
        action.finish();
        anyFinished = true;
      }
    });

    return !anyFinished;
  }

  _finish(): void {
    if (this.runAll) {
      const actions = this.actions.filter((action) => !action.finished);

      // FIXME: prevent actions being `start()`ed again
      return new ParallelSequence().Action(...actions).run();
    }

    this.actions.forEach((action) => action.finish());
  }
}

/**
 * Sequence that runs actions in parallel, using a staggered start timing between each, until all
 * actions are finished.
 */
export class StaggeredSequence extends Sequence {
  delay: number;
  seq: Sequence;

  /**
   * Creates a StaggeredSequence.
   * @param {number} delay - Delay between start of each action.
   */
  constructor({ delay }: { delay: number }) {
    super();

    this.delay = delay;
    this.seq = new ParallelSequence();
  }

  _start(): void {
    this.actions.forEach((action, i) => {
      const delay = i * this.delay;

      if (delay > 0) {
        const seq = new SerialSequence().Wait(delay).Action(action);

        this.seq.Action(seq);
      } else {
        this.seq.Action(action);
      }
    });

    this.seq.start();
  }

  _update(): boolean {
    return this.seq.update();
  }

  _finish(): void {
    this.seq.finish();
  }
}
