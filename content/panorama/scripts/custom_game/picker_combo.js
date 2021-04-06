"use strict";

((global, context) => {
  const { Component } = context;
  const { lodash: _ } = global;
  const { Sequence, ParallelSequence } = global.Sequence;

  const CLASSES = {
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

  class PickerCombo extends Component {
    constructor() {
      super({
        elements: {
          titleLabel: "title",
          heroLevelLabel: "hero-level-label",
          damageRating: "damage-rating",
          difficultyRating: "difficulty-rating",
        },
        inputs: {
          SetCombo: "setCombo",
          SetFinished: "onSetFinished",
          UnsetFinished: "onUnsetFinished",
        },
      });
    }

    // --- Inputs ---

    setCombo(combo) {
      this.combo = combo;
      this.render();
    }

    onSetFinished() {
      this.$ctx.AddClass(CLASSES.FINISHED);
    }

    onUnsetFinished() {
      this.$ctx.RemoveClass(CLASSES.FINISHED);
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
        .SetAttribute(this.$titleLabel, "text", this.combo.l10n.name)
        .SetAttribute(this.$heroLevelLabel, "text", String(this.combo.heroLevel));
    }

    setClassesAction() {
      const specialtyClass = propertyCssClass("specialty", this.combo.specialty);
      const stanceClass = propertyCssClass("stance", this.combo.stance);
      const damageRatingClass = propertyCssClass("damageRating", this.combo.damageRating);
      const difficultyRatingClass = propertyCssClass(
        "difficultyRating",
        this.combo.difficultyRating
      );

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
        .Action(this.setAttributesAction())
        .Action(this.setClassesAction());

      this.debugFn(() => ["render()", { id: this.combo.id, actions: seq.size() }]);

      return seq.Start();
    }

    ShowDetails() {
      this.debug("ShowDetails()", this.combo.id);
      this.runOutput("OnShowDetails", { id: this.combo.id });
    }

    Play() {
      this.debug("Play()", this.combo.id);
      this.runOutput("OnPlay", { id: this.combo.id });
    }
  }

  context.pickerCombo = new PickerCombo();
})(GameUI.CustomUIConfig(), this);
