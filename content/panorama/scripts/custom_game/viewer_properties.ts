// const { Component } = context;
// const { Sequence, ParallelSequence } = global.Sequence;

import { Component } from "./lib/component";

const DIALOG_VARS = {
  HERO_LEVEL: "hero_level",
  SPECIALTY: "specialty",
  STANCE: "stance",
  DAMAGE_RATING: "damage_rating",
  DIFFICULTY_RATING: "difficulty_rating",
};

const ratingCssClass = (value) => `rating_${value}`;

class ViewerProperties extends Component {
  constructor() {
    super({
      elements: {
        heroLevelLabel: "hero-level-label",
        specialtyLabel: "specialy-label",
        stanceLabel: "stance-label",
        damageRating: "damage-rating",
        difficultyRating: "difficulty-rating",
      },
      inputs: {
        SetCombo: "setCombo",
      },
    });

    this.debug("init");
  }

  setCombo(combo) {
    this.combo = combo;
    this.render();
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
      .SetText(this.$heroLevelLabel, String(this.combo.heroLevel))
      .SetText(this.$specialtyLabel, this.combo.l10n.specialty)
      .SetText(this.$stanceLabel, this.combo.l10n.stance);
  }

  setClassesAction() {
    return new ParallelSequence()
      .AddClass(this.$damageRating, ratingCssClass(this.combo.damageRating))
      .AddClass(this.$difficultyRating, ratingCssClass(this.combo.difficultyRating));
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
}

//   context.viewerProperties = new ViewerProperties();
// })(GameUI.CustomUIConfig(), this);
