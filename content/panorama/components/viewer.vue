<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/viewer.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/viewer.css" />
  </styles>

  <Panel class="root Hide" hittest="false">
    <Panel class="viewer" hittest="false">
      <Button class="CloseButton" onactivate="component.Close()" />
      <Button class="RefreshButton" onactivate="component.Reload()" />

      <Panel class="viewer-bg" hittest="false" />

      <Panel class="body" hittest="false">
        <Label id="title" html="true" hittest="false" />

        <Panel id="scroll-panel">
          <Panel id="properties-section" class="section" hittest="false" />

          <Label id="description" html="true" hittest="false" />

          <Panel class="section section-abilities" hittest="false">
            <Panel class="section-header" hittest="false">
              <Label class="section-label" text="#invokation_viewer_abilities_build_title" hittest="false" />
            </Panel>

            <Panel class="abilities-build" hittest="false">
              <Panel id="talents" class="ability-circle" hittest="false" />

              <Panel class="ability-orb ability-circle" hittest="false">
                <DOTAAbilityImage id="ability-quas" abilityname="invoker_quas" onmouseover="component.ShowOrbTooltip('quas')" onmouseout="DOTAHideAbilityTooltip()" />
                <Label id="ability-quas-label" class="ability-orb-label" hittest="false" />
              </Panel>

              <Panel class="ability-orb ability-circle" hittest="false">
                <DOTAAbilityImage id="ability-wex" abilityname="invoker_wex" onmouseover="component.ShowOrbTooltip('wex')" onmouseout="DOTAHideAbilityTooltip()" />
                <Label id="ability-wex-label" class="ability-orb-label" hittest="false" />
              </Panel>

              <Panel class="ability-orb ability-circle" hittest="false">
                <DOTAAbilityImage id="ability-exort" abilityname="invoker_exort" onmouseover="component.ShowOrbTooltip('exort')" onmouseout="DOTAHideAbilityTooltip()" />
                <Label id="ability-exort-label" class="ability-orb-label" hittest="false" />
              </Panel>
            </Panel>
          </Panel>

          <Panel class="section" hittest="false">
            <Panel class="section-header" hittest="false">
              <Label class="section-label" text="#invokation_viewer_sequence_title" hittest="false" />
            </Panel>

            <Label class="section-label" text="#invokation_viewer_sequence_disclaimer" hittest="false" />

            <Panel id="sequence" hittest="false" />
          </Panel>
        </Panel>
      </Panel>

      <Panel class="footer" hittest="false">
        <Panel class="buttons" hittest="false">
          <Button class="play-button" onactivate="component.Play()">
            <Label class="play-label" text="#invokation_controls_play" hittest="false" />
          </Button>
        </Panel>
      </Panel>
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import type { Combo, ComboID, Step } from "../scripts/lib/combo";
import { Component } from "../scripts/lib/component";
import { ComponentLayout, COMPONENTS } from "../scripts/lib/const/component";
import { CustomEvent, ViewerRenderEvent } from "../scripts/lib/const/events";
import type { PanelWithComponent } from "../scripts/lib/const/panorama";
import { CSSClass } from "../scripts/lib/const/panorama";
import { CustomEvents } from "../scripts/lib/custom_events";
import { Orb } from "../scripts/lib/invoker";
import { comboKey, localizeFallback } from "../scripts/lib/l10n";
import {
  Action,
  ParallelSequence,
  RunFunctionAction,
  SerialSequence,
} from "../scripts/lib/sequence";
import { UI } from "../scripts/lib/ui";
import { UIEvents } from "../scripts/lib/ui_events";
import type { Inputs as TalentsDisplayInputs } from "./ui/talents_display.vue";
import type UITalentsDisplay from "./ui/talents_display.vue";
import type { Inputs as StepInputs } from "./viewer_combo_step.vue";
import type { Inputs as PropertiesInputs } from "./viewer_properties.vue";

export type Inputs = never;
export type Outputs = never;

interface Elements {
  scrollPanel: Panel;
  propertiesSection: Panel;
  titleLabel: LabelPanel;
  descriptionLabel: LabelPanel;
  sequence: Panel;
  talents: TalentsPanel;
  orbQuas: AbilityImage;
  orbQuasLabel: LabelPanel;
  orbWex: AbilityImage;
  orbWexLabel: LabelPanel;
  orbExort: AbilityImage;
  orbExortLabel: LabelPanel;
}

