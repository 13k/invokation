import type { Talents } from "./dota2";

export type ID = string;

enum StaticID {
  Freestyle = "freestyle",
}

enum Specialty {
  QuasWex = "qw",
  QuasExort = "qe",
}

enum Stance {
  Defensive = "defensive",
  Offensive = "offensive",
}

enum DamageRating {
  None,
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
  LiterallyUnplayable,
}

enum OrbName {
  Quas = "quas",
  Wex = "wex",
  Exort = "exort",
}

export interface Base {
  id: ID;
  heroLevel: number;
  talents: Talents;
  tags: string[];
  items: string[];
}

enum PropertyName {
  Specialty = "specialty",
  Stance = "stance",
  DamageRating = "damageRating",
  DifficultyRating = "difficultyRating",
}

export interface Properties {
  [PropertyName.Specialty]: Specialty;
  [PropertyName.Stance]: Stance;
  [PropertyName.DamageRating]: DamageRating;
  [PropertyName.DifficultyRating]: DifficultyRating;
}

export type PropertiesL10n = {
  [K in keyof Properties]: string;
};

export interface NetworkCombo extends Base, Properties {
  orbs: [number, number, number];
  sequence: NetworkStep[];
}

export interface Combo extends NetworkCombo {
  orbsByName: Record<OrbName, number>;
  sequence: Step[];
  l10n: ComboL10n;
}

export interface ComboL10n extends PropertiesL10n {
  name: string;
  description: string;
}

export interface NetworkStep {
  name: string;
  required: boolean;
  next: number[];
}

export type StepID = number;

export interface Step extends NetworkStep {
  id: StepID;
  isOrbAbility: boolean;
  isInvocationAbility: boolean;
  isItem: boolean;
}

export interface Metrics {
  count?: number;
  damage?: number;
}

export type { StaticID, Specialty, Stance, DamageRating, DifficultyRating, OrbName, PropertyName };

const module = {
  StaticID,
  Specialty,
  Stance,
  DamageRating,
  DifficultyRating,
  OrbName,
  PropertyName,
};

export type ComboModule = typeof module;

CustomUIConfig.Combo = module;
