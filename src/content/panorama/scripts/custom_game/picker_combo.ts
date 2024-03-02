// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace PickerCombo {
      const {
        combo: { Property },
        sequence: { Sequence, ParallelSequence, NoopAction },
        util: { snakeCase },
      } = GameUI.CustomUIConfig().invk;

      import Combo = invk.combo.Combo;
      import ComboID = invk.combo.ComboID;
      import Component = invk.component.Component;
      import Properties = invk.combo.Properties;

      export interface Elements extends component.Elements {
        titleLabel: LabelPanel;
        heroLevelLabel: LabelPanel;
        damageRating: Panel;
        difficultyRating: Panel;
        btnShowDetails: Button;
        btnPlay: Button;
      }

      export interface Inputs extends component.Inputs {
        SetCombo: Combo;
        SetFinished: undefined;
        UnsetFinished: undefined;
      }

      export interface Outputs extends component.Outputs {
        OnPlay: { id: ComboID };
        OnShowDetails: { id: ComboID };
      }

      enum CssClass {
        Finished = "PickerComboFinished",
      }

      enum DVar {
        HeroLevel = "hero_level",
        Specialty = "specialty",
        Stance = "stance",
        DamageRating = "damage_rating",
        DifficultyRating = "difficulty_rating",
      }

      export class PickerCombo extends Component<Elements, Inputs, Outputs> {
        combo: Combo | undefined;

        constructor() {
          super({
            elements: {
              titleLabel: "PickerComboTitle",
              heroLevelLabel: "PickerComboHeroLevelLabel",
              damageRating: "PickerComboDamageRating",
              difficultyRating: "PickerComboDifficultyRating",
              btnShowDetails: "BtnShowDetails",
              btnPlay: "BtnPlay",
            },
            panelEvents: {
              btnShowDetails: { onactivate: () => this.ShowDetails() },
              btnPlay: { onactivate: () => this.Play() },
            },
            inputs: {
              SetCombo: (payload) => this.setCombo(payload),
              SetFinished: (payload) => this.onSetFinished(payload),
              UnsetFinished: (payload) => this.onUnsetFinished(payload),
            },
          });
        }

        // --- Inputs ---

        setCombo(payload: Inputs["SetCombo"]) {
          this.combo = payload;

          this.render();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSetFinished(_payload: Inputs["SetFinished"]) {
          this.panel.AddClass(CssClass.Finished);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onUnsetFinished(_payload: Inputs["UnsetFinished"]) {
          this.panel.RemoveClass(CssClass.Finished);
        }

        // --- Actions ---

        setVariablesAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .SetDialogVariableInt(this.panel, DVar.HeroLevel, this.combo.heroLevel)
            .SetDialogVariable(this.panel, DVar.Specialty, this.combo.l10n.specialty)
            .SetDialogVariable(this.panel, DVar.Stance, this.combo.l10n.stance)
            .SetDialogVariable(this.panel, DVar.DamageRating, this.combo.l10n.damageRating)
            .SetDialogVariable(this.panel, DVar.DifficultyRating, this.combo.l10n.difficultyRating);
        }

        setAttributesAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .SetAttribute(this.elements.titleLabel, "text", this.combo.l10n.name)
            .SetAttribute(this.elements.heroLevelLabel, "text", this.combo.heroLevel.toString());
        }

        setClassesAction() {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .AddClass(this.panel, propertyCssClass(Property.Specialty, this.combo.specialty))
            .AddClass(this.panel, propertyCssClass(Property.Stance, this.combo.stance))
            .AddClass(
              this.elements.damageRating,
              propertyCssClass(Property.DamageRating, this.combo.damageRating),
            )
            .AddClass(
              this.elements.difficultyRating,
              propertyCssClass(Property.DifficultyRating, this.combo.difficultyRating),
            );
        }

        // ----- Action Runners -----

        render() {
          if (this.combo == null) {
            this.warn("Tried to render() without combo");
            return;
          }

          const { id } = this.combo;
          const seq = new Sequence()
            .Action(this.setVariablesAction())
            .Action(this.setAttributesAction())
            .Action(this.setClassesAction());

          this.debugFn(() => ["render()", { id, actions: seq.size() }]);

          seq.Run();
        }

        ShowDetails() {
          if (this.combo == null) {
            this.warn("Tried to ShowDetails() without combo");
            return;
          }

          const payload = { id: this.combo.id };

          this.debug("ShowDetails()", payload);
          this.output("OnShowDetails", payload);
        }

        Play() {
          if (this.combo == null) {
            this.warn("Tried to Play() without combo");
            return;
          }

          const payload = { id: this.combo.id };

          this.debug("Play()", payload);
          this.output("OnPlay", payload);
        }
      }

      const propertyCssClass = <K extends keyof Properties>(
        prop: K,
        value: Properties[K],
      ): string => {
        let baseClass: string;

        switch (prop) {
          case Property.DamageRating:
          case Property.DifficultyRating:
            baseClass = "rating";
            break;
          default:
            baseClass = snakeCase(prop);
        }

        return `${baseClass}_${value}`;
      };

      export const component = new PickerCombo();
    }
  }
}
