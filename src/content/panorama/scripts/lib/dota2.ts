/// <reference path="./vendor/lodash.js" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Dota2 {
    export interface KeyValues {
      [key: string]: string | KeyValues;
    }

    export namespace Talent {
      export enum Level {
        Tier1 = 10,
        Tier2 = 15,
        Tier3 = 20,
        Tier4 = 25,
      }

      export enum Side {
        Left = "LEFT",
        Right = "RIGHT",
      }

      export enum Selection {
        NONE = 0,
        L10_RIGHT = 1 << 0,
        L10_LEFT = 1 << 1,
        L15_RIGHT = 1 << 2,
        L15_LEFT = 1 << 3,
        L20_RIGHT = 1 << 4,
        L20_LEFT = 1 << 5,
        L25_RIGHT = 1 << 6,
        L25_LEFT = 1 << 7,
      }

      export type Map<T> = {
        -readonly [L in Level]: {
          -readonly [S in Side]: T;
        };
      };

      const selectionKey = (
        level: Talent.Level,
        side: Talent.Side,
      ): keyof typeof Talent.Selection => `L${level}_${side}`;

      const selectionValue = (level: Talent.Level, side: Talent.Side): Talent.Selection =>
        Talent.Selection[selectionKey(level, side)];

      export function isSelected(
        level: Talent.Level,
        side: Talent.Side,
        selected: Talent.Selection,
      ): boolean {
        return (selectionValue(level, side) & selected) > 0;
      }

      export function splitSelection(selected: Talent.Selection): Talent.Map<boolean> {
        return _.transform(
          Object.values(Talent.Level),
          (map, level) => {
            if (_.isString(level)) return;

            map[level] = map[level] || {};

            Object.values(Talent.Side).forEach((side) => {
              map[level][side] = isSelected(level, side, selected);
            });
          },
          {} as Talent.Map<boolean>,
        );
      }

      export function arrayIndexToLevel(i: number): Talent.Level {
        return ((Math.floor(i / 2) + 2) * 5) as Talent.Level;
      }

      export function arrayIndexToSide(i: number): Talent.Side {
        return i % 2 === 0 ? Talent.Side.Right : Talent.Side.Left;
      }
    }

    export namespace Invoker {
      export const HERO_ID = 74 as HeroID;

      export enum Ability {
        Quas = "invoker_quas",
        Wex = "invoker_wex",
        Exort = "invoker_exort",
        Invoke = "invoker_invoke",

        ColdSnap = "invoker_cold_snap",
        GhostWalk = "invoker_ghost_walk",
        IceWall = "invoker_ice_wall",
        Emp = "invoker_emp",
        Tornado = "invoker_tornado",
        Alacrity = "invoker_alacrity",
        SunStrike = "invoker_sun_strike",
        ForgeSpirit = "invoker_forge_spirit",
        ChaosMeteor = "invoker_chaos_meteor",
        DeafeningBlast = "invoker_deafening_blast",

        // FIXME: Talent ability names shouldn't be hardcoded

        Talent_L10_RIGHT = "special_bonus_unique_invoker_10",
        Talent_L10_LEFT = "special_bonus_unique_invoker_3",
        Talent_L15_RIGHT = "special_bonus_unique_invoker_11",
        Talent_L15_LEFT = "special_bonus_unique_invoker_9",
        Talent_L20_RIGHT = "special_bonus_unique_invoker_6",
        Talent_L20_LEFT = "special_bonus_unique_invoker_5",
        Talent_L25_RIGHT = "special_bonus_unique_invoker_2",
        Talent_L25_LEFT = "special_bonus_unique_invoker_13",
      }

      export type OrbAbility = Ability.Quas | Ability.Wex | Ability.Exort;
      export type InvocationAbility = OrbAbility | Ability.Invoke;

      export interface UnitsSpawned {
        FORGED_SPIRIT: string;
      }

      export const ORB_ABILITIES = {
        [Ability.Quas]: Ability.Quas,
        [Ability.Wex]: Ability.Wex,
        [Ability.Exort]: Ability.Exort,
      };

      export const INVOCATION_ABILITIES = {
        ...ORB_ABILITIES,
        [Ability.Invoke]: Ability.Invoke,
      };

      export const SPELL_ABILITIES = {
        [Ability.ColdSnap]: Ability.ColdSnap,
        [Ability.GhostWalk]: Ability.GhostWalk,
        [Ability.IceWall]: Ability.IceWall,
        [Ability.Emp]: Ability.Emp,
        [Ability.Tornado]: Ability.Tornado,
        [Ability.Alacrity]: Ability.Alacrity,
        [Ability.SunStrike]: Ability.SunStrike,
        [Ability.ForgeSpirit]: Ability.ForgeSpirit,
        [Ability.ChaosMeteor]: Ability.ChaosMeteor,
        [Ability.DeafeningBlast]: Ability.DeafeningBlast,
      };

      export const TALENT_ABILITIES: Ability[] = [
        Ability.Talent_L10_RIGHT,
        Ability.Talent_L10_LEFT,
        Ability.Talent_L15_RIGHT,
        Ability.Talent_L15_LEFT,
        Ability.Talent_L20_RIGHT,
        Ability.Talent_L20_LEFT,
        Ability.Talent_L25_RIGHT,
        Ability.Talent_L25_LEFT,
      ];

      export function isOrbAbility(ability: string): ability is OrbAbility {
        return ability in ORB_ABILITIES;
      }

      export function isInvocationAbility(ability: string): ability is InvocationAbility {
        return ability in INVOCATION_ABILITIES;
      }
    }

    export namespace Shop {
      export enum CategoryGroup {
        Basics = "basics",
        Upgrades = "upgrades",
      }

      export enum Category {
        Artifacts = "artifacts",
        Attributes = "attributes",
        Basics = "basics",
        Consumables = "consumables",
        Defense = "defense",
        Magics = "magics",
        Misc = "misc",
        SecretShop = "secretshop",
        Support = "support",
        Weapons = "weapons",
        WeaponsArmor = "weapons_armor",
      }

      export const CATEGORIES: Record<Dota2.Shop.CategoryGroup, Dota2.Shop.Category[]> = {
        [Dota2.Shop.CategoryGroup.Basics]: [
          Dota2.Shop.Category.Consumables,
          Dota2.Shop.Category.Attributes,
          Dota2.Shop.Category.WeaponsArmor,
          Dota2.Shop.Category.Misc,
          Dota2.Shop.Category.SecretShop,
        ],
        [Dota2.Shop.CategoryGroup.Upgrades]: [
          Dota2.Shop.Category.Basics,
          Dota2.Shop.Category.Support,
          Dota2.Shop.Category.Magics,
          Dota2.Shop.Category.Defense,
          Dota2.Shop.Category.Weapons,
          Dota2.Shop.Category.Artifacts,
        ],
      };
    }

    export const ITEM_NAME_PREFIX = "item_";

    export function isItemAbility(name: string): boolean {
      return _.startsWith(name, ITEM_NAME_PREFIX);
    }
  }
}
