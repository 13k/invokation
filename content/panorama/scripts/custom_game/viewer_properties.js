"use strict";

(function(global, context) {
  var Sequence = global.Sequence.Sequence;
  var ParallelSequence = global.Sequence.ParallelSequence;
  var CreateComponent = context.CreateComponent;

  function ratingCssClass(value) {
    return "rating_" + String(value);
  }

  var ViewerProperties = CreateComponent({
    constructor: function ViewerProperties() {
      ViewerProperties.super.call(this, {
        elements: [
          "HeroLevelLabel",
          "SpecialtyLabel",
          "StanceLabel",
          "DamageRating",
          "DifficultyRating",
        ],
        inputs: {
          SetCombo: "setCombo",
        },
      });

      this.debug("init");
    },

    setCombo: function(combo) {
      this.combo = combo;
      this.render();
    },

    // --- Actions ---

    setVariablesAction: function() {
      return new ParallelSequence()
        .SetDialogVariable(this.$ctx, "specialty", this.combo.l10n.specialty)
        .SetDialogVariable(this.$ctx, "stance", this.combo.l10n.stance)
        .SetDialogVariable(this.$ctx, "damage_rating", this.combo.l10n.damageRating)
        .SetDialogVariable(this.$ctx, "difficulty_rating", this.combo.l10n.difficultyRating);
    },

    setAttributesAction: function() {
      return new ParallelSequence()
        .SetAttribute(this.$heroLevelLabel, "text", String(this.combo.heroLevel))
        .SetAttribute(this.$specialtyLabel, "text", this.combo.l10n.specialty)
        .SetAttribute(this.$stanceLabel, "text", this.combo.l10n.stance);
    },

    setClassesAction: function() {
      return new ParallelSequence()
        .AddClass(this.$damageRating, ratingCssClass(this.combo.damageRating))
        .AddClass(this.$difficultyRating, ratingCssClass(this.combo.difficultyRating));
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
  });

  context.viewerProperties = new ViewerProperties();
})(GameUI.CustomUIConfig(), this);
