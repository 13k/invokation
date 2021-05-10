<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/challenge_combo_step.js" />
  </scripts>

  <styles>
    <include src="file://{resources}/components/challenge_combo_step.css" />
  </styles>

  <Panel class="root">
    <Button id="ability-button" />
  </Panel>
</root>
</layout>

<script lang="ts">
import { ComboStep, Inputs as BaseInputs, Outputs as BaseOutputs } from "../scripts/lib/combo_step";
import { COMPONENTS } from "../scripts/lib/const/component";

export interface Inputs extends BaseInputs {
  [INPUTS.BUMP]: never;
  [INPUTS.SET_ACTIVE]: never;
  [INPUTS.UNSET_ACTIVE]: never;
  [INPUTS.SET_ERROR]: never;
  [INPUTS.UNSET_ERROR]: never;
}

export type Outputs = BaseOutputs;

const { inputs: INPUTS } = COMPONENTS.CHALLENGE_COMBO_STEP;

const CLASSES = {
  ACTIVE: "active",
  ERROR: "error",
  BUMP: "bump",
};

export default class ChallengeComboStep extends ComboStep {
  constructor() {
    super();

    this.registerInputs({
      [INPUTS.BUMP]: this.onBump,
      [INPUTS.SET_ACTIVE]: this.onSetActive,
      [INPUTS.UNSET_ACTIVE]: this.onUnsetActive,
      [INPUTS.SET_ERROR]: this.onSetError,
      [INPUTS.UNSET_ERROR]: this.onUnsetError,
    });
  }

  onBump(): void {
    this.ctx.RemoveClass(CLASSES.BUMP);
    this.ctx.AddClass(CLASSES.BUMP);
  }

  onSetActive(): void {
    this.ctx.AddClass(CLASSES.ACTIVE);
  }

  onUnsetActive(): void {
    this.ctx.RemoveClass(CLASSES.ACTIVE);
  }

  onSetError(): void {
    this.ctx.RemoveClass(CLASSES.ERROR);
    this.ctx.AddClass(CLASSES.ERROR);
  }

  onUnsetError(): void {
    this.ctx.RemoveClass(CLASSES.ERROR);
  }
}

global.comboStep = new ChallengeComboStep();
</script>

<style lang="scss">
@use "../styles/variables";

.root {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  background-color: #241200;
  border: 3px solid variables.$color_gold;
  transition-timing-function: ease-in-out;
  transition-duration: 0.3s;
  transition-property: width, height, wash-color, opacity, pre-transform-scale2d;
  animation-duration: 0.31s;
  animation-timing-function: ease-in;
  animation-iteration-count: 1;
  align: center center;
  pre-transform-scale2d: 0;
  opacity-mask: variables.$mask_soft_edge_box;
  wash-color: #666e;
}

.root.invocation {
  width: 40px;
  height: 40px;
}

.root.optional {
  border: 3px solid #666;
}

.root.bump {
  pre-transform-scale2d: 1;
  transition-delay: 0s;
  transition-duration: 0.175s, 0.12s;
  animation-name: step-bump;
  animation-delay: 0s;
}

.root.active {
  width: 72px;
  height: 72px;
  wash-color: #ffff;
}

.root.error {
  wash-color: #f00e;
}

#ability-button {
  width: 100%;
  height: 100%;
}

#ability-image {
  vertical-align: center;
}

@keyframes step-bump {
  0% {
    pre-transform-scale2d: 0;
    opacity: 0;
  }

  50% {
    pre-transform-scale2d: 1.25;
    opacity: 1;
  }

  100% {
    pre-transform-scale2d: 1;
    opacity: 1;
  }
}
</style>
