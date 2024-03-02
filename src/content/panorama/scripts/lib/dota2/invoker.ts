// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace dota2 {
    export namespace invoker {
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
  }
}
