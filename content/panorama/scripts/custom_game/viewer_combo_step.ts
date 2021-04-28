import { ComboStep, Inputs as BaseInputs, Outputs as BaseOutputs } from "./combo_step";
import { comboKey, localizeFallback } from "./lib/l10n";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  description: LabelPanel;
}

const L10N_FALLBACK_IDS = {
  description: "invokation_viewer_step_description_lorem",
};

export class ViewerComboStep extends ComboStep {
  #elements: Elements;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      description: "description",
    });
  }

  onStepChange(): void {
    if (this.combo == null) {
      this.warn("ViewerComboStep.onStepChange called without combo");
      return;
    }

    if (this.step == null) {
      this.warn("ViewerComboStep.onStepChange called without step");
      return;
    }

    const descriptionL10nKey = comboKey(this.combo, String(this.step.index));

    this.#elements.description.text = localizeFallback(
      descriptionL10nKey,
      L10N_FALLBACK_IDS.description
    );
  }
}

//   context.comboStep = new ViewerComboStep();
// })(GameUI.CustomUIConfig(), this);
