/// <reference path="../callbacks.ts" />
/// <reference path="../logger.ts" />
/// <reference path="../lua.ts" />
/// <reference path="custom_net_tables.ts" />
/// <reference path="net_table.ts" />

namespace invk {
  export namespace NetTable {
    export namespace KeyListener {
      import lua = invk.Lua;

      import Callbacks = invk.Callbacks.Callbacks;
      import Logger = invk.Logger.Logger;

      type Callback<V, E extends Event> = invk.Callbacks.Callback<Payloads<V>, E>;

      enum Event {
        Change = "change",
      }

      interface Payloads<V> {
        [Event.Change]: V;
      }

      export abstract class NetTableKeyListener<
        N extends Names,
        K extends Keys<N>,
        V = NetworkValue<N, K>,
      > {
        #callbacks: Callbacks<Payloads<V>>;

        protected name: N;
        protected key: K;
        protected log: Logger;
        protected table: NetTable<N>;
        protected value: V | undefined;

        constructor(name: N, key: K) {
          this.name = name;
          this.key = key;
          this.table = new NetTable(this.name);
          this.log = new Logger({ name: `net_table.${this.name}.${String(this.key)}` });
          this.#callbacks = new Callbacks();

          this.load();
          this.#listenToNetTableChange();
        }

        #loadFromNetTable() {
          return this.table.get(this.key);
        }

        #listenToNetTableChange(): void {
          this.table.onKeyChange(this.key, this.#onNetTableKeyChange.bind(this));
        }

        #onNetTableKeyChange(key: K, value: NetworkValue<N, K>): void {
          if (key !== this.key) {
            return;
          }

          this.log.debug("onNetTableChange()");
          this.#set(value);
        }

        #set(value: NetworkValue<N, K> | null): void {
          if (value == null) {
            this.log.warning("Tried to set value with undefined");
            return;
          }

          this.value = this.normalize(value);

          this.#callbacks.run(Event.Change, this.value);
        }

        protected load() {
          this.log.debug("load()");

          if (this.value == null) {
            const value = this.#loadFromNetTable();

            if (value != null) {
              this.#set(value);
            }
          }
        }

        /** Subclasses must override to provide network data normalization */
        protected abstract normalize(value: NetworkValue<N, K>): V;

        onChange(cb: Callback<V, Event.Change>): void {
          this.#callbacks.on(Event.Change, cb);

          if (this.value) {
            cb(this.value);
          }
        }
      }

      type HeroDataNetworkValue = NetworkValue<CustomNetTable.Invokation, Invokation.Key.HeroData>;
      type HeroDataValue = Key<CustomNetTable.Invokation, Invokation.Key.HeroData>;

      export class HeroData extends NetTableKeyListener<
        CustomNetTable.Invokation,
        Invokation.Key.HeroData,
        HeroDataValue
      > {
        constructor() {
          super(CustomNetTable.Invokation, Invokation.Key.HeroData);
        }

        protected override normalize(value: HeroDataNetworkValue): HeroDataValue {
          const spellComposition = {} as Record<Dota2.Invoker.Ability, Dota2.Invoker.OrbAbility[]>;

          for (const [k, v] of Object.entries(value.SPELL_COMPOSITION)) {
            spellComposition[k as Dota2.Invoker.Ability] = lua.fromArray(v);
          }

          return {
            ...value,
            // biome-ignore lint/style/useNamingConvention: remote data
            ORB_ABILITIES: lua.fromArray(value.ORB_ABILITIES),
            // biome-ignore lint/style/useNamingConvention: remote data
            SPELL_ABILITIES: lua.fromArray(value.SPELL_ABILITIES),
            // biome-ignore lint/style/useNamingConvention: remote data
            TALENT_ABILITIES: lua.fromArray(value.TALENT_ABILITIES),
            // biome-ignore lint/style/useNamingConvention: remote data
            SPELL_COMPOSITION: spellComposition,
          };
        }
      }

      type HeroKeyValuesNetworkValue = NetworkValue<CustomNetTable.Hero, Hero.Key.KeyValues>;
      type HeroKeyValuesValue = Key<CustomNetTable.Hero, Hero.Key.KeyValues>;

      export class HeroKeyValues extends NetTableKeyListener<
        CustomNetTable.Hero,
        Hero.Key.KeyValues,
        HeroKeyValuesValue
      > {
        constructor() {
          super(CustomNetTable.Hero, Hero.Key.KeyValues);
        }

        protected override normalize(value: HeroKeyValuesNetworkValue): HeroKeyValuesValue {
          return value;
        }
      }

      type AbilitiesKeyValuesNetworkValue = NetworkValue<
        CustomNetTable.Abilities,
        Abilities.Key.KeyValues
      >;

      type AbilitiesKeyValuesValue = Key<CustomNetTable.Abilities, Abilities.Key.KeyValues>;

      export class AbilitiesKeyValues extends NetTableKeyListener<
        CustomNetTable.Abilities,
        Abilities.Key.KeyValues,
        AbilitiesKeyValuesValue
      > {
        constructor() {
          super(CustomNetTable.Abilities, Abilities.Key.KeyValues);
        }

        protected override normalize(
          value: AbilitiesKeyValuesNetworkValue,
        ): AbilitiesKeyValuesValue {
          return value;
        }
      }
    }
  }
}
