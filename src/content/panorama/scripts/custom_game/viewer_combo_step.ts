namespace invk {
  export namespace Components {
    export namespace ViewerComboStep {
      const { L10n } = GameUI.CustomUIConfig().invk;

      import ComboStep = invk.Components.ComboStep.ComboStep;

      export interface Elements extends ComboStep.Elements {
        descriptionLabel: LabelPanel;
      }

      export class ViewerComboStep extends ComboStep<Elements> {
        constructor() {
          super({
            elements: {
              button: "ComboStepIconButton",
              descriptionLabel: "ViewerComboStepDescription",
            },
          });
        }

        protected override onStepChange(): void {
          if (this.combo == null || this.step == null) {
            this.warn("Received onStepChange() without combo or step");
            return;
          }

          this.elements.descriptionLabel.text = L10n.comboAttrName(
            this.combo.id,
            this.step.id,
            L10n.Key.ViewerStepDescriptionFallback,
          );
        }
      }

      export const component = new ViewerComboStep();
    }
  }
}
