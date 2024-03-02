// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace Viewer {
      const {
        l10n,
        layout,
        combo: { OrbName },
        custom_events: { CustomGameEvent, GameEvent },
        dota2: { invoker: Invoker },
        sequence: { Sequence, ParallelSequence, RunFunctionAction, NoopAction },
        singleton: { COMBOS },
        util: { capitalize },
      } = GameUI.CustomUIConfig().invk;

      import Combo = invk.combo.Combo;
      import ComboID = invk.combo.ComboID;
      import Step = invk.combo.Step;

      import Component = invk.component.Component;
      import TalentsDisplay = invk.components.ui.talents_display.TalentsDisplay;

      export interface Elements extends component.Elements {
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

      enum PanelID {
        Properties = "ViewerProperties",
      }

      enum CssClass {
        Closed = "Hide",
        OptionalStep = "ComboStepOptional",
      }

      export class Viewer extends Component<Elements> {
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
              [GameEvent.VIEWER_RENDER]: (payload) => this.onViewerRender(payload),
              [CustomGameEvent.COMBO_STARTED]: (payload) => this.onComboStarted(payload),
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

          this.talents = this.load(this.elements.talents, layout.LayoutID.UITalentsDisplay);

          this.debug("init");
        }

        // --- Event handlers -----

        onComboStarted(payload: NetworkedData<custom_events.ComboStarted>) {
          this.debug("onComboStarted()", payload);
          this.close();
        }

        onViewerRender(payload: NetworkedData<custom_events.ViewerRender>) {
          this.debug("onViewerRender()", payload);
          this.view(payload.id);
        }

        // ----- Helpers -----

        resetSelectedTalents() {
          this.talents.input("Reset", undefined);
        }

        selectTalents() {
          if (this.combo == null) {
            this.warn("Tried to selectTalents() without combo");
            return;
          }

          this.talents.input("Select", { heroID: Invoker.HERO_ID, talents: this.combo.talents });
        }

        startCombo() {
          if (this.combo == null) {
            this.warn("Tried to startCombo() without combo");
            return;
          }

          this.debug("startCombo()", this.combo.id);
          this.sendServer(CustomGameEvent.COMBO_START, { id: this.combo.id });
        }

        createStepPanel(parent: Panel, step: Step) {
          if (this.combo == null) {
            throw new Error("Tried to createStepPanel() without combo");
          }

          const id = stepPanelID(step);
          const component = this.create(layout.LayoutID.ViewerComboStep, id, parent);
          const { panel } = component;

          if (!step.required) {
            panel.AddClass(CssClass.OptionalStep);
          }

          component.input("SetStep", { combo: this.combo, step: step });
        }

        createPropertiesPanel() {
          if (this.combo == null) {
            throw new Error("Tried to createPropertiesPanel() without combo");
          }

          const component = this.create(
            layout.LayoutID.ViewerProperties,
            PanelID.Properties,
            this.elements.propertiesSection,
          );

          component.input("SetCombo", this.combo);
        }

        // ----- Actions -----

        openAction() {
          return new Sequence().RemoveClass(this.panel, CssClass.Closed);
        }

        closeAction() {
          return new Sequence().AddClass(this.panel, CssClass.Closed);
        }

        renderAction() {
          if (this.combo == null) {
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
          if (this.combo == null) {
            return new NoopAction();
          }

          const title = titleHTML(this.combo.l10n.name);
          const description = l10n.comboAttrName(
            this.combo.id,
            "description",
            l10n.Key.ViewerDescriptionFallback,
          );

          return new ParallelSequence()
            .SetAttribute(this.elements.titleLabel, "text", title)
            .SetAttribute(this.elements.descriptionLabel, "text", description);
        }

        renderPropertiesAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new Sequence()
            .RemoveChildren(this.elements.propertiesSection)
            .Function(this.createPropertiesPanel.bind(this));
        }

        renderTalentsAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new Sequence()
            .Function(this.resetSelectedTalents.bind(this))
            .Function(this.selectTalents.bind(this));
        }

        renderOrbsAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          const orbs = this.combo.orbs.map((n) => n.toString()) as [string, string, string];

          return new ParallelSequence()
            .SetAttribute(this.elements.orbQuasLabel, "text", orbs[0])
            .SetAttribute(this.elements.orbWexLabel, "text", orbs[1])
            .SetAttribute(this.elements.orbExortLabel, "text", orbs[2]);
        }

        renderSequenceAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          const actions = this.combo.sequence.map((step) =>
            this.createStepPanelAction(this.elements.sequence, step),
          );

          return new Sequence().RemoveChildren(this.elements.sequence).Action(...actions);
        }

        createStepPanelAction(parent: Panel, step: Step) {
          return new RunFunctionAction(this.createStepPanel.bind(this), parent, step);
        }

        // ----- Action runners -----

        view(id: ComboID) {
          this.combo = COMBOS.get(id);

          if (this.combo == null) {
            this.warn("Tried to view() an invalid combo", { id });
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

        ShowOrbTooltip(orb: combo.OrbName) {
          if (this.combo == null) {
            this.warn("Tried to ShowOrbTooltip() without combo");
            return;
          }

          const orbLevel = this.combo.orbsByName[orb];
          const elem = this.elements[orbAttrName(orb)];

          this.showAbilityTooltip(elem, elem.abilityname, { level: orbLevel });
        }
      }

      const stepPanelID = (step: Step) => `combo_step_${step.id}_${step.name}`;

      const orbAttrName = <K extends combo.OrbName>(orb: K): `orb${Capitalize<K>}` =>
        `orb${capitalize(orb)}`;

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
