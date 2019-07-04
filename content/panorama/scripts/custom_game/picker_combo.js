"use strict";

var _callbacks = new ContextCallbacks();

function setCombo(combo) {
  SetContextData("_combo", combo);

  var ctxPanel = $.GetContextPanel();
  var titleLabel = $("#Title");
  var heroLevelLabel = $("#HeroLevelLabel");
  var damageRatingButton = $("#DamageRating");
  var difficultyRatingButton = $("#DifficultyRating");

  ctxPanel.AddClass("specialty_" + combo.specialty);
  ctxPanel.AddClass("stance_" + combo.stance);

  ctxPanel.SetDialogVariable("specialty", combo.specialty_l10n);
  ctxPanel.SetDialogVariable("stance", combo.stance_l10n);
  ctxPanel.SetDialogVariable("damage_rating", combo.damage_rating_l10n);
  ctxPanel.SetDialogVariable("difficulty_rating", combo.difficulty_rating_l10n);

  titleLabel.text = combo.name_l10n;
  heroLevelLabel.text = combo.hero_level;
  damageRatingButton.AddClass("rating_" + combo.damage_rating);
  difficultyRatingButton.AddClass("rating_" + combo.difficulty_rating);
}

function ShowDetails() {
  var combo = GetContextData("_combo");
  L("ShowDetails() ", combo.name);
  _callbacks.Run("onShowDetails", combo);
}

function Play() {
  var combo = GetContextData("_combo");
  L("Play() ", combo.name);
  _callbacks.Run("onPlay", combo);
}

(function() {
  UpdateContextData({ SetCombo: setCombo, Callbacks: _callbacks });
})();