import type { Callback as GenericCallback } from "../callbacks";
import { Callbacks } from "../callbacks";
import type { Key, Keys, Names, NetworkValue } from "../custom_net_tables";
import { CustomNetTable } from "../custom_net_tables";
import * as tableAbilities from "../custom_net_tables/abilities";
import * as tableHero from "../custom_net_tables/hero";
import * as tableInvokation from "../custom_net_tables/invokation";
import type * as invoker from "../dota2/invoker";
import { Logger } from "../logger";
import * as lua from "../lua";
import { NetTable } from "../net_table";

type Callback<V, E extends Event> = GenericCallback<Payloads<V>, E>;

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

type HeroDataNetworkValue = NetworkValue<CustomNetTable.Invokation, tableInvokation.Key.HeroData>;
type HeroDataValue = Key<CustomNetTable.Invokation, tableInvokation.Key.HeroData>;

export class HeroData extends NetTableKeyListener<
  CustomNetTable.Invokation,
  tableInvokation.Key.HeroData,
  HeroDataValue
> {
  constructor() {
    super(CustomNetTable.Invokation, tableInvokation.Key.HeroData);
  }

  protected override normalize(value: HeroDataNetworkValue): HeroDataValue {
    const spellComposition = {} as Record<invoker.Ability, invoker.OrbAbility[]>;

    for (const [k, v] of Object.entries(value.SPELL_COMPOSITION)) {
      spellComposition[k as invoker.Ability] = lua.fromArray(v);
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

type HeroKeyValuesNetworkValue = NetworkValue<CustomNetTable.Hero, tableHero.Key.KeyValues>;
type HeroKeyValuesValue = Key<CustomNetTable.Hero, tableHero.Key.KeyValues>;

export class HeroKeyValues extends NetTableKeyListener<
  CustomNetTable.Hero,
  tableHero.Key.KeyValues,
  HeroKeyValuesValue
> {
  constructor() {
    super(CustomNetTable.Hero, tableHero.Key.KeyValues);
  }

  protected override normalize(value: HeroKeyValuesNetworkValue): HeroKeyValuesValue {
    return value;
  }
}

type AbilitiesKeyValuesNetworkValue = NetworkValue<
  CustomNetTable.Abilities,
  tableAbilities.Key.KeyValues
>;

type AbilitiesKeyValuesValue = Key<CustomNetTable.Abilities, tableAbilities.Key.KeyValues>;

export class AbilitiesKeyValues extends NetTableKeyListener<
  CustomNetTable.Abilities,
  tableAbilities.Key.KeyValues,
  AbilitiesKeyValuesValue
> {
  constructor() {
    super(CustomNetTable.Abilities, tableAbilities.Key.KeyValues);
  }

  protected override normalize(value: AbilitiesKeyValuesNetworkValue): AbilitiesKeyValuesValue {
    return value;
  }
}
