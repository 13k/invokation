namespace invk {
  export namespace NetTable {
    export enum CustomNetTable {
      Invokation = "invokation",
      Hero = "hero",
      Abilities = "abilities",
    }

    export namespace Invokation {
      import NetworkCombo = invk.Combo.NetworkCombo;

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
      export type ShopItems = Record<Dota2.shop.Category, string[]>;

      export interface HeroData {
        // biome-ignore lint/style/useNamingConvention: remote data
        HERO_ID: number;
        // biome-ignore lint/style/useNamingConvention: remote data
        UNIT_NAME: string;
        // biome-ignore lint/style/useNamingConvention: remote data
        SPAWNED_UNITS: Dota2.Invoker.UnitsSpawned;
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
        ORB_ABILITIES: Dota2.Invoker.Ability[];
        // biome-ignore lint/style/useNamingConvention: remote data
        SPELL_ABILITIES: Dota2.Invoker.Ability[];
        // biome-ignore lint/style/useNamingConvention: remote data
        TALENT_ABILITIES: Dota2.Invoker.Ability[];
        // biome-ignore lint/style/useNamingConvention: remote data
        SPELL_COMPOSITION: Record<Dota2.Invoker.Ability, Dota2.Invoker.OrbAbility[]>;
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
        ABILITY_INDICES: Record<Dota2.Invoker.Ability, number>;
        // biome-ignore lint/style/useNamingConvention: remote data
        MAX_VISIBLE_ABILITY_INDEX: number;
      }
    }

    export namespace Hero {
      import KeyValues = invk.KeyValues.KeyValues;

      export enum Key {
        KeyValues = "kv",
      }

      export interface Table {
        [Key.KeyValues]: KeyValues;
      }
    }

    export namespace Abilities {
      import KeyValues = invk.KeyValues.KeyValues;

      export enum Key {
        KeyValues = "kv",
      }

      export interface Table {
        [Key.KeyValues]: KeyValues;
      }
    }

    export type Names = keyof CustomNetTableDeclarations;
    export type Table<N extends Names> = CustomNetTableDeclarations[N];
    export type Keys<N extends Names> = keyof Table<N>;
    export type Key<N extends Names, K extends Keys<N>> = Table<N>[K];

    export type NetworkValue<N extends Names, K extends Keys<N> = Keys<N>> = NetworkedData<
      Key<N, K>
    >;

    export type Entries<N extends Names> = {
      [K in Keys<N>]: {
        key: K;
        value: NetworkedData<Key<N, K>>;
      };
    }[Keys<N>][];

    export type Listener<N extends Names, K extends Keys<N> = Keys<N>> = (
      name: N,
      key: K,
      value: NetworkValue<N, K>,
    ) => void;
  }
}

// ----- Custom net tables declarations -----

interface CustomNetTableDeclarations {
  [invk.NetTable.CustomNetTable.Invokation]: invk.NetTable.Invokation.Table;
  [invk.NetTable.CustomNetTable.Hero]: invk.NetTable.Hero.Table;
  [invk.NetTable.CustomNetTable.Abilities]: invk.NetTable.Abilities.Table;
}
