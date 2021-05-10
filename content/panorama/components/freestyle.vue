<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/freestyle.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/freestyle.css" />
  </styles>

  <Panel class="root Hide" hittest="false">
    <Panel class="combo-controls panel-transparent" hittest="false">
      <Panel class="control-icon">
        <Button class="icon-button button-arrow arrow-solid arrow-up pink" onactivate="freestyle.LevelUp()" onmouseover="UIShowTextTooltip(#invokation_controls_level_up)" onmouseout="UIHideTextTooltip()" />
      </Panel>

      <Panel class="control-icon">
        <Button class="icon-button button-arrow arrow-ff arrow-up green" onactivate="freestyle.LevelMax()" onmouseover="UIShowTextTooltip(#invokation_controls_level_max)" onmouseout="UIHideTextTooltip()" />
      </Panel>

      <Panel class="control-icon">
        <Button class="icon-button RefreshButton blue" onactivate="freestyle.Restart()" onmouseover="UIShowTextTooltip(#invokation_controls_restart)" onmouseout="UIHideTextTooltip()" />
      </Panel>

      <Panel class="control-icon">
        <Button class="icon-button button-arrow arrow-double arrow-down bronze" onactivate="freestyle.Restart(true)" onmouseover="UIShowTextTooltip(#invokation_controls_full_restart)" onmouseout="UIHideTextTooltip()" />
      </Panel>

      <Panel class="control-icon">
        <Button class="icon-button button-quit red" onactivate="freestyle.Stop()" onmouseover="UIShowTextTooltip(#invokation_controls_stop)" onmouseout="UIHideTextTooltip()" />
      </Panel>
    </Panel>

    <Panel id="score" />
  </Panel>
</root>
</layout>

<script lang="ts">
import type { ProgressMetrics, ScoreSummaryMetrics } from "../scripts/lib/combo";
import { FREESTYLE_COMBO_ID } from "../scripts/lib/combo";
import { Component } from "../scripts/lib/component";
import { COMPONENTS } from "../scripts/lib/const/component";
import {
  ComboProgressEvent,
  ComboRestartEvent,
  ComboStartedEvent,
  ComboStoppedEvent,
  CustomEvent,
  FreestyleHeroLevelUpEvent,
} from "../scripts/lib/const/events";
import type { PanelWithComponent } from "../scripts/lib/const/panorama";
import { CSSClass } from "../scripts/lib/const/panorama";
import { CustomEvents } from "../scripts/lib/custom_events";
import {
  Action,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  SerialSequence,
} from "../scripts/lib/sequence";
import { UI } from "../scripts/lib/ui";
import type ComboScore from "./combo_score.vue";
import type { Inputs as ComboScoreInputs } from "./combo_score.vue";

export type Inputs = never;
export type Outputs = never;

interface Elements {
  score: Panel;
}

type ComboScorePanel = PanelWithComponent<ComboScore>;

const { inputs: SCORE_INPUTS } = COMPONENTS.COMBO_SCORE;

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

