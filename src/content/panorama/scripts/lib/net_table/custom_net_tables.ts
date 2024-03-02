// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace net_table {
    export enum CustomNetTable {
      Invokation = "invokation",
      Hero = "hero",
      Abilities = "abilities",
    }

    export namespace invokation {
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

      export type Combos = combo.NetworkCombo[];

      export type ShopItems = Record<dota2.shop.Category, string[]>;

      export interface HeroData {
        HERO_ID: number;
        UNIT_NAME: string;
        SPAWNED_UNITS: dota2.invoker.UnitsSpawned;
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
        ORB_ABILITIES: dota2.invoker.Ability[];
        SPELL_ABILITIES: dota2.invoker.Ability[];
        TALENT_ABILITIES: dota2.invoker.Ability[];
        SPELL_COMPOSITION: Record<dota2.invoker.Ability, dota2.invoker.OrbAbility[]>;
        INDEX_ABILITY_QUAS: number;
        INDEX_ABILITY_WEX: number;
        INDEX_ABILITY_EXORT: number;
        INDEX_ABILITY_EMPTY1: number;
        INDEX_ABILITY_EMPTY2: number;
        INDEX_ABILITY_INVOKE: number;
        ABILITY_INDICES: Record<dota2.invoker.Ability, number>;
        MAX_VISIBLE_ABILITY_INDEX: number;
      }
    }

    export namespace hero {
      import KeyValues = invk.kv.KeyValues;

      export enum Key {
        KeyValues = "kv",
      }

      export interface Table {
        [Key.KeyValues]: KeyValues;
      }
    }

    export namespace abilities {
      import KeyValues = invk.kv.KeyValues;

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

    export function subscribe<N extends Names>(name: N, listener: Listener<N>): NetTableListenerID {
      return CustomNetTables.SubscribeNetTableListener(name, listener);
    }

    export function entries<N extends Names>(name: N): Entries<N> {
      return CustomNetTables.GetAllTableValues(name);
    }

    export function get<N extends Names, K extends Keys<N>>(
      name: N,
      key: K,
    ): NetworkValue<N, K> | null {
      return CustomNetTables.GetTableValue(name, key);
    }
  }
}

// ----- Custom net tables declarations -----

interface CustomNetTableDeclarations {
  [invk.net_table.CustomNetTable.Invokation]: invk.net_table.invokation.Table;
  [invk.net_table.CustomNetTable.Hero]: invk.net_table.hero.Table;
  [invk.net_table.CustomNetTable.Abilities]: invk.net_table.abilities.Table;
}
