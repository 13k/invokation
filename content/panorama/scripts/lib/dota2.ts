export interface KeyValues {
  [key: string]: string | KeyValues;
}

enum TalentLevel {
  Tier1 = 10,
  Tier2 = 15,
  Tier3 = 20,
  Tier4 = 25,
}

type TalentLevelT = typeof TalentLevel;

enum TalentSide {
  Left = "LEFT",
  Right = "RIGHT",
}

type TalentSideT = typeof TalentSide;

enum Talents {
  L10_RIGHT = 0x01,
  L10_LEFT = 0x02,
  L15_RIGHT = 0x04,
  L15_LEFT = 0x08,
  L20_RIGHT = 0x10,
  L20_LEFT = 0x20,
  L25_RIGHT = 0x40,
  L25_LEFT = 0x80,
}

export type TalentMap<T> = {
  -readonly [L in keyof TalentLevelT as TalentLevelT[L]]: {
    -readonly [S in keyof TalentSideT as TalentSideT[S]]: T;
  };
};

enum Ability {
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
  // VScript dynamically parses the hero KeyValues for these names.

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

export interface InvokerUnitsSpawned {
  FORGED_SPIRIT: string;
}

enum ShopCategoryGroup {
  Basics = "basics",
  Upgrades = "upgrades",
}

enum ShopCategory {
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

const { lodash: _ } = CustomUIConfig;

const ITEM_NAME_PREFIX = "item_";

function isOrbAbility(ability: string): ability is OrbAbility {
  switch (ability) {
    case Ability.Quas:
    case Ability.Wex:
    case Ability.Exort:
      return true;
    default:
      return false;
  }
}

function isInvocationAbility(ability: string): ability is InvocationAbility {
  return ability === Ability.Invoke || isOrbAbility(ability);
}

function isItemAbility(name: string): boolean {
  return _.startsWith(name, ITEM_NAME_PREFIX);
}

function talentConstKey(level: TalentLevel, side: TalentSide): keyof typeof Talents {
  return `L${level}_${side}`;
}

function talentConstValue(level: TalentLevel, side: TalentSide): Talents {
  return Talents[talentConstKey(level, side)];
}

function isTalentSelected(level: TalentLevel, side: TalentSide, selected: Talents): boolean {
  return (talentConstValue(level, side) & selected) > 0;
}

function splitSelectedTalents(selected: Talents): TalentMap<boolean> {
  return _.transform(
    Object.values(TalentLevel),
    (map, level) => {
      if (_.isString(level)) return;

      map[level] = map[level] || {};

      Object.values(TalentSide).forEach((side) => {
        map[level][side] = isTalentSelected(level, side, selected);
      });
    },
    {} as TalentMap<boolean>
  );
}

function talentArrayIndexToLevel(i: number): TalentLevel {
  return (Math.floor(i / 2) + 2) * 5;
}

function talentArrayIndexToSide(i: number): TalentSide {
  return i % 2 === 0 ? TalentSide.Right : TalentSide.Left;
}

export type { TalentLevel, TalentSide, Talents, Ability, ShopCategoryGroup, ShopCategory };

const module = {
  TalentLevel,
  TalentSide,
  Talents,
  Ability,
  ShopCategoryGroup,
  ShopCategory,

  isOrbAbility,
  isInvocationAbility,
  isItemAbility,
  isTalentSelected,
  splitSelectedTalents,
  talentArrayIndexToLevel,
  talentArrayIndexToSide,

  ITEM_NAME_PREFIX,
};

export type Dota2 = typeof module;

CustomUIConfig.Dota2 = module;