export default class Freestyle extends Component {
  #elements: Elements;
  #comboScore: ComboScorePanel;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      score: "score",
    });

    this.#comboScore = this.createComboScorePanel(this.#elements.score);

    this.onCustomEvent(CustomEvent.COMBO_STARTED, this.onComboStarted);
    this.onCustomEvent(CustomEvent.COMBO_STOPPED, this.onComboStopped);
    this.onCustomEvent(CustomEvent.COMBO_PROGRESS, this.onComboProgress);

    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload: NetworkedData<ComboStartedEvent>): void {
    if (payload.id !== FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStarted()", payload);
    this.start();
  }

  onComboStopped(payload: NetworkedData<ComboStoppedEvent>): void {
    if (payload.id !== FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboStopped()", payload);
    this.stop();
  }

  onComboProgress(payload: NetworkedData<ComboProgressEvent>): void {
    const { id, metrics } = payload;

    if (id !== FREESTYLE_COMBO_ID) {
      return;
    }

    this.debug("onComboProgress()", payload);
    this.progress(metrics);
  }

  // ----- Helpers -----

  sendStop(): void {
    CustomEvents.sendServer(CustomEvent.COMBO_STOP);
  }

  sendRestart(payload: ComboRestartEvent): void {
    CustomEvents.sendServer(CustomEvent.COMBO_RESTART, payload);
  }

  sendLevelUp(payload: FreestyleHeroLevelUpEvent): void {
    CustomEvents.sendServer(CustomEvent.FREESTYLE_HERO_LEVEL_UP, payload);
  }

  createComboScorePanel(parent: Panel): ComboScorePanel {
    const { layout } = COMPONENTS.COMBO_SCORE;
    const { id, cssClass } = DYN_ELEMS.COMBO_SCORE;

    return this.createComponent(parent, id, layout, {
      classes: [cssClass],
    });
  }

  // ----- Component actions -----

  showAction(): Action {
    return new RemoveClassAction(this.ctx, CSSClass.Hide);
  }

  hideAction(): Action {
    return new ParallelSequence()
      .Action(this.hideScoreAction())
      .Action(this.hideShopAction())
      .AddClass(this.ctx, CSSClass.Hide);
  }

  // ----- Score actions -----

  updateScoreSummaryAction(metrics: ComboScoreInputs[typeof SCORE_INPUTS.UPDATE_SUMMARY]): Action {
    return new RunFunctionAction(() => {
      this.#comboScore.component.input(SCORE_INPUTS.UPDATE_SUMMARY, metrics);
    });
  }

  hideScoreAction(): Action {
    return new SerialSequence().RunFunction(() => {
      this.#comboScore.component.input(SCORE_INPUTS.HIDE);
    });
  }

  // ----- HUD actions -----

  showShopAction(): Action {
    return new RunFunctionAction(() => UI.showInventoryShopUI());
  }

  hideShopAction(): Action {
    return new RunFunctionAction(() => UI.hideInventoryShopUI());
  }

  // ----- Action runners -----

  start(): void {
    const seq = new SerialSequence()
      .PlaySoundEffect(SOUNDS.start)
      .Action(this.hideScoreAction())
      .Action(this.showShopAction())
      .Wait(START_DELAY)
      .Action(this.showAction());

    this.debugFn(() => ["start()", { actions: seq.length }]);

    seq.run();
  }

  stop(): void {
    const seq = new SerialSequence().Action(this.hideAction());

    this.debugFn(() => ["stop()", { actions: seq.length }]);

    seq.run();
  }

  progress(metrics: ProgressMetrics): void {
    const scoreSummaryMetrics: ScoreSummaryMetrics = {
      count: metrics.count || 0,
      endDamage: metrics.damage || 0,
    };

    const seq = new SerialSequence().Action(this.updateScoreSummaryAction(scoreSummaryMetrics));

    this.debugFn(() => ["progress()", { actions: seq.length, ...scoreSummaryMetrics }]);

    seq.run();
  }

  // ----- UI methods -----

  Restart(hardReset: boolean): void {
    this.debugFn(() => ["Restart()", { hardReset }]);
    this.sendRestart({ hardReset });
  }

  Stop(): void {
    this.debug("Stop()");
    this.sendStop();
  }

  LevelUp(): void {
    this.sendLevelUp({ maxLevel: false });
  }

  LevelMax(): void {
    this.sendLevelUp({ maxLevel: true });
  }
}

global.freestyle = new Freestyle();
</script>

<style lang="scss">
@use "../styles/variables";
@use "../styles/ui";
@use "../styles/combo_controls";

$controls-margin-left: 80px;

.root {
  width: 100%;
  height: 100%;
}

#score {
  margin-bottom: 230px;
  align: center bottom;
}

.combo-controls {
  margin-top: 13px;
  margin-left: $controls-margin-left;
  align: left bottom;
}
</style>
