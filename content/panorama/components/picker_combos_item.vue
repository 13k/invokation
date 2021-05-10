<layout lang="xml">
<root>
  <scripts>
    <include src="file://{resources}/components/picker_combos_item.js" />
  </scripts>

  <styles>
    <include src="s2r://panorama/styles/dotastyles.css" />

    <include src="file://{resources}/components/picker_combos_item.css" />
  </styles>

  <Panel class="root" onactivate="combosItem.Activate()">
    <Panel class="panel-title-container">
      <Button class="finished-icon" onmouseover="UIShowTextTooltip(#invokation_combo_tooltip_finished)" onmouseout="UIHideTextTooltip()" />
      <Label id="title" class="panel-title" hittest="false" />
    </Panel>

    <Panel class="info-container">
      <Button class="picker-combo-icon hero-level-icon" onmouseover="UIShowTextTooltip(#invokation_combo_tooltip_hero_level)" onmouseout="UIHideTextTooltip()">
        <Label id="hero-level-label" class="hero-level-label MonoNumbersFont" hittest="false" />
      </Button>

      <Button class="picker-combo-icon specialty-icon" onmouseover="UIShowTextTooltip(#invokation_combo_tooltip_specialty)" onmouseout="UIHideTextTooltip()" />
      <Button class="picker-combo-icon stance-icon" onmouseover="UIShowTextTooltip(#invokation_combo_tooltip_stance)" onmouseout="UIHideTextTooltip()" />

      <Panel class="ratings">
        <Panel class="LeftRightFlow">
          <Button class="attack-damage-icon" onmouseover="UIShowTextTooltip(#invokation_combo_tooltip_damage_rating)" onmouseout="UIHideTextTooltip()" />
          <Panel id="damage-rating" class="rating">
            <Panel class="rating-active" />
          </Panel>
        </Panel>

        <Panel class="LeftRightFlow">
          <Button class="difficulty-icon" onmouseover="UIShowTextTooltip(#invokation_combo_tooltip_difficulty_rating)" onmouseout="UIHideTextTooltip()" />
          <Panel id="difficulty-rating" class="rating">
            <Panel class="rating-active" />
          </Panel>
        </Panel>
      </Panel>
    </Panel>
  </Panel>
</root>
</layout>

<script lang="ts">
import { kebabCase } from "lodash";

import type { Combo, ComboID } from "../scripts/lib/combo";
import { TraitProperty } from "../scripts/lib/combo";
import { Component } from "../scripts/lib/component";
import { COMPONENTS } from "../scripts/lib/const/component";
import { Action, ParallelSequence, SerialSequence } from "../scripts/lib/sequence";

export interface Inputs {
  [INPUTS.SET_COMBO]: { combo: Combo };
}

export interface Outputs {
  [OUTPUTS.ON_ACTIVATE]: { id: ComboID };
}

interface Elements {
  titleLabel: LabelPanel;
  heroLevelLabel: LabelPanel;
  damageRating: Panel;
  difficultyRating: Panel;
}

interface State {
  selected: boolean;
  finished: boolean;
}

const { inputs: INPUTS, outputs: OUTPUTS } = COMPONENTS.PICKER_COMBOS_ITEM;

const DIALOG_VARS = {
  HERO_LEVEL: "hero_level",
  SPECIALTY: "specialty",
  STANCE: "stance",
  DAMAGE_RATING: "damage_rating",
  DIFFICULTY_RATING: "difficulty_rating",
};

const CLASSES = {
  SELECTED: "selected",
  FINISHED: "finished",
};

export default class PickerCombosItem extends Component {
  #elements: Elements;
  #state: State;
  combo?: Combo;

