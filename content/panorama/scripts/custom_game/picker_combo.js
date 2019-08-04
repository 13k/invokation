"use strict";

(function(_global, context) {
  var CreateComponent = context.CreateComponent;
  var RunSequentialActions = context.RunSequentialActions;
  var RunFunctionAction = context.RunFunctionAction;
  var AddClassAction = context.AddClassAction;
  var RunSingleAction = context.RunSingleAction;

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

    setTitle: function(combo) {
      this.$titleLabel.text = combo.l10n.name;
    },

    setHeroLevel: function(combo) {
      this.$heroLevelLabel.text = combo.heroLevel.toString();
    },

    setDialogVariables: function(combo) {
      this.$ctx.SetDialogVariable("specialty", combo.l10n.specialty);
      this.$ctx.SetDialogVariable("stance", combo.l10n.stance);
      this.$ctx.SetDialogVariable("damage_rating", combo.l10n.damageRating);
      this.$ctx.SetDialogVariable("difficulty_rating", combo.l10n.difficultyRating);
    },

    setCombo: function(combo) {
      this.combo = combo;

      var specialtyClass = "specialty_" + combo.specialty;
      var stanceClass = "stance_" + combo.stance;
      var damageClass = "rating_" + combo.damageRating.toString();
      var difficultyClass = "rating_" + combo.difficultyRating.toString();

      var seq = new RunSequentialActions();

      seq.actions.push(new RunFunctionAction(this.setDialogVariables.bind(this), combo));
      seq.actions.push(new RunFunctionAction(this.setTitle.bind(this), combo));
      seq.actions.push(new RunFunctionAction(this.setHeroLevel.bind(this), combo));
      seq.actions.push(new AddClassAction(this.$ctx, specialtyClass));
      seq.actions.push(new AddClassAction(this.$ctx, stanceClass));
      seq.actions.push(new AddClassAction(this.$damageRatingButton, damageClass));
      seq.actions.push(new AddClassAction(this.$difficultyRatingButton, difficultyClass));

      return RunSingleAction(seq);
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
