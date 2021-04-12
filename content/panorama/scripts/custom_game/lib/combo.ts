export const FREESTYLE_COMBO_ID = "freestyle" as invk.Combo.ID;

export const COMBO_TRAITS: { [P in invk.Combo.TraitProperty]: Array<invk.Combo.Combo[P]> } = {
  specialty: [invk.Combo.Specialty.QuasWex, invk.Combo.Specialty.QuasExort],
  stance: [invk.Combo.Stance.Offensive, invk.Combo.Stance.Defensive],
  damageRating: [
    invk.Combo.DamageRating.None,
    invk.Combo.DamageRating.Light,
    invk.Combo.DamageRating.Considerable,
    invk.Combo.DamageRating.Lethal,
    invk.Combo.DamageRating.Exceptional,
    invk.Combo.DamageRating.Brutal,
  ],
  difficultyRating: [
    invk.Combo.DifficultyRating.VeryEasy,
    invk.Combo.DifficultyRating.Easy,
    invk.Combo.DifficultyRating.Medium,
    invk.Combo.DifficultyRating.Hard,
    invk.Combo.DifficultyRating.Unplayable,
  ],
};
