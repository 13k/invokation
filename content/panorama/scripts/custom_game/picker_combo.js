"use strict";

(function(global, context) {
  var _ = global.lodash;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var Sequence = global.Sequence.Sequence;
  var CreateComponent = context.CreateComponent;

  var CLASSES = {
    FINISHED: "PickerComboFinished",
  };

  function propertyCssClass(property, value) {
    var baseClass;

    switch (property) {
      case "damageRating":
      case "difficultyRating":
        baseClass = "rating";
        break;
      default:
        baseClass = _.snakeCase(property);
    }

    return baseClass + "_" + String(value);
  }

  var PickerCombo = CreateComponent({
    constructor: function PickerCombo() {
      PickerCombo.super.call(this, {
        elements: {
          titleLabel: "PickerComboTitle",
          heroLevelLabel: "PickerComboHeroLevelLabel",
          damageRating: "PickerComboDamageRating",
          difficultyRating: "PickerComboDifficultyRating",
        },
        inputs: {
          SetCombo: "setCombo",
          SetFinished: "onSetFinished",
          UnsetFinished: "onUnsetFinished",
        },
      });
    },

    // --- Inputs ---

    setCombo: function(combo) {
      this.combo = combo;
      this.render();
    },

    onSetFinished: function() {
      this.$ctx.AddClass(CLASSES.FINISHED);
    },

    onUnsetFinished: function() {
      this.$ctx.RemoveClass(CLASSES.FINISHED);
    },

    // --- Actions ---

    setVariablesAction: function() {
      return new ParallelSequence()
        .SetDialogVariable(this.$ctx, "hero_level", this.combo.heroLevel)
        .SetDialogVariable(this.$ctx, "specialty", this.combo.l10n.specialty)
        .SetDialogVariable(this.$ctx, "stance", this.combo.l10n.stance)
        .SetDialogVariable(this.$ctx, "damage_rating", this.combo.l10n.damageRating)
        .SetDialogVariable(this.$ctx, "difficulty_rating", this.combo.l10n.difficultyRating);
    },

    setAttributesAction: function() {
      return new ParallelSequence()
        .SetAttribute(this.$titleLabel, "text", this.combo.l10n.name)
        .SetAttribute(this.$heroLevelLabel, "text", String(this.combo.heroLevel));
    },

    setClassesAction: function() {
      var specialtyClass = propertyCssClass("specialty", this.combo.specialty);
      var stanceClass = propertyCssClass("stance", this.combo.stance);
      var damageRatingClass = propertyCssClass("damageRating", this.combo.damageRating);
      var difficultyRatingClass = propertyCssClass("difficultyRating", this.combo.difficultyRating);

      return new ParallelSequence()
        .AddClass(this.$ctx, specialtyClass)
        .AddClass(this.$ctx, stanceClass)
        .AddClass(this.$damageRating, damageRatingClass)
        .AddClass(this.$difficultyRating, difficultyRatingClass);
    },

    // ----- Action Runners -----

    render: function() {
      var seq = new Sequence()
        .Action(this.setVariablesAction())
        .Action(this.setAttributesAction())
        .Action(this.setClassesAction());

      this.debugFn(function() {
        return ["render()", { id: this.combo.id, actions: seq.size() }];
      });

      return seq.Start();
    },

    ShowDetails: function() {
      this.debug("ShowDetails()", this.combo.id);
      this.runOutput("OnShowDetails", { combo: this.combo.id });
    },

    Play: function() {
      this.debug("Play()", this.combo.id);
      this.runOutput("OnPlay", { combo: this.combo });
    },
  });

  context.pickerCombo = new PickerCombo();
})(GameUI.CustomUIConfig(), this);
