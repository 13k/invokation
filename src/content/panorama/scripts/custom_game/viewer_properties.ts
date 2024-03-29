// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace ViewerProperties {
      export interface Elements extends Component.Elements {
        heroLevelLabel: LabelPanel;
        specialtyLabel: LabelPanel;
        stanceLabel: LabelPanel;
        damageRating: Panel;
        difficultyRating: Panel;
      }

      export interface Inputs extends Component.Inputs {
        SetCombo: Combo.Combo;
      }

      export type Outputs = never;
      export type Params = never;

      const {
        Sequence: { Sequence, ParallelSequence, NoopAction },
        Vendor: { lodash: _ },
      } = GameUI.CustomUIConfig().invk;

      enum DVar {
        HeroLevel = "hero_level",
        Specialty = "specialty",
        Stance = "stance",
        DamageRating = "damage_rating",
        DifficultyRating = "difficulty_rating",
      }

      const ratingCssClass = (value: number) => `rating_${value}`;

      export class ViewerProperties extends Component.Component<Elements, Inputs, Outputs, Params> {
        combo?: Combo.Combo;

        constructor() {
          super({
            elements: {
              heroLevelLabel: "ViewerPropertiesHeroLevelLabel",
              specialtyLabel: "ViewerPropertiesSpecialtyLabel",
              stanceLabel: "ViewerPropertiesStanceLabel",
              damageRating: "ViewerPropertiesDamageRating",
              difficultyRating: "ViewerPropertiesDifficultyRating",
            },
            inputs: {
              SetCombo: (payload: Inputs["SetCombo"]) => this.setCombo(payload),
            },
          });

          this.debug("init");
        }

        setCombo(payload: Inputs["SetCombo"]) {
          this.combo = payload;

          this.render();
        }

        // --- Actions ---

        setVariablesAction() {
          if (!this.combo) {
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
          if (!this.combo) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .SetAttribute(this.elements.heroLevelLabel, "text", _.toString(this.combo.heroLevel))
            .SetAttribute(this.elements.specialtyLabel, "text", this.combo.l10n.specialty)
            .SetAttribute(this.elements.stanceLabel, "text", this.combo.l10n.stance);
        }

        setClassesAction() {
          if (!this.combo) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .AddClass(this.elements.damageRating, ratingCssClass(this.combo.damageRating))
            .AddClass(this.elements.difficultyRating, ratingCssClass(this.combo.difficultyRating));
        }

        // ----- Action Runners -----

        render() {
          if (!this.combo) {
            this.warn("tried to render() without combo");
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
      }

      export const component = new ViewerProperties();
    }
  }
}
