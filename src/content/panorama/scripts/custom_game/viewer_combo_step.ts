// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace components {
    export namespace ViewerComboStep {
      const { l10n } = GameUI.CustomUIConfig().invk;

      import ComboStep = invk.components.ComboStep.ComboStep;

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
            panelEvents: {
              button: {
                onmouseover: () => this.ShowTooltip(),
                onmouseout: () => this.HideTooltip(),
              },
            },
          });
        }

        protected override onStepChange(): void {
          if (this.combo == null || this.step == null) {
            this.warn("Received onStepChange() without combo or step");
            return;
          }

          this.elements.descriptionLabel.text = l10n.comboAttrName(
            this.combo.id,
            this.step.id,
            l10n.Key.ViewerStepDescriptionFallback,
          );
        }
      }

      export const component = new ViewerComboStep();
    }
  }
}
