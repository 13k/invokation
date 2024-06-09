import type { Combo, ComboId, Step } from "@invokation/panorama-lib/combo";
import { OrbName } from "@invokation/panorama-lib/combo";
import type { ComboStarted, ViewerRender } from "@invokation/panorama-lib/custom_events";
import { CustomGameEvent, GameEvent } from "@invokation/panorama-lib/custom_events";
import { HERO_ID } from "@invokation/panorama-lib/dota2/invoker";
import * as l10n from "@invokation/panorama-lib/l10n";
import type { Action } from "@invokation/panorama-lib/sequence";
import {
  AddClassAction,
  NoopAction,
  ParallelSequence,
  RemoveClassAction,
  RunFunctionAction,
  Sequence,
} from "@invokation/panorama-lib/sequence";
import { capitalize } from "@invokation/panorama-lib/util/capitalize";

import type { Elements } from "./component";
import { Component } from "./component";
import { LayoutId } from "./layout";
import type { TalentsDisplay } from "./ui/talents_display";

export interface ViewerElements extends Elements {
  scrollPanel: Panel;
  propertiesSection: Panel;
  titleLabel: LabelPanel;
  descriptionLabel: LabelPanel;
  sequence: Panel;
  talents: TalentsDisplay["panel"];
  orbQuas: AbilityImage;
  orbQuasLabel: LabelPanel;
  orbWex: AbilityImage;
  orbWexLabel: LabelPanel;
  orbExort: AbilityImage;
  orbExortLabel: LabelPanel;
  btnClose: Button;
  btnReload: Button;
  btnPlay: Button;
}

enum PanelId {
  Properties = "ViewerProperties",
}

enum CssClass {
  Closed = "Hide",
  OptionalStep = "ComboStepOptional",
}

const { COMBOS } = GameUI.CustomUIConfig().invk;

export type { Viewer };

