import type { Combo, ID as ComboID, OrbName, Step } from "../lib/combo";
import type { Elements as CElements } from "../lib/component";
import type * as TCustomEvents from "../lib/custom_events";
import type { TalentsDisplay as TTalentsDisplay } from "./ui/talents_display";

export interface Elements extends CElements {
  scrollPanel: Panel;
  propertiesSection: Panel;
  titleLabel: LabelPanel;
  descriptionLabel: LabelPanel;
  sequence: Panel;
  talents: TTalentsDisplay["panel"];
  orbQuas: AbilityImage;
  orbQuasLabel: LabelPanel;
  orbWex: AbilityImage;
  orbWexLabel: LabelPanel;
  orbExort: AbilityImage;
  orbExortLabel: LabelPanel;
}

const {
  COMBOS,
  Component,
  CustomEvents,
  L10n,
  Layout,
  lodash: _,
  Sequence: { Sequence, ParallelSequence, RunFunctionAction, NoopAction },
} = GameUI.CustomUIConfig();

enum ElemID {
  Properties = "ViewerProperties",
}

enum Class {
  Closed = "Hide",
  OptionalStep = "ComboStepOptional",
}

const stepPanelID = (step: Step) => `combo_step_${step.id}_${step.name}`;

function orbAttrName<K extends OrbName>(orb: K): `orb${Capitalize<K>}` {
  return `orb${_.capitalize(orb)}` as `orb${Capitalize<K>}`;
}

function titleHTML(s: string) {
  const [title, ...subtitleParts] = s.split(" - ");
  const subtitle = subtitleParts.join(" - ");
  const titleHTML = `<h1>${title}</h1>`;
  const subtitleHTML = `<h3>${subtitle}</h3>`;

  return `${titleHTML}${subtitleHTML}`;
}

class Viewer extends Component<Elements> {
  combo?: Combo;
  talents: TTalentsDisplay;

  constructor() {
    super({
      elements: {
        scrollPanel: "ViewerScrollPanel",
        propertiesSection: "ViewerPropertiesSection",
        titleLabel: "ViewerTitle",
        descriptionLabel: "ViewerDescription",
        sequence: "ViewerSequence",
        talents: "ViewerTalents",
        orbQuas: "ViewerOrbQuas",
        orbQuasLabel: "ViewerOrbQuasLabel",
        orbWex: "ViewerOrbWex",
        orbWexLabel: "ViewerOrbWexLabel",
        orbExort: "ViewerOrbExort",
        orbExortLabel: "ViewerOrbExortLabel",
      },
      customEvents: {
        VIEWER_RENDER: "onViewerRender",
        COMBO_STARTED: "onComboStarted",
      },
    });

    this.talents = this.load(this.elements.talents, Layout.ID.UITalentsDisplay);

    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted() {
    this.debug("onComboStarted()");
    this.close();
  }

  onViewerRender(payload: TCustomEvents.ViewerRender) {
    this.debug("onViewerRender()", payload);
    this.view(payload.id);
  }

  // ----- Helpers -----

  resetSelectedTalents() {
    this.talents.Input("Reset");
  }

  selectTalents() {
    if (!this.combo) {
      this.warn("tried to selectTalents() without combo");
      return;
    }

    // FIXME: extract heroID
    this.talents.Input("Select", { heroID: 74, talents: this.combo.talents });
  }

  startCombo() {
    if (!this.combo) {
      this.warn("tried to startCombo() without combo");
      return;
    }

    this.debug("startCombo()", this.combo.id);
    this.sendServer(CustomEvents.Name.COMBO_START, { id: this.combo.id });
  }

  createStepPanel(parent: Panel, step: Step) {
    const id = stepPanelID(step);
    const component = this.create(Layout.ID.ViewerComboStep, id, parent);
    const { panel } = component;

    if (!step.required) {
      panel.AddClass(Class.OptionalStep);
    }

    component.Input("SetStep", { combo: this.combo, step: step });
  }

  createPropertiesPanel() {
    const component = this.create(
      Layout.ID.ViewerProperties,
      ElemID.Properties,
      this.elements.propertiesSection
    );

    component.Input("SetCombo", this.combo);
  }

  // ----- Actions -----

  openAction() {
    return new Sequence().RemoveClass(this.panel, Class.Closed);
  }

  closeAction() {
    return new Sequence().AddClass(this.panel, Class.Closed);
  }

  renderAction() {
    if (!this.combo) {
      return new Sequence();
    }

    return new Sequence()
      .Action(this.renderInfoAction())
      .Action(this.renderPropertiesAction())
      .Action(this.renderTalentsAction())
      .Action(this.renderOrbsAction())
      .Action(this.renderSequenceAction())
      .ScrollToTop(this.elements.scrollPanel);
  }

  renderInfoAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    const title = titleHTML(this.combo.l10n.name);
    const description = L10n.comboAttrName(
      this.combo.id,
      "description",
      L10n.Key.ViewerDescriptionFallback
    );

    return new ParallelSequence()
      .SetAttribute(this.elements.titleLabel, "text", title)
      .SetAttribute(this.elements.descriptionLabel, "text", description);
  }

  renderPropertiesAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    return new Sequence()
      .RemoveChildren(this.elements.propertiesSection)
      .Function(this.createPropertiesPanel.bind(this));
  }

  renderTalentsAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    return new Sequence()
      .Function(this.resetSelectedTalents.bind(this))
      .Function(this.selectTalents.bind(this));
  }

  renderOrbsAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    const orbs: string[] = _.map(this.combo.orbs, _.toString);

    return new ParallelSequence()
      .SetAttribute(this.elements.orbQuasLabel, "text", orbs[0])
      .SetAttribute(this.elements.orbWexLabel, "text", orbs[1])
      .SetAttribute(this.elements.orbExortLabel, "text", orbs[2]);
  }

  renderSequenceAction() {
    if (!this.combo) {
      return new NoopAction();
    }

    const actions = _.map(this.combo.sequence, (step) =>
      this.createStepPanelAction(this.elements.sequence, step)
    );

    return new Sequence().RemoveChildren(this.elements.sequence).Action(...actions);
  }

  createStepPanelAction(parent: Panel, step: Step) {
    return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
  }

  // ----- Action runners -----

  view(id: ComboID) {
    this.combo = COMBOS.get(id);

    if (!this.combo) {
      this.warn("tried to view() an invalid combo", { id });
      return;
    }

    const seq = new Sequence().Action(this.renderAction()).Action(this.openAction());

    this.debugFn(() => ["view()", { id, actions: seq.size() }]);

    seq.Run();
  }

  close() {
    this.closeAction().Run();
  }

  // ----- UI methods -----

  Reload() {
    this.debug("Reload()");
    this.renderAction().Run();
  }

  Close() {
    this.close();
  }

  Play() {
    this.startCombo();
  }

  ShowOrbTooltip(orb: OrbName) {
    if (!this.combo) {
      this.warn("tried to ShowOrbTooltip() without combo");
      return;
    }

    const orbLevel = this.combo.orbsByName[orb];
    const elem = this.elements[orbAttrName(orb)];

    this.showAbilityTooltip(elem, elem.abilityname, { level: orbLevel });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new Viewer();

export type { Viewer };
