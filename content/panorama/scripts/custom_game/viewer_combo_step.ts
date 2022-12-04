import type * as CS from "./combo_step";

export interface Elements extends CS.Elements {
  descriptionLabel: LabelPanel;
}

const { L10n } = GameUI.CustomUIConfig();
const { ComboStep } = this as unknown as CS.Context;

class ViewerComboStep extends ComboStep<Elements> {
  constructor() {
    super({
      elements: {
        descriptionLabel: "ViewerComboStepDescription",
      },
    });
  }

  onStepChange() {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const component = new ViewerComboStep();

export type { ViewerComboStep };
