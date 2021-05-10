import type { Talent } from "./dota";

export type ComboID = string & { readonly __brand: "ComboID" };

export const FREESTYLE_COMBO_ID = "freestyle" as ComboID;

export interface ComboKeyValues {
  id: ComboID;
  name: string;
  description: string;
  heroLevel: number;
  specialty: Specialty;
  stance: Stance;
  damageRating: DamageRating;
  difficultyRating: DifficultyRating;
  talents: Talent;
  orbs: [number, number, number];
  tags: string[];
  items: string[];
  sequence: StepKeyValues[];
}

export interface Combo extends ComboKeyValues {
  sequence: Step[];
  l10n: ComboL10n;
}

export interface StepKeyValues {
  name: string;
  required: boolean;
  next: number[];
}

export interface Step extends StepKeyValues {
  index: number;
  isOrbAbility: boolean;
  isInvocationAbility: boolean;
  isItem: boolean;
}

export enum Specialty {
  QuasWex = "qw",
  QuasExort = "qe",
}

export enum Stance {
  Offensive = "offensive",
  Defensive = "defensive",
}

export enum DamageRating {
  None = 0,
  Light,
  Considerable,
  Lethal,
  Exceptional,
  Brutal,
}

export enum DifficultyRating {
  VeryEasy = 1,
  Easy,
  Medium,
  Hard,
  Unplayable,
}

export enum TraitProperty {
  Specialty = "specialty",
  Stance = "stance",
  DamageRating = "damageRating",
  DifficultyRating = "difficultyRating",
}

export enum L10nProperty {
  Name = "name",
  Description = "description",
  Specialty = "specialty",
  Stance = "stance",
  DamageRating = "damageRating",
  DifficultyRating = "difficultyRating",
}

export type Property = keyof ComboKeyValues;
export type TraitsSlice = Pick<ComboKeyValues, "id" | TraitProperty>;
export type L10nSlice = Pick<ComboKeyValues, "id" | L10nProperty>;
export type ComboL10n = { [Property in L10nProperty]: string };

export interface ProgressMetrics {
  count?: number;
  damage?: number;
}

export interface ScoreCounterMetrics {
  count?: number;
}

export interface ScoreSummaryMetrics {
  count: number;
  startDamage?: number;
  endDamage: number;
}

export const COMBO_TRAITS: { [P in TraitProperty]: Array<Combo[P]> } = {
  [TraitProperty.Specialty]: [Specialty.QuasWex, Specialty.QuasExort],
  [TraitProperty.Stance]: [Stance.Offensive, Stance.Defensive],
  [TraitProperty.DamageRating]: [
    DamageRating.None,
    DamageRating.Light,
    DamageRating.Considerable,
    DamageRating.Lethal,
    DamageRating.Exceptional,
    DamageRating.Brutal,
  ],
  [TraitProperty.DifficultyRating]: [
    DifficultyRating.VeryEasy,
    DifficultyRating.Easy,
    DifficultyRating.Medium,
    DifficultyRating.Hard,
    DifficultyRating.Unplayable,
  ],
};
