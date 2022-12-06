/// <reference path="./vendor/lodash.js" />

namespace invk {
  export namespace Combo {
    export type ID = string;

    export enum StaticID {
      Freestyle = "freestyle",
    }

    export enum Specialty {
      QuasWex = "qw",
      QuasExort = "qe",
    }

    export enum Stance {
      Defensive = "defensive",
      Offensive = "offensive",
    }

    export enum DamageRating {
      None,
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
      LiterallyUnplayable,
    }

    export enum OrbName {
      Quas = "quas",
      Wex = "wex",
      Exort = "exort",
    }

    export enum PropertyName {
      Specialty = "specialty",
      Stance = "stance",
      DamageRating = "damageRating",
      DifficultyRating = "difficultyRating",
    }

    export interface Base {
      id: ID;
      heroLevel: number;
      talents: Dota2.Talent.Selection;
      tags: string[];
      items: string[];
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

    export const PROPERTIES: { [K in keyof Properties]: Properties[K][] } = {
      [PropertyName.Specialty]: [Specialty.QuasWex, Specialty.QuasExort],
      [PropertyName.Stance]: [Stance.Defensive, Stance.Offensive],
      [PropertyName.DamageRating]: [
        DamageRating.None,
        DamageRating.Light,
        DamageRating.Considerable,
        DamageRating.Lethal,
        DamageRating.Exceptional,
        DamageRating.Brutal,
      ],
      [PropertyName.DifficultyRating]: [
        DifficultyRating.VeryEasy,
        DifficultyRating.Easy,
        DifficultyRating.Medium,
        DifficultyRating.Hard,
        DifficultyRating.LiterallyUnplayable,
      ],
    };

    export function isProperty(property: string): property is PropertyName {
      return property in PROPERTIES;
    }

    export function matchesTags(combo: Combo, tags: string[]): boolean {
      return _.intersection(combo.tags, tags).length > 0;
    }

    export function matchesItem(combo: Combo, item: string): Step | undefined {
      return _.find(combo.sequence, ["name", item]);
    }

    export function matchesAbility(combo: Combo, ability: string): Step | undefined {
      return _.find(combo.sequence, ["name", ability]);
    }
  }
}
