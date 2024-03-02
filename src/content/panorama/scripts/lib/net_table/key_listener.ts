/// <reference path="../callbacks.ts" />
/// <reference path="../logger.ts" />
/// <reference path="../lua.ts" />
/// <reference path="custom_net_tables.ts" />
/// <reference path="net_table.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace net_table {
    export namespace key_listener {
      import lua = invk.lua;

      import Callbacks = invk.callbacks.Callbacks;
      import Logger = invk.logger.Logger;

      type Callback<V, E extends Event> = invk.callbacks.Callback<Payloads<V>, E>;

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
        private callbacks: Callbacks<Payloads<V>>;
        protected log: Logger;
        protected table: NetTable<N>;
        protected value: V | undefined;

        constructor(
          private name: N,
          private key: K,
        ) {
          this.callbacks = new Callbacks();
          this.table = new NetTable(this.name);
          this.log = new Logger({ name: `net_table.${this.name}.${String(this.key)}` });

          this.load();
          this.listenToNetTableChange();
        }

        private loadFromNetTable() {
          return this.table.get(this.key);
        }

        protected load() {
          this.log.debug("load()");

          if (this.value == null) {
            const value = this.loadFromNetTable();

            if (value != null) {
              this.set(value);
            }
          }
        }

        private listenToNetTableChange(): void {
          this.table.onKeyChange(this.key, this.onNetTableKeyChange.bind(this));
        }

        private onNetTableKeyChange(key: K, value: NetworkValue<N, K>): void {
          if (key !== this.key) {
            return;
          }

          this.log.debug("onNetTableChange()");
          this.set(value);
        }

        private set(value: NetworkValue<N, K> | null): void {
          if (value == null) {
            this.log.warning("Tried to set value with undefined");
            return;
          }

          this.value = this.normalize(value);

          this.callbacks.run(Event.Change, this.value);
        }

        /** Subclasses must override to provide network data normalization */
        protected abstract normalize(value: NetworkValue<N, K>): V;

        onChange(cb: Callback<V, Event.Change>): void {
          this.callbacks.on(Event.Change, cb);

          if (this.value) {
            cb(this.value);
          }
        }
      }

      type HeroDataNetworkValue = NetworkValue<CustomNetTable.Invokation, invokation.Key.HeroData>;
      type HeroDataValue = Key<CustomNetTable.Invokation, invokation.Key.HeroData>;

      export class HeroData extends NetTableKeyListener<
        CustomNetTable.Invokation,
        invokation.Key.HeroData,
        HeroDataValue
      > {
        constructor() {
          super(CustomNetTable.Invokation, invokation.Key.HeroData);
        }

        protected override normalize(value: HeroDataNetworkValue): HeroDataValue {
          const spellComposition = {} as Record<dota2.invoker.Ability, dota2.invoker.OrbAbility[]>;

          for (const [k, v] of Object.entries(value.SPELL_COMPOSITION)) {
            spellComposition[k as dota2.invoker.Ability] = lua.fromArray(v);
          }

          return {
            ...value,
            ORB_ABILITIES: lua.fromArray(value.ORB_ABILITIES),
            SPELL_ABILITIES: lua.fromArray(value.SPELL_ABILITIES),
            TALENT_ABILITIES: lua.fromArray(value.TALENT_ABILITIES),
            SPELL_COMPOSITION: spellComposition,
          };
        }
      }

      type HeroKeyValuesNetworkValue = NetworkValue<CustomNetTable.Hero, hero.Key.KeyValues>;
      type HeroKeyValuesValue = Key<CustomNetTable.Hero, hero.Key.KeyValues>;

      export class HeroKeyValues extends NetTableKeyListener<
        CustomNetTable.Hero,
        hero.Key.KeyValues,
        HeroKeyValuesValue
      > {
        constructor() {
          super(CustomNetTable.Hero, hero.Key.KeyValues);
        }

        protected override normalize(value: HeroKeyValuesNetworkValue): HeroKeyValuesValue {
          return value;
        }
      }

      type AbilitiesKeyValuesNetworkValue = NetworkValue<
        CustomNetTable.Abilities,
        abilities.Key.KeyValues
      >;

      type AbilitiesKeyValuesValue = Key<CustomNetTable.Abilities, abilities.Key.KeyValues>;

      export class AbilitiesKeyValues extends NetTableKeyListener<
        CustomNetTable.Abilities,
        abilities.Key.KeyValues,
        AbilitiesKeyValuesValue
      > {
        constructor() {
          super(CustomNetTable.Abilities, abilities.Key.KeyValues);
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