type TalentsPanel = PanelWithComponent<UITalentsDisplay>;

const { inputs: TALENTS_INPUTS } = COMPONENTS.UI_TALENTS_DISPLAY;
const { inputs: PROPERTIES_INPUTS } = COMPONENTS.VIEWER_PROPERTIES;
const { inputs: STEP_INPUTS } = COMPONENTS.VIEWER_COMBO_STEP;

const CLASSES = {
  CLOSED: CSSClass.Hide,
};

const PROPERTIES_ID = "viewer-properties";

const L10N_FALLBACK_IDS = {
  description: "invokation_viewer_description_lorem",
};

const stepPanelID = (step: Step) => `combo-step-${step.index}-${step.name}`;
const htmlTitle = (title: string) =>
  title
    .split(" - ")
    .map((line, i) => {
      const heading = i === 0 ? "h1" : "h3";
      return `<${heading}>${line}</${heading}>`;
    })
    .join("");

export default class Viewer extends Component {
  #elements: Elements;
  combo?: Combo;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      scrollPanel: "scroll-panel",
      propertiesSection: "properties-section",
      titleLabel: "title",
      descriptionLabel: "description",
      sequence: "sequence",
      talents: "talents",
      orbQuas: "ability-quas",
      orbQuasLabel: "ability-quas-label",
      orbWex: "ability-wex",
      orbWexLabel: "ability-wex-label",
      orbExort: "ability-exort",
      orbExortLabel: "ability-exort-label",
    });

    this.onCustomEvent(CustomEvent.VIEWER_RENDER, this.onViewerRender);
    this.onCustomEvent(CustomEvent.COMBO_STARTED, this.onComboStarted);

    this.renderTalents();
    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(): void {
    this.debug("onComboStarted()");
    this.close();
  }

  onViewerRender(payload: NetworkedData<ViewerRenderEvent>): void {
    this.debug("onViewerRender()", payload);
    this.view(payload.id);
  }

  // ----- Helpers -----

  hasCombo(): this is { combo: Combo } {
    return this.combo != null;
  }

  orbElem(orb: Orb): AbilityImage {
    switch (orb) {
      case Orb.Quas:
        return this.#elements.orbQuas;
      case Orb.Wex:
        return this.#elements.orbWex;
      case Orb.Exort:
        return this.#elements.orbExort;
    }
  }

  renderTalents(): void {
    this.loadComponent(this.#elements.talents, ComponentLayout.UITalentsDisplay);
  }

  resetSelectedTalents(): void {
    this.#elements.talents.component.input(TALENTS_INPUTS.RESET);
  }

  selectTalents(): void {
    if (!this.hasCombo()) {
      throw Error("Viewer.selectTalents called without combo");
    }

    const payload: TalentsDisplayInputs[typeof TALENTS_INPUTS.SELECT] = {
      talents: this.combo.talents,
    };

    this.#elements.talents.component.input(TALENTS_INPUTS.SELECT, payload);
  }

  startCombo(): void {
    if (!this.hasCombo()) {
      throw Error("Viewer.startCombo called without combo");
    }

    this.debug("startCombo()", this.combo.id);

    CustomEvents.sendServer(CustomEvent.COMBO_START, { id: this.combo.id });
  }

  createStepPanel(parent: Panel, step: Step): void {
    if (!this.hasCombo()) {
      throw Error("Viewer.createStepPanel called without combo");
    }

    const id = stepPanelID(step);
    const setStepPayload: StepInputs[typeof STEP_INPUTS.SET_STEP] = { combo: this.combo, step };

    this.createComponent(parent, id, ComponentLayout.ViewerComboStep, {
      inputs: {
        [STEP_INPUTS.SET_STEP]: setStepPayload,
      },
    });
  }

  createPropertiesPanel(): void {
    if (!this.hasCombo()) {
      throw Error("Viewer.createPropertiesPanel called without combo");
    }

    const setComboPayload: PropertiesInputs[typeof PROPERTIES_INPUTS.SET_COMBO] = {
      combo: this.combo,
    };

    this.createComponent(
      this.#elements.propertiesSection,
      PROPERTIES_ID,
      ComponentLayout.ViewerProperties,
      {
        inputs: {
          [PROPERTIES_INPUTS.SET_COMBO]: setComboPayload,
        },
      }
    );
  }

  // ----- Actions -----

  openAction(): Action {
    return new SerialSequence().RemoveClass(this.ctx, CLASSES.CLOSED);
  }

  closeAction(): Action {
    return new SerialSequence().AddClass(this.ctx, CLASSES.CLOSED);
  }

  renderAction(): Action {
    return new SerialSequence()
      .Action(this.renderInfoAction())
      .Action(this.renderPropertiesAction())
      .Action(this.renderTalentsAction())
      .Action(this.renderOrbsAction())
      .Action(this.renderSequenceAction())
      .ScrollToTop(this.#elements.scrollPanel);
  }

  renderInfoAction(): Action {
    if (!this.hasCombo()) {
      throw Error("Viewer.renderInfoAction called without combo");
    }

    const title = htmlTitle(this.combo.l10n.name);
    const descriptionL10nKey = comboKey(this.combo, "description");
    const description = localizeFallback(descriptionL10nKey, L10N_FALLBACK_IDS.description);

    return new ParallelSequence()
      .SetText(this.#elements.titleLabel, title)
      .SetText(this.#elements.descriptionLabel, description);
  }

  renderPropertiesAction(): Action {
    return new SerialSequence()
      .RemoveChildren(this.#elements.propertiesSection)
      .RunFunction(() => this.createPropertiesPanel());
  }

  renderTalentsAction(): Action {
    return new SerialSequence()
      .RunFunction(() => this.resetSelectedTalents())
      .RunFunction(() => this.selectTalents());
  }

  renderOrbsAction(): Action {
    if (!this.hasCombo()) {
      throw Error("Viewer.renderOrbsAction called without combo");
    }

    return new ParallelSequence()
      .SetText(this.#elements.orbQuasLabel, String(this.combo.orbs[0]))
      .SetText(this.#elements.orbWexLabel, String(this.combo.orbs[1]))
      .SetText(this.#elements.orbExortLabel, String(this.combo.orbs[2]));
  }

  renderSequenceAction(): Action {
    if (!this.hasCombo()) {
      throw Error("Viewer.renderSequenceAction called without combo");
    }

    const actions = this.combo.sequence.map((step) =>
      this.createStepPanelAction(this.#elements.sequence, step)
    );

    return new SerialSequence().RemoveChildren(this.#elements.sequence).Action(...actions);
  }

  createStepPanelAction(parent: Panel, step: Step): Action {
    return new RunFunctionAction(() => this.createStepPanel(parent, step));
  }

  // ----- Action runners -----

  view(id: ComboID): void {
    this.combo = UI.config.combos.get(id);

    const seq = new SerialSequence().Action(this.renderAction()).Action(this.openAction());

    this.debugFn(() => ["view()", { id: this.combo?.id, actions: seq.length }]);

    seq.run();
  }

  close(): void {
    const seq = new SerialSequence().Action(this.closeAction());

    this.debugFn(() => ["close()", { id: this.combo?.id, actions: seq.length }]);

    seq.run();
  }

  // ----- UI methods -----

  Reload(): void {
    const seq = new SerialSequence().Action(this.renderAction());

    this.debugFn(() => ["Reload()", { id: this.combo?.id, actions: seq.length }]);

    seq.run();
  }

  Close(): void {
    this.close();
  }

  Play(): void {
    this.startCombo();
  }

  ShowOrbTooltip(orb: Orb): void {
    if (!this.hasCombo()) {
      this.warn("Viewer.ShowOrbTooltip called without combo");
      return;
    }

    if (!(orb in Orb)) {
      this.warn(`Viewer.ShowOrbTooltip called with invalid orb ${orb}`);
      return;
    }

    const elem = this.orbElem(orb);

    UIEvents.showAbilityTooltip(elem, elem.abilityname, { level: this.combo.orbs[orb] });
  }
}

global.component = new Viewer();
</script>

<style lang="scss">
// ******************************************************************************
// * Combo Viewer (shamelessly rippped from Invoker kid persona leaf page)
// ******************************************************************************

@use "../styles/variables";

$fg-color: #3c1b18;

.root {
  width: 100%;
  height: 100%;
}

.root.Hide {
  visibility: collapse;
}

.CloseButton {
  width: 36px;
  height: 36px;
  margin-top: -4px;
  margin-right: -4px;
  horizontal-align: right;
  wash-color: #fff;
}

.RefreshButton {
  width: 36px;
  height: 36px;
  margin-top: -4px;
  margin-left: -4px;
  visibility: collapse;
  horizontal-align: left;
  wash-color: #fff;
}

.development .RefreshButton {
  visibility: visible;
}

.viewer {
  width: 640px;
  height: 840px;
  margin-top: 160px;
  margin-left: 790px;
  horizontal-align: center;
  opacity: 1;
  transition-duration: 0s;
  transition-property: opacity;

  // Styles used within HTML content

  .sub-title {
    font-weight: bold;
    font-size: 18px;
  }

  .intro-text {
    font-weight: bold;
    font-size: 21px;
  }
}

.root.Hide .viewer {
  opacity: 0;
  transition-duration: 1s;
}

.viewer-bg {
  z-index: -1;
  width: 100%;
  height: 100%;
  background-image: variables.$bg-viewer;
  background-repeat: no-repeat;
  background-size: contain;
}

.body {
  flow-children: down;
  width: 100%;
  margin-top: 60px;
}

#title {
  width: 555px;
  margin-left: 45px;
  padding: 0 25px;
  color: $fg-color;
  font-weight: #000;
  font-size: 21px;
  letter-spacing: 2px;
  text-align: center;
  text-transform: uppercase;
  text-overflow: shrink;
  text-shadow: 0 0 5px 1px #000;
}

#scroll-panel {
  width: 80%;
  height: 600px;
  padding-right: 20px;
  padding-bottom: 10px;
  overflow: squish scroll;
  flow-children: down;
  align: center top;
  opacity-mask: variables.$mask-soft-edge-vscroll-wide;
}

#properties-section {
  width: 65%;
  horizontal-align: center;
}

#description {
  width: 100%;
  margin-top: 18px;
  color: $fg-color;
  font-weight: semi-bold;
  font-size: 18px;
  line-height: 21px;
  text-align: left;
}

.section {
  flow-children: down;
  width: 100%;
  margin-top: 20px;
}

.section .section-label {
  color: $fg-color;
  font-weight: semi-bold;
  font-size: 18px;
}

.section .section-header {
  flow-children: right;
  width: 100%;
  margin-bottom: 8px;
}

.section .section-header .section-label {
  font-weight: bold;
  font-size: 24px;
  text-transform: uppercase;
  text-shadow: 1px 1px 2px 1 $fg-color;
}

.section-abilities .abilities-build {
  flow-children: right;
  margin-top: 22px;
  margin-bottom: 10px;
  horizontal-align: center;
}

.abilities-build .ability-circle {
  width: 68px;
  height: 68px;
  padding: 4px;
  opacity-mask: variables.$mask-soft-edge-circle-sharper;
  background-color: $fg-color&dd;
}

.section-abilities .ability-orb {
  margin-left: 8px;
}

.section-abilities .ability-orb-label {
  margin-right: 8px;
  margin-bottom: 4px;
  color: $fg-color;
  font-weight: bold;
  font-size: 28px;
  text-shadow: 1px 1px 1px #fffd;
  align: right bottom;
  opacity-mask: variables.$mask-soft-edge-box-irregular;
}

#sequence {
  flow-children: down;
  width: 100%;
  margin-top: 26px;
}

.footer {
  margin-bottom: 60px;
  horizontal-align: center;
  vertical-align: bottom;

  .buttons {
    flow-children: right;
    horizontal-align: center;
  }
}

.play-button {
  width: 206px;
  height: 49px;
  background-color: gradient(linear, 0% 100%, 0% 0%, from(#af5417cc), to(#af5417cc));
  border-top: 1px solid #faa46a;
  box-shadow: #27110250 0 0 12px;
  opacity: 0.9;
  transition-duration: 0.2s;
  transition-property: background-color;
  wash-color: #9992;

  &:hover {
    background-color: gradient(linear, 0% 100%, 0% 0%, from(#af5417), to(#af5417));
  }

  &:active {
    wash-color: #fff;
  }

  .play-label {
    width: 100%;
    color: #d5d7d7;
    font-weight: bold;
    font-size: 24px;
    letter-spacing: 2px;
    text-align: center;
    text-transform: uppercase;
    vertical-align: center;
  }

  &:hover .play-label {
    color: #fff;
  }
}
</style>
