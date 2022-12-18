namespace invk {
  export namespace Components {
    export namespace ViewerComboStep {
      export interface Elements extends ComboStep.Elements {
        descriptionLabel: LabelPanel;
      }

      export type Inputs = ComboStep.Inputs;
      export type Outputs = never;

      const { L10n } = GameUI.CustomUIConfig().invk;

      export class ViewerComboStep extends ComboStep.ComboStep<Elements, Inputs, Outputs> {
        constructor() {
          super({
            elements: {
              ...ComboStep.DEFAULT_ELEMENTS,
              descriptionLabel: "ViewerComboStepDescription",
            },
          });
        }

        override onStepChange() {
          if (!this.combo || !this.step) {
            this.warn("received onStepChange() without combo or step");
            return;
          }

          this.elements.descriptionLabel.text = L10n.comboAttrName(
            this.combo.id,
            this.step.id,
            L10n.Key.ViewerStepDescriptionFallback
          );
        }
      }

      export const component = new ViewerComboStep();
    }
  }
}