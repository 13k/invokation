// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Components {
    export namespace ViewerComboStep {
      export interface Elements extends ComboStep.Elements {
        descriptionLabel: LabelPanel;
      }

      export type Inputs = ComboStep.Inputs;
      export type Outputs = never;
      export type Params = never;

      const { L10n } = GameUI.CustomUIConfig().invk;

      export class ViewerComboStep extends ComboStep.ComboStep<Elements, Inputs, Outputs, Params> {
        constructor() {
          super({
            elements: {
              button: "ComboStepIconButton",
              descriptionLabel: "ViewerComboStepDescription",
            },
            panelEvents: {
              button: {
                onmouseover: () => this.ShowTooltip(),
                onmouseout: () => this.HideTooltip(),
              },
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
