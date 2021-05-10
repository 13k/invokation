<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/viewer_combo_step.js" />
  </scripts>

  <styles>
    <include src="file://{resources}/components/viewer_combo_step.css" />
  </styles>

  <Panel class="root">
    <Button id="ability-button" onmouseover="comboStep.ShowTooltip()" onmouseout="comboStep.HideTooltip()" />
    <Label id="description" html="true" hittest="false" />
  </Panel>
</root>
</layout>

<script lang="ts">
import { ComboStep, Inputs as BaseInputs, Outputs as BaseOutputs } from "../scripts/lib/combo_step";
import { comboKey, localizeFallback } from "../scripts/lib/l10n";

export type Inputs = BaseInputs;
export type Outputs = BaseOutputs;

interface Elements {
  description: LabelPanel;
}

const L10N_FALLBACK_IDS = {
  description: "invokation_viewer_step_description_lorem",
};

export default class ViewerComboStep extends ComboStep {
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

global.comboStep = new ViewerComboStep();
</script>

<style lang="scss">
@use "../styles/variables";

.root {
  flow-children: right;
  height: fit-children;
  padding: 8px;
}

#ability-button {
  width: 48px;
  opacity-mask: variables.$mask_soft_edge_box;
  border: 4px solid variables.$color_gold;
}

.optional #ability-button {
  wash-color: #666e;
  border: 4px solid #000;
}

#ability-image {
  vertical-align: center;
}

#description {
  width: fill-parent-flow(1);
  margin-left: 8px;
  color: #3c1b18;
  font-weight: semi-bold;
  font-size: 18px;
  vertical-align: center;
}
</style>
