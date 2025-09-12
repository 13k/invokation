export const HERO_ID = 74 as HeroID;

export interface Facet {
  id: FacetId;
  variant: FacetVariant;
  name: FacetName;
}

export enum FacetId {
  Quas = 1,
  Wex = 2,
  Exort = 3,
}

export function FacetIdObject(id: FacetId): Facet {
  switch (id) {
    case FacetId.Quas:
      return { id: FacetId.Quas, variant: FacetVariant.Quas, name: FacetName.Quas };
    case FacetId.Wex:
      return { id: FacetId.Wex, variant: FacetVariant.Wex, name: FacetName.Wex };
    case FacetId.Exort:
      return { id: FacetId.Exort, variant: FacetVariant.Exort, name: FacetName.Exort };
    default:
      throw new Error(`Invalid facet id ${id}`);
  }
}

export enum FacetVariant {
  Quas = 0x4a00000001,
  Wex = 0x4a00000002,
  Exort = 0x4a00000003,
}

export function ParseFacetVariant(s: string): FacetVariant | null {
  const n = Number.parseInt(s, 10);

  switch (n) {
    case FacetVariant.Quas:
      return FacetVariant.Quas;
    case FacetVariant.Wex:
      return FacetVariant.Wex;
    case FacetVariant.Exort:
      return FacetVariant.Exort;
    default:
      return null;
  }
}

export function FacetVariantObject(variant: FacetVariant): Facet {
  switch (variant) {
    case FacetVariant.Quas:
      return { id: FacetId.Quas, variant: FacetVariant.Quas, name: FacetName.Quas };
    case FacetVariant.Wex:
      return { id: FacetId.Wex, variant: FacetVariant.Wex, name: FacetName.Wex };
    case FacetVariant.Exort:
      return { id: FacetId.Exort, variant: FacetVariant.Exort, name: FacetName.Exort };
    default:
      throw new Error(`Invalid facet variant ${variant}`);
  }
}

export enum FacetName {
  Quas = "invoker_focus_quas",
  Wex = "invoker_focus_wex",
  Exort = "invoker_focus_exort",
}

export function FacetNameObject(name: FacetName): Facet {
  switch (name) {
    case FacetName.Quas:
      return { id: FacetId.Quas, variant: FacetVariant.Quas, name: FacetName.Quas };
    case FacetName.Wex:
      return { id: FacetId.Wex, variant: FacetVariant.Wex, name: FacetName.Wex };
    case FacetName.Exort:
      return { id: FacetId.Exort, variant: FacetVariant.Exort, name: FacetName.Exort };
    default:
      throw new Error(`Invalid facet name '${name}'`);
  }
}

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

  TalentL10Right = "special_bonus_unique_invoker_10",
  TalentL10Left = "special_bonus_unique_invoker_3",
  TalentL15Right = "special_bonus_unique_invoker_11",
  TalentL15Left = "special_bonus_unique_invoker_9",
  TalentL20Right = "special_bonus_unique_invoker_6",
  TalentL20Left = "special_bonus_unique_invoker_5",
  TalentL25Right = "special_bonus_unique_invoker_2",
  TalentL25Left = "special_bonus_unique_invoker_13",
}

export type OrbAbility = Ability.Quas | Ability.Wex | Ability.Exort;
export type InvocationAbility = OrbAbility | Ability.Invoke;

export interface UnitsSpawned {
  // biome-ignore lint/style/useNamingConvention: remote data
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
  Ability.TalentL10Right,
  Ability.TalentL10Left,
  Ability.TalentL15Right,
  Ability.TalentL15Left,
  Ability.TalentL20Right,
  Ability.TalentL20Left,
  Ability.TalentL25Right,
  Ability.TalentL25Left,
];

export function isOrbAbility(ability: string): ability is OrbAbility {
  return ability in ORB_ABILITIES;
}

export function isInvocationAbility(ability: string): ability is InvocationAbility {
  return ability in INVOCATION_ABILITIES;
}
