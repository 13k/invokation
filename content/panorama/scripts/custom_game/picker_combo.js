"use strict";

var C = GameUI.CustomUIConfig(),
  CreateComponent = C.CreateComponent;

var PickerCombo = CreateComponent({
  constructor: function PickerCombo() {
    PickerCombo.super.call(this, $.GetContextPanel());

    this.registerInput("SetCombo", this.setCombo.bind(this));
    this.bindElements();
  },

  bindElements: function() {
    this.$titleLabel = $("#Title");
    this.$heroLevelLabel = $("#HeroLevelLabel");
    this.$damageRatingButton = $("#DamageRating");
    this.$difficultyRatingButton = $("#DifficultyRating");
  },

  setCombo: function(combo) {
    this.log("setCombo() ", combo.id);
    this.combo = combo;

    var specialtyClass = "specialty_" + combo.specialty;
    var stanceClass = "stance_" + combo.stance;
    var damageClass = "rating_" + combo.damageRating.toString();
    var difficultyClass = "rating_" + combo.difficultyRating.toString();

    this.$ctx.AddClass(specialtyClass);
    this.$ctx.AddClass(stanceClass);

    this.$ctx.SetDialogVariable("specialty", combo.l10n.specialty);
    this.$ctx.SetDialogVariable("stance", combo.l10n.stance);
    this.$ctx.SetDialogVariable("damage_rating", combo.l10n.damageRating);
    this.$ctx.SetDialogVariable(
      "difficulty_rating",
      combo.l10n.difficultyRating
    );

    this.$titleLabel.text = combo.l10n.name;
    this.$heroLevelLabel.text = combo.heroLevel.toString();
    this.$damageRatingButton.AddClass(damageClass);
    this.$difficultyRatingButton.AddClass(difficultyClass);
  },

  ShowDetails: function() {
    this.log("ShowDetails() ", this.combo.id);
    this.runOutput("OnShowDetails", { combo: this.combo });
  },

  Play: function() {
    this.log("Play() ", this.combo.id);
    this.runOutput("OnPlay", { combo: this.combo });
  },
});

var pickerCombo = new PickerCombo();
