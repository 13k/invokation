const CCustomNetTables = CustomNetTables;

namespace invk {
  export namespace CustomNetTables {
    export enum Name {
      Invokation = "invokation",
      Hero = "hero",
      Abilities = "abilities",
    }

    export namespace Invokation {
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

      export type Combos = Combo.NetworkCombo[];

      export type ShopItems = Record<Dota2.Shop.Category, string[]>;

      export interface HeroData {
        HERO_ID: number;
        UNIT_NAME: string;
        SPAWNED_UNITS: Dota2.Invoker.UnitsSpawned;
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
        ORB_ABILITIES: Dota2.Invoker.Ability[];
        SPELL_ABILITIES: Dota2.Invoker.Ability[];
        TALENT_ABILITIES: Dota2.Invoker.Ability[];
        SPELL_COMPOSITION: Record<Dota2.Invoker.Ability, Dota2.Invoker.OrbAbility[]>;
        INDEX_ABILITY_QUAS: number;
        INDEX_ABILITY_WEX: number;
        INDEX_ABILITY_EXORT: number;
        INDEX_ABILITY_EMPTY1: number;
        INDEX_ABILITY_EMPTY2: number;
        INDEX_ABILITY_INVOKE: number;
        ABILITY_INDICES: Record<Dota2.Invoker.Ability, number>;
        MAX_VISIBLE_ABILITY_INDEX: number;
      }
    }

    export namespace Hero {
      export enum Key {
        KeyValues = "kv",
      }

      export interface Table {
        [Key.KeyValues]: Dota2.KeyValues;
      }
    }

    export namespace Abilities {
      export enum Key {
        KeyValues = "kv",
      }

      export interface Table {
        [Key.KeyValues]: Dota2.KeyValues;
      }
    }

    type Names = keyof CustomNetTableDeclarations;
    type Table<N extends Names> = CustomNetTableDeclarations[N];
    type Keys<N extends Names> = keyof Table<N>;
    type Key<N extends Names, K extends Keys<N>> = Table<N>[K];

    export type NetworkTable<N extends Names> = NetworkedData<Table<N>>;
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
      value: NetworkValue<N, K>
    ) => void;

    export function subscribe<N extends Names>(name: N, listener: Listener<N>): NetTableListenerID {
      return CCustomNetTables.SubscribeNetTableListener(name, listener);
    }

    export function entries<N extends Names>(name: N): Entries<N> {
      return CCustomNetTables.GetAllTableValues(name);
    }

    export function get<N extends Names, K extends Keys<N>>(
      name: N,
      key: K
    ): NetworkValue<N, K> | null {
      return CCustomNetTables.GetTableValue(name, key);
    }
  }
}
