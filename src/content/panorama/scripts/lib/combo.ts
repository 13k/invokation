/// <reference path="./vendor/lodash.js" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    export enum Property {
      Specialty = "specialty",
      Stance = "stance",
      DamageRating = "damageRating",
      DifficultyRating = "difficultyRating",
    }

    export enum PropertyType {
      String,
      Integer,
    }

    export interface PropertyTypes {
      [Property.Specialty]: PropertyType.String;
      [Property.Stance]: PropertyType.String;
      [Property.DamageRating]: PropertyType.Integer;
      [Property.DifficultyRating]: PropertyType.Integer;
    }

    export interface PropertyDescriptor<K extends keyof Properties> {
      name: K;
      type: PropertyTypes[K];
      values: Properties[K][];
    }

    export interface Base {
      id: ID;
      heroLevel: number;
      talents: Dota2.Talent.Selection;
      tags: string[];
      items: string[];
    }

    export interface Properties {
      [Property.Specialty]: Specialty;
      [Property.Stance]: Stance;
      [Property.DamageRating]: DamageRating;
      [Property.DifficultyRating]: DifficultyRating;
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

    export type PropertyList = {
      [K in keyof Properties]: PropertyDescriptor<K>;
    };

    export const PROPERTIES: PropertyList = {
      [Property.Specialty]: {
        name: Property.Specialty,
        type: PropertyType.String,
        values: [Specialty.QuasWex, Specialty.QuasExort],
      },
      [Property.Stance]: {
        name: Property.Stance,
        type: PropertyType.String,
        values: [Stance.Defensive, Stance.Offensive],
      },
      [Property.DamageRating]: {
        name: Property.DamageRating,
        type: PropertyType.Integer,
        values: [
          DamageRating.None,
          DamageRating.Light,
          DamageRating.Considerable,
          DamageRating.Lethal,
          DamageRating.Exceptional,
          DamageRating.Brutal,
        ],
      },
      [Property.DifficultyRating]: {
        name: Property.DifficultyRating,
        type: PropertyType.Integer,
        values: [
          DifficultyRating.VeryEasy,
          DifficultyRating.Easy,
          DifficultyRating.Medium,
          DifficultyRating.Hard,
          DifficultyRating.LiterallyUnplayable,
        ],
      },
    };

    export function isProperty(property: string): property is Property {
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
