// const { Component } = context;
// const { lodash: _ } = global;
// const { Sequence, ParallelSequence } = global.Sequence;
// const { COMPONENTS } = global.Const;

import { Component } from "./lib/component";

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

const propertyCssClass = (property, value) => {
  let baseClass;

  switch (property) {
    case "damageRating":
    case "difficultyRating":
      baseClass = "rating";
      break;
    default:
      baseClass = _.snakeCase(property);
  }

  return `${baseClass}_${value}`;
};

class PickerCombosItem extends Component {
  constructor() {
    const { inputs, outputs } = COMPONENTS.PICKER.COMBOS.COMBO_ITEM;

    super({
      elements: {
        titleLabel: "title",
        heroLevelLabel: "hero-level-label",
        damageRating: "damage-rating",
        difficultyRating: "difficulty-rating",
      },
      inputs: {
        [inputs.SET_COMBO]: "setCombo",
        [inputs.SET_SELECTED]: "onSetSelected",
        [inputs.UNSET_SELECTED]: "onUnsetSelected",
        [inputs.SET_FINISHED]: "onSetFinished",
        [inputs.UNSET_FINISHED]: "onUnsetFinished",
      },
      outputs: Object.values(outputs),
    });

    this.state = { selected: false, finished: false };
  }

  // --- Inputs ---

  setCombo(combo) {
    this.combo = combo;
    this.render();
  }

  onSetSelected() {
    this.state.selected = true;
    this.updateState();
  }

  onUnsetSelected() {
    this.state.selected = false;
    this.updateState();
  }

  onSetFinished() {
    this.state.finished = true;
    this.updateState();
  }

  onUnsetFinished() {
    this.state.finished = false;
    this.updateState();
  }

  // --- Actions ---

  setVariablesAction() {
    return new ParallelSequence()
      .SetDialogVariable(this.$ctx, DIALOG_VARS.HERO_LEVEL, this.combo.heroLevel)
      .SetDialogVariable(this.$ctx, DIALOG_VARS.SPECIALTY, this.combo.l10n.specialty)
      .SetDialogVariable(this.$ctx, DIALOG_VARS.STANCE, this.combo.l10n.stance)
      .SetDialogVariable(this.$ctx, DIALOG_VARS.DAMAGE_RATING, this.combo.l10n.damageRating)
      .SetDialogVariable(
        this.$ctx,
        DIALOG_VARS.DIFFICULTY_RATING,
        this.combo.l10n.difficultyRating
      );
  }

  setPropertiesAction() {
    return new ParallelSequence()
      .SetText(this.$titleLabel, this.combo.l10n.name)
      .SetText(this.$heroLevelLabel, String(this.combo.heroLevel));
  }

  setClassesAction() {
    const specialtyClass = propertyCssClass("specialty", this.combo.specialty);
    const stanceClass = propertyCssClass("stance", this.combo.stance);
    const damageRatingClass = propertyCssClass("damageRating", this.combo.damageRating);
    const difficultyRatingClass = propertyCssClass("difficultyRating", this.combo.difficultyRating);

    return new ParallelSequence()
      .AddClass(this.$ctx, specialtyClass)
      .AddClass(this.$ctx, stanceClass)
      .AddClass(this.$damageRating, damageRatingClass)
      .AddClass(this.$difficultyRating, difficultyRatingClass);
  }

  // ----- Action Runners -----

  render() {
    const seq = new Sequence()
      .Action(this.setVariablesAction())
      .Action(this.setPropertiesAction())
      .Action(this.setClassesAction());

    this.debugFn(() => ["render()", { id: this.combo.id, actions: seq.length }]);

    return seq.Start();
  }

  updateState() {
    const seq = new Sequence();

    if (this.state.selected) {
      seq.AddClass(this.$ctx, CLASSES.SELECTED);
    } else {
      seq.RemoveClass(this.$ctx, CLASSES.SELECTED);
    }

    if (this.state.finished) {
      seq.AddClass(this.$ctx, CLASSES.FINISHED);
    } else {
      seq.RemoveClass(this.$ctx, CLASSES.FINISHED);
    }

    return seq.Start();
  }

  Activate() {
    const { outputs } = COMPONENTS.PICKER.COMBOS.COMBO_ITEM;

    this.debug("Activate()", this.combo.id);

    this.runOutput(outputs.ON_ACTIVATE, { id: this.combo.id });
  }
}

//   context.combosItem = new PickerCombosItem();
// })(GameUI.CustomUIConfig(), this);
