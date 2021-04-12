declare namespace dota {
  interface KeyValues {
    [key: string]: string | KeyValues;
  }

  interface AbilitiesKeyValues {
    [abilityName: string]: AbilityKeyValues;
  }

  interface AbilityKeyValues {
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

  interface AbilitySpecialKeyValues {
    [key: string]: string;
  }

  enum Talent {
    TIER1_RIGHT = 1 << 0,
    TIER1_LEFT = 1 << 1,
    TIER2_RIGHT = 1 << 2,
    TIER2_LEFT = 1 << 3,
    TIER3_RIGHT = 1 << 4,
    TIER3_LEFT = 1 << 5,
    TIER4_RIGHT = 1 << 6,
    TIER4_LEFT = 1 << 7,
  }

  enum TalentTier {
    Tier1 = 10,
    Tier2 = 15,
    Tier3 = 20,
    Tier4 = 25,
  }

  enum TalentSide {
    RIGHT,
    LEFT,
  }
}
