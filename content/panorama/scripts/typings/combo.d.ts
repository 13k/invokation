declare namespace invk.Combo {
  type ID = string & { readonly __brand: "ComboID" };

  interface ComboKeyValues {
    id: ID;
    name: string;
    description: string;
    heroLevel: number;
    specialty: Specialty;
    stance: Stance;
    damageRating: DamageRating;
    difficultyRating: DifficultyRating;
    talents: dota.Talent;
    orbs: [number, number, number];
    tags: string[];
    items: string[];
    sequence: StepKeyValues[];
  }

  interface Combo extends ComboKeyValues {
    sequence: Step[];
    l10n: ComboL10n;
  }

  interface StepKeyValues {
    name: string;
    required: boolean;
    next: number[];
  }

  interface Step extends StepKeyValues {
    isOrbAbility: boolean;
    isInvocationAbility: boolean;
    isItem: boolean;
  }

  enum Specialty {
    QuasWex = "qw",
    QuasExort = "qe",
  }

  enum Stance {
    Offensive = "offensive",
    Defensive = "defensive",
  }

  enum DamageRating {
    None = 0,
    Light,
    Considerable,
    Lethal,
    Exceptional,
    Brutal,
  }

  enum DifficultyRating {
    VeryEasy = 1,
    Easy,
    Medium,
    Hard,
    Unplayable,
  }

  enum TraitProperty {
    Specialty = "specialty",
    Stance = "stance",
    DamageRating = "damageRating",
    DifficultyRating = "difficultyRating",
  }

  enum L10nProperty {
    Name = "name",
    Description = "description",
    Specialty = "specialty",
    Stance = "stance",
    DamageRating = "damageRating",
    DifficultyRating = "difficultyRating",
  }

  type Property = keyof ComboKeyValues;
  type TraitsSlice = Pick<ComboKeyValues, "id" | TraitProperty>;
  type L10nSlice = Pick<ComboKeyValues, "id" | L10nProperty>;
  type ComboL10n = { [Property in L10nProperty]: string };
}
