import type { Metrics } from "@invokation/panorama-lib/combo";
import { StaticId } from "@invokation/panorama-lib/combo";
import type {
  ComboProgress,
  ComboStarted,
  ComboStopped,
  FreestyleHeroLevelUp,
} from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent } from "@invokation/panorama-lib/custom_events";
import { SoundEvent } from "@invokation/panorama-lib/panorama";
import type { Action } from "@invokation/panorama-lib/sequence";
import {
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
} from "@invokation/panorama-lib/sequence";

import type { ComboScore, ComboScoreInputs } from "./combo_score";
import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";

export interface FreestyleElements extends Elements {
  score: Panel;
  btnLevelUp: Button;
  btnLevelMax: Button;
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
}

enum Timing {
  StartDelay = 0.5,
}

export type { Freestyle };

class Freestyle extends Component<FreestyleElements> {
  comboScore: ComboScore;

  constructor() {
    super({
      elements: {
        score: "FreestyleScore",
        btnLevelUp: "BtnLevelUp",
        btnLevelMax: "BtnLevelMax",
        btnRestart: "BtnRestart",
        btnFullRestart: "BtnFullRestart",
        btnStop: "BtnStop",
      },
      customEvents: {
        [CustomGameEvent.ComboStarted]: (payload) => this.onComboStarted(payload),
        [CustomGameEvent.ComboStopped]: (payload) => this.onComboStopped(payload),
        [CustomGameEvent.ComboProgress]: (payload) => this.onComboProgress(payload),
      },
      panelEvents: {
        btnLevelUp: { onactivate: () => this.onBtnLevelUp() },
        btnLevelMax: { onactivate: () => this.onBtnLevelMax() },
        btnRestart: { onactivate: () => this.onBtnRestart(false) },
        btnFullRestart: { onactivate: () => this.onBtnRestart(true) },
        btnStop: { onactivate: () => this.onBtnStop() },
      },
    });

    this.comboScore = this.createComboScore(this.elements.score);

    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload: NetworkedData<ComboStarted>): void {
    if (payload.id !== StaticId.Freestyle) {
      return;
    }

    this.debug("onComboStarted()", payload);
    this.start();
  }

  onComboStopped(payload: NetworkedData<ComboStopped>): void {
    if (payload.id !== StaticId.Freestyle) {
      return;
    }

    this.debug("onComboStopped()", payload);
    this.stop();
  }

  onComboProgress(payload: NetworkedData<ComboProgress>): void {
    if (payload.id !== StaticId.Freestyle) {
      return;
    }

    this.debug("onComboProgress()", payload);
    this.progress(payload.metrics);
  }

  onBtnRestart(isHardReset: boolean): void {
    this.debugFn(() => ["onBtnRestart()", { isHardReset }]);
    this.sendRestart(!!isHardReset);
  }

  onBtnStop(): void {
    this.debug("onBtnStop()");
    this.sendStop();
  }

  onBtnLevelUp(): void {
    this.sendLevelUp({ maxLevel: false });
  }

  onBtnLevelMax(): void {
    this.sendLevelUp({ maxLevel: true });
  }

  // ----- Helpers -----

  sendStop(): void {
    this.sendServer(CustomGameEvent.ComboStop, {});
  }

  sendRestart(isHardReset: boolean): void {
    this.sendServer(CustomGameEvent.ComboRestart, { hardReset: isHardReset });
  }

  sendLevelUp(payload: FreestyleHeroLevelUp): void {
    this.sendServer(CustomGameEvent.FreestyleHeroLevelUp, payload);
  }

  createComboScore(parent: Panel): ComboScore {
    const component = this.create(LayoutId.ComboScore, PanelId.ComboScore, parent);

    component.panel.AddClass(CssClass.ComboScore);

    return component;
  }

  // ----- Component actions -----

  showAction(): Action {
    return new RemoveClassAction(this.panel, CssClass.Hide);
  }

  hideAction(): Action {
    return new ParallelSequence()
      .add(this.hideScoreAction())
      .add(this.hideShopAction())
      .addClass(this.panel, CssClass.Hide);
  }

  // ----- Score actions -----

  updateScoreSummaryAction(options: ComboScoreInputs["updateSummary"]): Action {
    return new RunFunctionAction(() => this.comboScore.sendInputs({ updateSummary: options }));
  }

  hideScoreAction(): Action {
    return new RunFunctionAction(() => this.comboScore.sendInputs({ hide: undefined }));
  }

  // ----- HUD actions -----

  showShopAction(): Action {
    return new RunFunctionAction(() => this.showInventoryShopUi());
  }

  hideShopAction(): Action {
    return new RunFunctionAction(() => this.hideInventoryShopUi());
  }

  // ----- Action runners -----

  start(): void {
    const seq = new Sequence()
      .playSoundEffect(SoundEvent.InvokationFreestyleStart)
      .add(this.hideScoreAction())
      .add(this.showShopAction())
      .wait(Timing.StartDelay)
      .add(this.showAction());

    this.debugFn(() => ["start()", { actions: seq.deepSize() }]);

    seq.run();
  }

  stop(): void {
    const seq = new Sequence().add(this.hideAction());

    this.debugFn(() => ["stop()", { actions: seq.deepSize() }]);

    seq.run();
  }

  progress(metrics: Metrics): void {
    const options = {
      count: metrics.count || 0,
      endDamage: metrics.damage || 0,
    };

    const seq = new Sequence().add(this.updateScoreSummaryAction(options));

    this.debugFn(() => ["progress()", { actions: seq.deepSize(), ...options }]);

    seq.run();
  }
}

(() => {
  new Freestyle();
})();
