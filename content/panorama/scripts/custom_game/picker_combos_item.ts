import { snakeCase } from "lodash";
import type { Combo, ComboID } from "./lib/combo";
import { TraitProperty } from "./lib/combo";
import { Component } from "./lib/component";
import { COMPONENTS } from "./lib/const/component";
import { Action, ParallelSequence, SerialSequence } from "./lib/sequence";

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

export class PickerCombosItem extends Component {
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
      prefix = `${snakeCase(trait)}_`;
  }

  return `${prefix}${value}`;
}

//   context.combosItem = new PickerCombosItem();
// })(GameUI.CustomUIConfig(), this);
