"use strict";

((global, context) => {
  const { Component } = context;
  const { Sequence, ParallelSequence } = global.Sequence;

  const ratingCssClass = (value) => `rating_${value}`;

  class ViewerProperties extends Component {
    constructor() {
      super({
        elements: {
          heroLevelLabel: "ViewerPropertiesHeroLevelLabel",
          specialtyLabel: "ViewerPropertiesSpecialtyLabel",
          stanceLabel: "ViewerPropertiesStanceLabel",
          damageRating: "ViewerPropertiesDamageRating",
          difficultyRating: "ViewerPropertiesDifficultyRating",
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
        .SetDialogVariable(this.$ctx, "hero_level", this.combo.heroLevel)
        .SetDialogVariable(this.$ctx, "specialty", this.combo.l10n.specialty)
        .SetDialogVariable(this.$ctx, "stance", this.combo.l10n.stance)
        .SetDialogVariable(this.$ctx, "damage_rating", this.combo.l10n.damageRating)
        .SetDialogVariable(this.$ctx, "difficulty_rating", this.combo.l10n.difficultyRating);
    }

    setAttributesAction() {
      return new ParallelSequence()
        .SetAttribute(this.$heroLevelLabel, "text", String(this.combo.heroLevel))
        .SetAttribute(this.$specialtyLabel, "text", this.combo.l10n.specialty)
        .SetAttribute(this.$stanceLabel, "text", this.combo.l10n.stance);
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
        .Action(this.setAttributesAction())
        .Action(this.setClassesAction());

      this.debugFn(() => ["render()", { id: this.combo.id, actions: seq.size() }]);

      return seq.Start();
    }
  }

  context.viewerProperties = new ViewerProperties();
})(GameUI.CustomUIConfig(), this);