class Viewer extends Component<ViewerElements> {
  combo: Combo | undefined;
  talents: TalentsDisplay;

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
        btnClose: "BtnClose",
        btnReload: "BtnReload",
        btnPlay: "BtnPlay",
      },
      customEvents: {
        [GameEvent.ViewerRender]: (payload) => this.onViewerRender(payload),
        [CustomGameEvent.ComboStarted]: (payload) => this.onComboStarted(payload),
      },
      panelEvents: {
        btnClose: { onactivate: () => this.onBtnClose() },
        btnReload: { onactivate: () => this.onBtnReload() },
        btnPlay: { onactivate: () => this.onBtnPlay() },
        orbQuas: { onmouseover: () => this.showOrbTooltip(OrbName.Quas) },
        orbWex: { onmouseover: () => this.showOrbTooltip(OrbName.Wex) },
        orbExort: { onmouseover: () => this.showOrbTooltip(OrbName.Exort) },
      },
    });

    this.talents = this.load(this.elements.talents, LayoutId.UiTalentsDisplay);

    this.debug("init");
  }

  // --- Event handlers -----

  onComboStarted(payload: NetworkedData<ComboStarted>): void {
    this.debug("onComboStarted()", payload);
    this.close();
  }

  onViewerRender(payload: NetworkedData<ViewerRender>): void {
    this.debug("onViewerRender()", payload);
    this.view(payload.id);
  }

  onBtnReload(): void {
    this.debug("Reload()");
    this.render();
  }

  onBtnClose(): void {
    this.close();
  }

  onBtnPlay(): void {
    this.startCombo();
  }

  // ----- Helpers -----

  resetSelectedTalents(): void {
    this.talents.sendInputs({ reset: undefined });
  }

  selectTalents(): void {
    if (this.combo == null) {
      this.warn("Tried to selectTalents() without combo");
      return;
    }

    this.talents.sendInputs({ select: { heroId: HERO_ID, talents: this.combo.talents } });
  }

  startCombo(): void {
    if (this.combo == null) {
      this.warn("Tried to startCombo() without combo");
      return;
    }

    this.debug("startCombo()", this.combo.id);
    this.sendServer(CustomGameEvent.ComboStart, { id: this.combo.id });
  }

  createStepPanel(parent: Panel, step: Step): void {
    if (this.combo == null) {
      throw new Error("Tried to createStepPanel() without combo");
    }

    const id = stepPanelId(step);
    const component = this.create(LayoutId.ViewerComboStep, id, parent);

    if (!step.required) {
      component.panel.AddClass(CssClass.OptionalStep);
    }

    component.sendInputs({ setStep: { combo: this.combo, step } });
  }

  createPropertiesPanel(): void {
    if (this.combo == null) {
      throw new Error("Tried to createPropertiesPanel() without combo");
    }

    const component = this.create(
      LayoutId.ViewerProperties,
      PanelId.Properties,
      this.elements.propertiesSection,
    );

    component.sendInputs({ setCombo: this.combo });
  }

  showOrbTooltip(orb: OrbName): void {
    if (this.combo == null) {
      this.warn("Tried to showOrbTooltip() without combo");
      return;
    }

    const orbLevel = this.combo.orbsByName[orb];
    const elem = this.elements[orbAttrName(orb)];

    this.showAbilityTooltip(elem, elem.abilityname, { level: orbLevel });
  }

  // ----- Actions -----

  openAction(): Action {
    return new RemoveClassAction(this.panel, CssClass.Closed);
  }

  closeAction(): Action {
    return new AddClassAction(this.panel, CssClass.Closed);
  }

  renderAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new Sequence()
      .add(this.renderInfoAction())
      .add(this.renderPropertiesAction())
      .add(this.renderTalentsAction())
      .add(this.renderOrbsAction())
      .add(this.renderSequenceAction())
      .scrollToTop(this.elements.scrollPanel);
  }

  renderInfoAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    const title = titleHtml(this.combo.l10n.name);
    const description = l10n.comboAttrName(
      this.combo.id,
      "description",
      l10n.Key.ViewerDescriptionFallback,
    );

    return new ParallelSequence()
      .setAttribute(this.elements.titleLabel, "text", title)
      .setAttribute(this.elements.descriptionLabel, "text", description);
  }

  renderPropertiesAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new Sequence()
      .removeChildren(this.elements.propertiesSection)
      .runFn(this.createPropertiesPanel.bind(this));
  }

  renderTalentsAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    return new Sequence()
      .runFn(this.resetSelectedTalents.bind(this))
      .runFn(this.selectTalents.bind(this));
  }

  renderOrbsAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    const orbs = this.combo.orbs.map((n) => n.toString()) as [string, string, string];

    return new ParallelSequence()
      .setAttribute(this.elements.orbQuasLabel, "text", orbs[0])
      .setAttribute(this.elements.orbWexLabel, "text", orbs[1])
      .setAttribute(this.elements.orbExortLabel, "text", orbs[2]);
  }

  renderSequenceAction(): Action {
    if (this.combo == null) {
      return new NoopAction();
    }

    const actions = this.combo.sequence.map((step) =>
      this.createStepPanelAction(this.elements.sequence, step),
    );

    return new Sequence().removeChildren(this.elements.sequence).add(...actions);
  }

  createStepPanelAction(parent: Panel, step: Step): Action {
    return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
  }

  // ----- Action runners -----

  render(): void {
    const seq = new Sequence().add(this.renderAction());

    this.debugFn(() => ["render()", { actions: seq.deepSize() }]);

    seq.run();
  }

  view(id: ComboId): void {
    this.combo = COMBOS.get(id);

    if (this.combo == null) {
      this.warn("Tried to view() an invalid combo", { id });
      return;
    }

    const seq = new Sequence().add(this.renderAction()).add(this.openAction());

    this.debugFn(() => ["view()", { id, actions: seq.deepSize() }]);

    seq.run();
  }

  close(): void {
    const seq = new Sequence().add(this.closeAction());

    this.debugFn(() => ["close()", { actions: seq.deepSize() }]);

    seq.run();
  }
}

const stepPanelId = (step: Step) => `combo_step_${step.id}_${step.name}`;
const orbAttrName = <K extends OrbName>(orb: K): `orb${Capitalize<K>}` => `orb${capitalize(orb)}`;

function titleHtml(text: string): string {
  const [title, ...subtitleParts] = text.split(" - ");
  const subtitle = subtitleParts.join(" - ");

  return `<h1>${title}</h1><h3>${subtitle}</h3>`;
}

(() => {
  new Viewer();
})();
