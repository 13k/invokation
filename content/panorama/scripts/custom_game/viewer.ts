import { COMBOS } from "./custom_ui_manifest";
import type { Combo, ComboID, Step } from "./lib/combo";
import { Component } from "./lib/component";
import { ComponentLayout, COMPONENTS } from "./lib/const/component";
import { CustomEvent, ViewerRenderEvent } from "./lib/const/events";
import type { PanelWithComponent } from "./lib/const/panorama";
import { CSSClass } from "./lib/const/panorama";
import { CustomEvents } from "./lib/custom_events";
import { Orb } from "./lib/invoker";
import { comboKey, localizeFallback } from "./lib/l10n";
import { Action, ParallelSequence, RunFunctionAction, SerialSequence } from "./lib/sequence";
import { UIEvents } from "./lib/ui_events";
import type { Inputs as TalentsDisplayInputs, UITalentsDisplay } from "./ui/talents_display";
import type { Inputs as StepInputs } from "./viewer_combo_step";
import type { Inputs as PropertiesInputs } from "./viewer_properties";

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

export class Viewer extends Component {
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
    this.combo = COMBOS.get(id);

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

//   context.component = new Viewer();
// })(GameUI.CustomUIConfig(), this);
