// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace Viewer {
      export interface Elements extends Component.Elements {
        scrollPanel: Panel;
        propertiesSection: Panel;
        titleLabel: LabelPanel;
        descriptionLabel: LabelPanel;
        sequence: Panel;
        talents: Components.UI.TalentsDisplay.TalentsDisplay["panel"];
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

      export type Inputs = never;
      export type Outputs = never;
      export type Params = never;

      const {
        L10n,
        Layout,
        Combo: { OrbName },
        CustomEvents: { Name: CustomEventName },
        Dota2: { Invoker },
        Sequence: { Sequence, ParallelSequence, RunFunctionAction, NoopAction },
        Static: { COMBOS },
        Vendor: { lodash: _ },
      } = GameUI.CustomUIConfig().invk;

      enum PanelID {
        Properties = "ViewerProperties",
      }

      enum CssClass {
        Closed = "Hide",
        OptionalStep = "ComboStepOptional",
      }

      export class Viewer extends Component.Component<Elements, Inputs, Outputs, Params> {
        combo?: Combo.Combo | undefined;
        talents: Components.UI.TalentsDisplay.TalentsDisplay;

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
              VIEWER_RENDER: (payload) => this.onViewerRender(payload),
              COMBO_STARTED: (payload) => this.onComboStarted(payload),
            },
            panelEvents: {
              btnClose: { onactivate: () => this.Close() },
              btnReload: { onactivate: () => this.Reload() },
              btnPlay: { onactivate: () => this.Play() },
              orbQuas: { onmouseover: () => this.ShowOrbTooltip(OrbName.Quas) },
              orbWex: { onmouseover: () => this.ShowOrbTooltip(OrbName.Wex) },
              orbExort: { onmouseover: () => this.ShowOrbTooltip(OrbName.Exort) },
            },
          });

          this.talents = this.load(this.elements.talents, Layout.ID.UITalentsDisplay);

          this.debug("init");
        }

        // --- Event handlers -----

        onComboStarted(payload: CustomEvents.ComboStarted) {
          this.debug("onComboStarted()", payload);
          this.close();
        }

        onViewerRender(payload: CustomEvents.ViewerRender) {
          this.debug("onViewerRender()", payload);
          this.view(payload.id);
        }

        // ----- Helpers -----

        resetSelectedTalents() {
          this.talents.Input("Reset", undefined);
        }

        selectTalents() {
          if (!this.combo) {
            this.warn("tried to selectTalents() without combo");
            return;
          }

          this.talents.Input("Select", { heroID: Invoker.HERO_ID, talents: this.combo.talents });
        }

        startCombo() {
          if (!this.combo) {
            this.warn("tried to startCombo() without combo");
            return;
          }

          this.debug("startCombo()", this.combo.id);
          this.sendServer(CustomEventName.COMBO_START, { id: this.combo.id });
        }

        createStepPanel(parent: Panel, step: Combo.Step) {
          if (!this.combo) {
            throw new Error(`Tried to createStepPanel() without combo`);
          }

          const id = stepPanelID(step);
          const component = this.create(Layout.ID.ViewerComboStep, id, parent);
          const { panel } = component;

          if (!step.required) {
            panel.AddClass(CssClass.OptionalStep);
          }

          component.Input("SetStep", { combo: this.combo, step: step });
        }

        createPropertiesPanel() {
          if (!this.combo) {
            throw new Error(`Tried to createPropertiesPanel() without combo`);
          }

          const component = this.create(
            Layout.ID.ViewerProperties,
            PanelID.Properties,
            this.elements.propertiesSection
          );

          component.Input("SetCombo", this.combo);
        }

        // ----- Actions -----

        openAction() {
          return new Sequence().RemoveClass(this.panel, CssClass.Closed);
        }

        closeAction() {
          return new Sequence().AddClass(this.panel, CssClass.Closed);
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

          const orbs = _.map(this.combo.orbs, _.toString) as [string, string, string];

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

        createStepPanelAction(parent: Panel, step: Combo.Step) {
          return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
        }

        // ----- Action runners -----

        view(id: Combo.ID) {
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

        ShowOrbTooltip(orb: Combo.OrbName) {
          if (!this.combo) {
            this.warn("tried to ShowOrbTooltip() without combo");
            return;
          }

          const orbLevel = this.combo.orbsByName[orb];
          const elem = this.elements[orbAttrName(orb)];

          this.showAbilityTooltip(elem, elem.abilityname, { level: orbLevel });
        }
      }

      const stepPanelID = (step: Combo.Step) => `combo_step_${step.id}_${step.name}`;

      const orbAttrName = <K extends Combo.OrbName>(orb: K): `orb${Capitalize<K>}` =>
        `orb${_.capitalize(orb)}` as `orb${Capitalize<K>}`;

      const titleHTML = (s: string) => {
        const [title, ...subtitleParts] = s.split(" - ");
        const subtitle = subtitleParts.join(" - ");
        const titleHTML = `<h1>${title}</h1>`;
        const subtitleHTML = `<h3>${subtitle}</h3>`;

        return `${titleHTML}${subtitleHTML}`;
      };

      export const component = new Viewer();
    }
  }
}
