export interface KeyValues {
  [key: string]: string | KeyValues;
}

export interface AbilitiesKeyValues {
  [abilityName: string]: AbilityKeyValues;
}

export interface AbilityKeyValues {
  ID: number;
  Name: string;
  AbilityBehavior: string;
  MaxLevel: number;
  HotKeyOverride: string;
  AbilityUnitDamageType: string;
  SpellImmunityType: string;
  FightRecapLevel: number;
  AbilitySound: string;
  HasScepterUpgrade: boolean;
  AbilityCastRange: number;
  AbilityCastPoint: number;
  AbilityCastAnimation: string;
  AbilityCooldown: number;
  AbilityManaCost: number;
  AbilitySpecial: AbilitySpecialKeyValues[];
}

export interface AbilitySpecialKeyValues {
  [key: string]: string;
}

// dota_shared_enums.proto (EDOTAPlayerMMRType)
export enum PlayerMMRType {
  Invalid = 0,
  GeneralHidden = 1,
  GeneralCompetitive = 3,
  SoloCompetitive2019 = 4,
  OneOnOneCompetitive_UNUSED = 5,
}

export enum Talent {
  NONE = 0,
  TIER1_RIGHT = 1 << 0,
  TIER1_LEFT = 1 << 1,
  TIER2_RIGHT = 1 << 2,
  TIER2_LEFT = 1 << 3,
  TIER3_RIGHT = 1 << 4,
  TIER3_LEFT = 1 << 5,
  TIER4_RIGHT = 1 << 6,
  TIER4_LEFT = 1 << 7,
}

export enum TalentTier {
  Tier1 = 10,
  Tier2 = 15,
  Tier3 = 20,
  Tier4 = 25,
}

export enum TalentSide {
  RIGHT,
  LEFT,
}

export const TALENT_BRANCHES = {
  [TalentTier.Tier1]: {
    [TalentSide.RIGHT]: Talent.TIER1_RIGHT,
    [TalentSide.LEFT]: Talent.TIER1_LEFT,
  },
  [TalentTier.Tier2]: {
    [TalentSide.RIGHT]: Talent.TIER2_RIGHT,
    [TalentSide.LEFT]: Talent.TIER2_LEFT,
  },
  [TalentTier.Tier3]: {
    [TalentSide.RIGHT]: Talent.TIER3_RIGHT,
    [TalentSide.LEFT]: Talent.TIER3_LEFT,
  },
  [TalentTier.Tier4]: {
    [TalentSide.RIGHT]: Talent.TIER4_RIGHT,
    [TalentSide.LEFT]: Talent.TIER4_LEFT,
  },
};

export function isTalentSelected(tier: TalentTier, side: TalentSide, selected: Talent): boolean {
  const branch = TALENT_BRANCHES[tier][side];

  return (selected & branch) === branch;
}

export function talentSelectedSide(tier: TalentTier, selected: Talent): TalentSide | null {
  if (isTalentSelected(tier, TalentSide.RIGHT, selected)) {
    return TalentSide.RIGHT;
  } else if (isTalentSelected(tier, TalentSide.LEFT, selected)) {
    return TalentSide.LEFT;
  }

  return null;
}

export function talentArrayIndexToTier(i: number): TalentTier {
  return (Math.floor(i / 2) + 2) * 5;
}

export function talentArrayIndexToSide(i: number): TalentSide {
  return i % 2 === 0 ? TalentSide.RIGHT : TalentSide.LEFT;
}

export enum ShopGroup {
  Basics = "Basics",
  Upgrades = "Upgrades",
}

export enum ShopCategory {
  Consumables = "consumables",
  Attributes = "attributes",
  WeaponsArmor = "weapons_armor",
  Misc = "misc",
  SecretShop = "secret_shop",
  Basics = "basics",
  Support = "support",
  Magics = "magics",
  Defense = "defense",
  Weapons = "weapons",
  Artifacts = "artifacts",
}

export type ShopCategories = {
  [K in ShopGroup]: ShopCategory[];
};

export const SHOP_CATEGORIES: ShopCategories = {
  [ShopGroup.Basics]: [
    ShopCategory.Consumables,
    ShopCategory.Attributes,
    ShopCategory.WeaponsArmor,
    ShopCategory.Misc,
    ShopCategory.SecretShop,
  ],
  [ShopGroup.Upgrades]: [
    ShopCategory.Basics,
    ShopCategory.Support,
    ShopCategory.Magics,
    ShopCategory.Defense,
    ShopCategory.Weapons,
    ShopCategory.Artifacts,
  ],
};
