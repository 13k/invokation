import type { Elements as CElements } from "../lib/component";
import type * as TCustomEvents from "../lib/custom_events";
import type * as TComboScore from "./combo_score";

export interface Elements extends CElements {
  score: Panel;
}

const {
  Combo: { StaticID },
  Component,
  CustomEvents: { Name: CustomEventName },
  Layout: { ID: LayoutID },
  lodash: _,
  Sequence: { Sequence, ParallelSequence, RemoveClassAction, RunFunctionAction },
} = GameUI.CustomUIConfig();

enum PanelID {
  ComboScore = "ComboScore",
}

enum CssClass {
  FreestyleHide = "Hide",
  ComboScore = "Level2",
}

enum SoundEvent {
  Start = "Invokation.Freestyle.Start",
}

enum Timing {
  StartDelay = 0.5,
}

class Freestyle extends Component<Elements> {
  comboScore: TComboScore.ComboScore;

  constructor() {
    super({
      elements: {
        score: "FreestyleScore",
      },
      customEvents: {
        COMBO_STARTED: "onComboStarted",
        COMBO_STOPPED: "onComboStopped",
        COMBO_PROGRESS: "onComboProgress",
      },
    });

    this.comboScore = this.createComboScore(this.elements.score);

    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload: TCustomEvents.ComboStarted) {
    if (payload.id !== StaticID.Freestyle) {
      return;
    }

    this.debug("onComboStarted()", payload);
    this.start();
  }

  onComboStopped(payload: TCustomEvents.ComboStopped) {
    if (payload.id !== StaticID.Freestyle) {
      return;
    }

    this.debug("onComboStopped()", payload);
    this.stop();
  }

  onComboProgress(payload: TCustomEvents.ComboProgress) {
    if (payload.id !== StaticID.Freestyle) {
      return;
    }

    this.debug("onComboProgress()", payload);
    this.progress(payload.metrics);
  }

  // ----- Helpers -----

  sendStop() {
    this.sendServer(CustomEventName.COMBO_STOP, {});
  }

  sendRestart(isHardReset: boolean) {
    this.sendServer(CustomEventName.COMBO_RESTART, { hardReset: isHardReset });
  }

  sendLevelUp(payload: TCustomEvents.FreestyleHeroLevelUp) {
    this.sendServer(CustomEventName.FREESTYLE_HERO_LEVEL_UP, payload);
  }

  createComboScore(parent: Panel) {
    const component = this.create(LayoutID.ComboScore, PanelID.ComboScore, parent);

    component.panel.AddClass(CssClass.ComboScore);

    return component;
  }

  // ----- Component actions -----

  showAction() {
    return new RemoveClassAction(this.panel, CssClass.FreestyleHide);
  }

  hideAction() {
    return new ParallelSequence()
      .Action(this.hideScoreAction())
      .Action(this.hideShopAction())
      .AddClass(this.panel, CssClass.FreestyleHide);
  }

  // ----- Score actions -----

  updateScoreSummaryAction(options: TComboScore.Inputs["UpdateSummary"]) {
    return new RunFunctionAction(() => this.comboScore.Input("UpdateSummary", options));
  }

  hideScoreAction() {
    return new RunFunctionAction(() => this.comboScore.Input("Hide"));
  }

  // ----- HUD actions -----

  showShopAction() {
    return new RunFunctionAction(() => this.showInventoryShopUI());
  }

  hideShopAction() {
    return new RunFunctionAction(() => this.hideInventoryShopUI());
  }

  // ----- Action runners -----

  start() {
    const seq = new Sequence()
      .PlaySoundEffect(SoundEvent.Start)
      .Action(this.hideScoreAction())
      .Action(this.showShopAction())
      .Wait(Timing.StartDelay)
      .Action(this.showAction());

    this.debugFn(() => ["start()", { actions: seq.size() }]);

    seq.Run();
  }

  stop() {
    const seq = new Sequence().Action(this.hideAction());

    this.debugFn(() => ["stop()", { actions: seq.size() }]);

    seq.Run();
  }

  progress(metrics: TCustomEvents.ComboProgress["metrics"]) {
    const options = {
      count: metrics.count || 0,
      endDamage: metrics.damage || 0,
    };

    const seq = new Sequence().Action(this.updateScoreSummaryAction(options));

    this.debugFn(() => ["progress()", _.assign({ actions: seq.size() }, options)]);

    seq.Run();
  }

  // ----- UI methods -----

  Restart(isHardReset: boolean) {
    this.debugFn(() => ["Restart()", { isHardReset }]);
    this.sendRestart(!!isHardReset);
  }

  Stop() {
    this.debug("Stop()");
    this.sendStop();
  }

  LevelUp() {
    this.sendLevelUp({ maxLevel: false });
  }

  LevelMax() {
    this.sendLevelUp({ maxLevel: true });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new Freestyle();

export type { Freestyle };
