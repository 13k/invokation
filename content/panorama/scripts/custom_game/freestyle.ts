// const { Component } = context;
// const { lodash: _ } = global;
// const { COMPONENTS, CSS_CLASSES, EVENTS, FREESTYLE_COMBO_ID } = global.Const;
// const { Sequence, ParallelSequence, RunFunctionAction, RemoveClassAction } = global.Sequence;

import { Component } from "./lib/component";

const DYN_ELEMS = {
  COMBO_SCORE: {
    id: "score-component",
    cssClass: "level2",
  },
};

const START_DELAY = 0.5;

const SOUNDS = {
  start: "Invokation.Freestyle.Start",
};

class Freestyle extends Component {
  constructor() {
    super({
      elements: {
        score: "score",
      },
      customEvents: {
        "!COMBO_STARTED": "onComboStarted",
        "!COMBO_STOPPED": "onComboStopped",
        "!COMBO_PROGRESS": "onComboProgress",
      },
    });

    this.$comboScore = this.createComboScorePanel(this.$score);

    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload) {
    if (payload.id !== FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStarted()", payload);
    this.start();
  }

  onComboStopped(payload) {
    if (payload.id !== FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStopped()", payload);
    this.stop();
  }

  onComboProgress(payload) {
    const { id, metrics } = payload;

    if (id !== FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboProgress()", payload);
    this.progress(metrics);
  }

  // ----- Helpers -----

  sendStop() {
    this.sendServer(EVENTS.COMBO_STOP);
  }

  sendRestart(hardReset) {
    this.sendServer(EVENTS.COMBO_RESTART, { hardReset });
  }

  sendLevelUp(payload) {
    this.sendServer(EVENTS.FREESTYLE_HERO_LEVEL_UP, payload);
  }

  createComboScorePanel(parent) {
    const { layout } = COMPONENTS.COMBO_SCORE;
    const { id, cssClass } = DYN_ELEMS.COMBO_SCORE;

    return this.createComponent(parent, id, layout, {
      classes: [cssClass],
    });
  }

  // ----- Component actions -----

  showAction() {
    return new RemoveClassAction(this.$ctx, CSS_CLASSES.HIDE);
  }

  hideAction() {
    return new ParallelSequence()
      .Action(this.hideScoreAction())
      .Action(this.hideShopAction())
      .AddClass(this.$ctx, CSS_CLASSES.HIDE);
  }

  // ----- Score actions -----

  updateScoreSummaryAction(options) {
    return new RunFunctionAction(() => this.$comboScore.component.Input("UpdateSummary", options));
  }

  hideScoreAction() {
    const { inputs } = COMPONENTS.COMBO_SCORE;

    return new Sequence().RunFunction(() => this.$comboScore.component.Input(inputs.HIDE));
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
      .PlaySoundEffect(SOUNDS.start)
      .Action(this.hideScoreAction())
      .Action(this.showShopAction())
      .Wait(START_DELAY)
      .Action(this.showAction());

    this.debugFn(() => ["start()", { actions: seq.length }]);

    return seq.Start();
  }

  stop() {
    const seq = new Sequence().Action(this.hideAction());

    this.debugFn(() => ["stop()", { actions: seq.length }]);

    return seq.Start();
  }

  progress(metrics) {
    const options = {
      count: metrics.count || 0,
      endDamage: metrics.damage || 0,
    };

    const seq = new Sequence().Action(this.updateScoreSummaryAction(options));

    this.debugFn(() => ["progress()", _.assign({ actions: seq.length }, options)]);

    return seq.Start();
  }

  // ----- UI methods -----

  Restart(hardReset) {
    this.debugFn(() => ["Restart()", { hardReset }]);
    this.sendRestart(!!hardReset);
  }

  Stop() {
    this.debug("Stop()");
    this.sendStop();
  }

  LevelUp() {
    this.sendLevelUp();
  }

  LevelMax() {
    this.sendLevelUp({ maxLevel: true });
  }
}

//   context.freestyle = new Freestyle();
// })(GameUI.CustomUIConfig(), this);
