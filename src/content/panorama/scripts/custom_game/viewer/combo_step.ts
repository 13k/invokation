import * as l10n from "@invokation/panorama-lib/l10n";

import type { ComboStepElements } from "../combo_step";
import { ComboStep } from "../combo_step";

export interface ViewerComboStepElements extends ComboStepElements {
  descriptionLabel: LabelPanel;
}

export type { ViewerComboStep };

class ViewerComboStep extends ComboStep<ViewerComboStepElements> {
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

    this.elements.descriptionLabel.text = l10n.comboAttrName(
      this.combo.id,
      this.step.id,
      l10n.Key.ViewerStepDescriptionFallback,
    );
  }
}

(() => {
  new ViewerComboStep();
})();