  constructor() {
    super();

    this.#elements = this.findAll<Elements>({
      titleLabel: "title",
      heroLevelLabel: "hero-level-label",
      damageRating: "damage-rating",
      difficultyRating: "difficulty-rating",
    });

    this.registerInputs({
      [INPUTS.SET_COMBO]: this.setCombo,
      [INPUTS.SET_SELECTED]: this.onSetSelected,
      [INPUTS.UNSET_SELECTED]: this.onUnsetSelected,
      [INPUTS.SET_FINISHED]: this.onSetFinished,
      [INPUTS.UNSET_FINISHED]: this.onUnsetFinished,
    });

    this.registerOutputs(Object.values(OUTPUTS));

    this.#state = { selected: false, finished: false };
  }

  // --- Inputs ---

  setCombo({ combo }: Inputs[typeof INPUTS.SET_COMBO]): void {
    this.combo = combo;
    this.render();
  }

  onSetSelected(): void {
    this.#state.selected = true;
    this.updateState();
  }

  onUnsetSelected(): void {
    this.#state.selected = false;
    this.updateState();
  }

  onSetFinished(): void {
    this.#state.finished = true;
    this.updateState();
  }

  onUnsetFinished(): void {
    this.#state.finished = false;
    this.updateState();
  }

  // --- Helpers ---

  hasCombo(): this is { combo: Combo } {
    return this.combo != null;
  }

  // --- Actions ---

  setVariablesAction(): Action {
    if (!this.hasCombo()) {
      throw Error("PickerCombosItem.setVariablesAction called without a combo");
    }

    return new ParallelSequence()
      .SetDialogVariable(this.ctx, DIALOG_VARS.HERO_LEVEL, String(this.combo.heroLevel))
      .SetDialogVariable(this.ctx, DIALOG_VARS.SPECIALTY, this.combo.l10n.specialty)
      .SetDialogVariable(this.ctx, DIALOG_VARS.STANCE, this.combo.l10n.stance)
      .SetDialogVariable(this.ctx, DIALOG_VARS.DAMAGE_RATING, this.combo.l10n.damageRating)
      .SetDialogVariable(this.ctx, DIALOG_VARS.DIFFICULTY_RATING, this.combo.l10n.difficultyRating);
  }

  setPropertiesAction(): Action {
    if (!this.hasCombo()) {
      throw Error("PickerCombosItem.setPropertiesAction called without a combo");
    }

    return new ParallelSequence()
      .SetText(this.#elements.titleLabel, this.combo.l10n.name)
      .SetText(this.#elements.heroLevelLabel, String(this.combo.heroLevel));
  }

  setClassesAction(): Action {
    if (!this.hasCombo()) {
      throw Error("PickerCombosItem.setClassesAction called without a combo");
    }

    const specialtyClass = propertyCssClass(TraitProperty.Specialty, this.combo.specialty);

    const stanceClass = propertyCssClass(TraitProperty.Stance, this.combo.stance);

    const damageRatingClass = propertyCssClass(
      TraitProperty.DamageRating,
      String(this.combo.damageRating)
    );

    const difficultyRatingClass = propertyCssClass(
      TraitProperty.DifficultyRating,
      String(this.combo.difficultyRating)
    );

    return new ParallelSequence()
      .AddClass(this.ctx, specialtyClass)
      .AddClass(this.ctx, stanceClass)
      .AddClass(this.#elements.damageRating, damageRatingClass)
      .AddClass(this.#elements.difficultyRating, difficultyRatingClass);
  }

  // ----- Action Runners -----

  render(): void {
    const seq = new SerialSequence()
      .Action(this.setVariablesAction())
      .Action(this.setPropertiesAction())
      .Action(this.setClassesAction());

    this.debugFn(() => ["render()", { id: this.combo?.id, actions: seq.length }]);

    seq.run();
  }

  updateState(): void {
    const seq = new SerialSequence();

    if (this.#state.selected) {
      seq.AddClass(this.ctx, CLASSES.SELECTED);
    } else {
      seq.RemoveClass(this.ctx, CLASSES.SELECTED);
    }

    if (this.#state.finished) {
      seq.AddClass(this.ctx, CLASSES.FINISHED);
    } else {
      seq.RemoveClass(this.ctx, CLASSES.FINISHED);
    }

    seq.run();
  }

  activate(): void {
    if (!this.hasCombo()) {
      throw Error("PickerCombosItem.activate called without a combo");
    }

    const payload: Outputs[typeof OUTPUTS.ON_ACTIVATE] = { id: this.combo.id };

    this.debug("activate()", payload);

    this.output(OUTPUTS.ON_ACTIVATE, payload);
  }
}

function propertyCssClass(trait: TraitProperty, value: string) {
  let prefix: string;

  switch (trait) {
    case TraitProperty.DamageRating:
    case TraitProperty.DifficultyRating:
      prefix = "rating-";
      break;
    default:
      prefix = `${kebabCase(trait)}-`;
  }

  return `${prefix}${value}`;
}

global.combosItem = new PickerCombosItem();
</script>

<style lang="scss">
@use "../styles/variables";
@use "../styles/ui";

.root {
  flow-children: down;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;

  &:hover {
    background-color: #111f;
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.5);
  }

  &.selected {
    background-color: gradient(linear, 100% 0%, 0% 0%, from(#424a4f00), to(#2a2d42ff));
  }

  &.finished {
    background-color: #7771;
  }

  &.finished:hover {
    background-color: #111f;
  }
}

.panel-title-container {
  height: fit-children;
  padding: 0;
  background-color: none;
  border: 0;
}

.panel-title {
  font-size: 14px;
  text-align: left;
  vertical-align: center;
}

.finished .panel-title {
  margin-left: 12px;
}

.finished-icon {
  width: 24px;
  height: 24px;
  vertical-align: center;
  background-image: variables.$control-icon-check-round;
  background-size: 100%;
  visibility: collapse;
  tooltip-position: right;
  tooltip-body-position: 50% 10%;
  wash-color: variables.$color-dota-plus-light-gold;
}

.finished .finished-icon {
  visibility: visible;
  wash-color: variables.$color-dota-plus-gold;
}

.info-container {
  flow-children: right;
  margin-top: 8px;
}

.picker-combo-icon {
  width: 28px;
  height: 28px;
  margin: 6px 8px;
  vertical-align: center;
  tooltip-position: right;
  tooltip-body-position: 50% 10%;
}

.specialty-icon {
  border-radius: 50%;
}

.specialty-qw .specialty-icon {
  background-color: gradient(
    linear,
    0% 0%,
    100% 100%,
    from(variables.$color-accent-quas&44),
    color-stop(0.49, variables.$color-accent-quas),
    color-stop(0.5, #000),
    color-stop(0.51, variables.$color-accent-wex),
    to(variables.$color-accent-wex&44)
  );
}

.specialty-qe .specialty-icon {
  background-color: gradient(
    linear,
    0% 0%,
    100% 100%,
    from(variables.$color-accent-quas&44),
    color-stop(0.49, variables.$color-accent-quas),
    color-stop(0.5, #000),
    color-stop(0.51, variables.$color-accent-exort),
    to(variables.$color-accent-exort&44)
  );
}

.stance-icon {
  wash-color: #888;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain;
  transition-timing-function: ease-in-out;
  transition-duration: 0.2s;
  transition-property: wash-color;
}

.stance-offensive .stance-icon {
  background-image: variables.$icon-stance-offensive;
}

.stance-defensive .stance-icon {
  background-image: variables.$icon-stance-defensive;
}

.hero-level-icon {
  width: 32px;
  height: 32px;
  background-color: #121212;
  border-radius: 50%;
}

// .root:hover .hero-level-icon {
//   box-shadow: 1px 1px 1px 1px rgba(255, 255, 255, 0.01);
// }

.hero-level-label {
  width: 14px;
  margin-top: 3px;
  color: #e7d291;
  font-weight: normal;
  font-size: 14px;
  text-align: center;
  text-overflow: shrink;
  text-shadow: 0 0 3px 3.7 #ec780e24;
  align: center center;
}

.ratings {
  flow-children: down;
  margin-left: 8px;
  vertical-align: center;
}

.ratings .attack-damage-icon {
  width: 16px;
  height: 16px;
  background-image: variables.$icon-damage-rating;
  background-size: 100%;
}

.ratings .difficulty-icon {
  width: 16px;
  height: 16px;
  background-image: variables.$icon-difficulty-rating;
  background-size: 100%;
}
</style>
