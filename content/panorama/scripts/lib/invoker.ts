import { transform } from "lodash";

import { talentArrayIndexToSide, talentArrayIndexToTier, TalentSide, TalentTier } from "./dota";

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
  // FIXME: Talent ability names shouldn't be hardcoded.
  // vscript dynamically parses the hero KeyValues for these names.
  TalentTier1Right = "special_bonus_unique_invoker_10",
  TalentTier1Left = "special_bonus_unique_invoker_6",
  TalentTier2Right = "special_bonus_unique_invoker_13",
  TalentTier2Left = "special_bonus_unique_invoker_9",
  TalentTier3Right = "special_bonus_unique_invoker_3",
  TalentTier3Left = "special_bonus_unique_invoker_5",
  TalentTier4Right = "special_bonus_unique_invoker_2",
  TalentTier4Left = "special_bonus_unique_invoker_11",
}

export enum Orb {
  Quas = 0,
  Wex = 1,
  Exort = 2,
}

export const ORB_ABILITIES = {
  [Ability.Quas]: Ability.Quas,
  [Ability.Wex]: Ability.Wex,
  [Ability.Exort]: Ability.Exort,
} as const;

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
} as const;

export const TALENT_ABILITIES = [
  Ability.TalentTier1Right,
  Ability.TalentTier1Left,
  Ability.TalentTier2Right,
  Ability.TalentTier2Left,
  Ability.TalentTier3Right,
  Ability.TalentTier3Left,
  Ability.TalentTier4Right,
  Ability.TalentTier4Left,
] as const;

type TierTalents = {
  [Side in TalentSide]: Ability;
};

type Talents = {
  [Tier in TalentTier]: TierTalents;
};

export const TALENTS: Talents = transform(
  TALENT_ABILITIES,
  (talents, ability, index) => {
    const tier = talentArrayIndexToTier(index);
    const side = talentArrayIndexToSide(index);

    talents[tier] ||= {} as TierTalents;
    talents[tier][side] = ability;
  },
  {} as Talents
);

export function isOrbAbility(abilityName: string): boolean {
  return abilityName in ORB_ABILITIES;
}

export function isInvocationAbility(abilityName: string): boolean {
  return isOrbAbility(abilityName) || abilityName === Ability.Invoke;
}
