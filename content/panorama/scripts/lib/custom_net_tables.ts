import type { NetworkCombo } from "./combo";
import type { Ability, InvokerUnitsSpawned, KeyValues, OrbAbility, ShopCategory } from "./dota2";

declare global {
  interface CustomNetTableDeclarations {
    [Name.Invokation]: InvokationTable;
    [Name.Hero]: HeroTable;
    [Name.Abilities]: AbilitiesTable;
  }
}

enum Name {
  Invokation = "invokation",
  Hero = "hero",
  Abilities = "abilities",
}

enum Key {
  InvokationCombos = "combos",
  InvokationShopItems = "shop_items",
  InvokationHeroData = "hero_data",
  HeroKeyValues = "kv",
  AbilitiesKeyValues = "kv",
}

export interface InvokationTable {
  [Key.InvokationCombos]: Combos;
  [Key.InvokationShopItems]: ShopItems;
  [Key.InvokationHeroData]: HeroData;
}

export type Combos = NetworkCombo[];

type ShopCategories = typeof ShopCategory;

export type ShopItems = {
  [K in keyof ShopCategories as ShopCategories[K]]: string[];
};

export interface HeroData {
  HERO_ID: number;
  UNIT_NAME: string;
  SPAWNED_UNITS: InvokerUnitsSpawned;
  ABILITY_QUAS: string;
  ABILITY_WEX: string;
  ABILITY_EXORT: string;
  ABILITY_EMPTY1: string;
  ABILITY_EMPTY2: string;
  ABILITY_INVOKE: string;
  ABILITY_COLD_SNAP: string;
  ABILITY_GHOST_WALK: string;
  ABILITY_ICE_WALL: string;
  ABILITY_EMP: string;
  ABILITY_TORNADO: string;
  ABILITY_ALACRITY: string;
  ABILITY_SUN_STRIKE: string;
  ABILITY_FORGE_SPIRIT: string;
  ABILITY_CHAOS_METEOR: string;
  ABILITY_DEAFENING_BLAST: string;
  ABILITY_TALENT_L10_RIGHT: string;
  ABILITY_TALENT_L10_LEFT: string;
  ABILITY_TALENT_L15_RIGHT: string;
  ABILITY_TALENT_L15_LEFT: string;
  ABILITY_TALENT_L20_RIGHT: string;
  ABILITY_TALENT_L20_LEFT: string;
  ABILITY_TALENT_L25_RIGHT: string;
  ABILITY_TALENT_L25_LEFT: string;
  ORB_ABILITIES: Ability[];
  SPELL_ABILITIES: Ability[];
  TALENT_ABILITIES: Ability[];
  SPELL_COMPOSITION: Record<Ability, OrbAbility[]>;
  INDEX_ABILITY_QUAS: number;
  INDEX_ABILITY_WEX: number;
  INDEX_ABILITY_EXORT: number;
  INDEX_ABILITY_EMPTY1: number;
  INDEX_ABILITY_EMPTY2: number;
  INDEX_ABILITY_INVOKE: number;
  ABILITY_INDICES: Record<Ability, number>;
  MAX_VISIBLE_ABILITY_INDEX: number;
}

export interface HeroTable {
  [Key.HeroKeyValues]: KeyValues;
}

export interface AbilitiesTable {
  [Key.AbilitiesKeyValues]: KeyValues;
}

export type { Name, Key };

const module = { Name, Key };

export type CustomNetTables = typeof module;

CustomUIConfig.CustomNetTables = module;
