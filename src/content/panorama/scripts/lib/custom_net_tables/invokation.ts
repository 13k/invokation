import type { NetworkCombo } from "../combo";
import { CustomNetTable } from "../custom_net_tables";
import type * as invoker from "../dota2/invoker";
import type * as shop from "../dota2/shop";

export const Name = CustomNetTable.Invokation;

export enum Key {
  Combos = "combos",
  ShopItems = "shop_items",
  HeroData = "hero_data",
}

export interface Table {
  [Key.Combos]: Combos;
  [Key.ShopItems]: ShopItems;
  [Key.HeroData]: HeroData;
}

export type Combos = NetworkCombo[];
export type ShopItems = Record<shop.Category, string[]>;

export interface HeroData {
  // biome-ignore lint/style/useNamingConvention: remote data
  HERO_ID: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  UNIT_NAME: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  SPAWNED_UNITS: invoker.UnitsSpawned;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_QUAS: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_WEX: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_EXORT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_EMPTY1: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_EMPTY2: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_INVOKE: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_COLD_SNAP: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_GHOST_WALK: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_ICE_WALL: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_EMP: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TORNADO: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_ALACRITY: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_SUN_STRIKE: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_FORGE_SPIRIT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_CHAOS_METEOR: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_DEAFENING_BLAST: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L10_RIGHT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L10_LEFT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L15_RIGHT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L15_LEFT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L20_RIGHT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L20_LEFT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L25_RIGHT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_TALENT_L25_LEFT: string;
  // biome-ignore lint/style/useNamingConvention: remote data
  ORB_ABILITIES: invoker.Ability[];
  // biome-ignore lint/style/useNamingConvention: remote data
  SPELL_ABILITIES: invoker.Ability[];
  // biome-ignore lint/style/useNamingConvention: remote data
  TALENT_ABILITIES: invoker.Ability[];
  // biome-ignore lint/style/useNamingConvention: remote data
  SPELL_COMPOSITION: Record<invoker.Ability, invoker.OrbAbility[]>;
  // biome-ignore lint/style/useNamingConvention: remote data
  INDEX_ABILITY_QUAS: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  INDEX_ABILITY_WEX: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  INDEX_ABILITY_EXORT: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  INDEX_ABILITY_EMPTY1: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  INDEX_ABILITY_EMPTY2: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  INDEX_ABILITY_INVOKE: number;
  // biome-ignore lint/style/useNamingConvention: remote data
  ABILITY_INDICES: Record<invoker.Ability, number>;
  // biome-ignore lint/style/useNamingConvention: remote data
  MAX_VISIBLE_ABILITY_INDEX: number;
}
