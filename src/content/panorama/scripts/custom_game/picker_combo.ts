namespace invk {
  export namespace Components {
    export namespace PickerCombo {
      const {
        Combo: { Property },
        Sequence: { Sequence, ParallelSequence, NoopAction },
        Util: { snakeCase },
      } = GameUI.CustomUIConfig().invk;

      import Action = invk.Sequence.Action;
      import Combo = invk.Combo.Combo;
      import ComboId = invk.Combo.ComboId;
      import Component = invk.Component.Component;
      import Properties = invk.Combo.Properties;

      export interface Elements extends Component.Elements {
        titleLabel: LabelPanel;
        heroLevelLabel: LabelPanel;
        damageRating: Panel;
        difficultyRating: Panel;
        btnShowDetails: Button;
        btnPlay: Button;
      }

      export interface Inputs extends Component.Inputs {
        setCombo: Combo;
        setFinished: undefined;
        unsetFinished: undefined;
      }

      export interface Outputs extends Component.Outputs {
        onPlay: { id: ComboId };
        onShowDetails: { id: ComboId };
      }

      enum CssClass {
        Finished = "PickerComboFinished",
      }

      enum DialogVar {
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
              btnShowDetails: { onactivate: () => this.onBtnShowDetails() },
              btnPlay: { onactivate: () => this.onBtnPlay() },
            },
            inputs: {
              setCombo: (payload) => this.setCombo(payload),
              setFinished: (payload) => this.onSetFinished(payload),
              unsetFinished: (payload) => this.onUnsetFinished(payload),
            },
          });
        }

        // ----- Event handlers -----

        onBtnShowDetails(): void {
          if (this.combo == null) {
            this.warn("Tried to ShowDetails() without combo");
            return;
          }

          const payload = { id: this.combo.id };

          this.debug("ShowDetails()", payload);
          this.outputs({ onShowDetails: payload });
        }

        onBtnPlay(): void {
          if (this.combo == null) {
            this.warn("Tried to Play() without combo");
            return;
          }

          const payload = { id: this.combo.id };

          this.debug("Play()", payload);
          this.outputs({ onPlay: payload });
        }

        // ----- I/O -----

        setCombo(payload: Inputs["setCombo"]): void {
          this.combo = payload;

          this.render();
        }

        onSetFinished(_payload: Inputs["setFinished"]): void {
          this.panel.AddClass(CssClass.Finished);
        }

        onUnsetFinished(_payload: Inputs["unsetFinished"]): void {
          this.panel.RemoveClass(CssClass.Finished);
        }

        // ----- Actions -----

        setVariablesAction(): Action {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .setDialogVariableInt(this.panel, DialogVar.HeroLevel, this.combo.heroLevel)
            .setDialogVariable(this.panel, DialogVar.Specialty, this.combo.l10n.specialty)
            .setDialogVariable(this.panel, DialogVar.Stance, this.combo.l10n.stance)
            .setDialogVariable(this.panel, DialogVar.DamageRating, this.combo.l10n.damageRating)
            .setDialogVariable(
              this.panel,
              DialogVar.DifficultyRating,
              this.combo.l10n.difficultyRating,
            );
        }

        setAttributesAction(): Action {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .setAttribute(this.elements.titleLabel, "text", this.combo.l10n.name)
            .setAttribute(this.elements.heroLevelLabel, "text", this.combo.heroLevel.toString());
        }

        setClassesAction(): Action {
          if (this.combo == null) {
            return new NoopAction();
          }

          return new ParallelSequence()
            .addClass(this.panel, propertyCssClass(Property.Specialty, this.combo.specialty))
            .addClass(this.panel, propertyCssClass(Property.Stance, this.combo.stance))
            .addClass(
              this.elements.damageRating,
              propertyCssClass(Property.DamageRating, this.combo.damageRating),
            )
            .addClass(
              this.elements.difficultyRating,
              propertyCssClass(Property.DifficultyRating, this.combo.difficultyRating),
            );
        }

        // ----- Action Runners -----

        render(): void {
          if (this.combo == null) {
            this.warn("Tried to render() without combo");
            return;
          }

          const { id } = this.combo;
          const seq = new Sequence()
            .add(this.setVariablesAction())
            .add(this.setAttributesAction())
            .add(this.setClassesAction());

          this.debugFn(() => ["render()", { id, actions: seq.deepSize() }]);

          seq.run();
        }
      }

      const propertyCssClass = <K extends keyof Properties>(
        prop: K,
        value: Properties[K],
      ): string => {
        let baseClass: string;

        switch (prop) {
          case Property.DamageRating:
          case Property.DifficultyRating: {
            baseClass = "rating";
            break;
          }
          default:
            baseClass = snakeCase(prop);
        }

        return `${baseClass}_${value}`;
      };

      export const component = new PickerCombo();
    }
  }
}
