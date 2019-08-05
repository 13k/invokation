"use strict";

(function(global, context) {
  var Sequence = global.Sequence.Sequence;
  var CreateComponent = context.CreateComponent;

  var PickerCombo = CreateComponent({
    constructor: function PickerCombo() {
      PickerCombo.super.call(this, {
        elements: {
          titleLabel: "Title",
          heroLevelLabel: "HeroLevelLabel",
          damageRatingButton: "DamageRating",
          difficultyRatingButton: "DifficultyRating",
        },
        inputs: {
          SetCombo: "setCombo",
        },
      });
    },

    setCombo: function(combo) {
      this.combo = combo;

      var specialtyClass = "specialty_" + combo.specialty;
      var stanceClass = "stance_" + combo.stance;
      var damageClass = "rating_" + combo.damageRating.toString();
      var difficultyClass = "rating_" + combo.difficultyRating.toString();

      return new Sequence()
        .SetDialogVariable(this.$ctx, "specialty", combo.l10n.specialty)
        .SetDialogVariable(this.$ctx, "stance", combo.l10n.stance)
        .SetDialogVariable(this.$ctx, "damage_rating", combo.l10n.damageRating)
        .SetDialogVariable(this.$ctx, "difficulty_rating", combo.l10n.difficultyRating)
        .SetAttribute(this.$titleLabel, "text", combo.l10n.name)
        .SetAttribute(this.$heroLevelLabel, "text", combo.heroLevel)
        .AddClass(this.$ctx, specialtyClass)
        .AddClass(this.$ctx, stanceClass)
        .AddClass(this.$damageRatingButton, damageClass)
        .AddClass(this.$difficultyRatingButton, difficultyClass)
        .Start();
    },

    ShowDetails: function() {
      this.debug("ShowDetails()", this.combo.id);
      this.runOutput("OnShowDetails", { combo: this.combo });
    },

    Play: function() {
      this.debug("Play()", this.combo.id);
      this.runOutput("OnPlay", { combo: this.combo });
    },
  });

  context.pickerCombo = new PickerCombo();
})(GameUI.CustomUIConfig(), this);
