import type { Entries, Keys, Names, NetworkValue } from "./custom_net_tables";
import { entries, get, subscribe } from "./custom_net_tables";

export type NetTableListener<N extends Names, K extends Keys<N> = Keys<N>> = (
  key: K,
  value: NetworkValue<N, K>,
) => void;

type KeyChangeListeners<N extends Names> = {
  [K in Keys<N>]?: NetTableListener<N, K>[];
};

export class NetTable<N extends Names> {
  name: N;

  #changeListeners: NetTableListener<N>[] = [];
  #keyChangeListeners: KeyChangeListeners<N> = {};

  constructor(name: N) {
    this.name = name;

    subscribe(this.name, this.#onChange.bind(this));
  }

  #onChange<K extends Keys<N>>(name: N, key: K, value: NetworkValue<N, K>) {
    if (name !== this.name) {
      return;
    }

    const keyListeners = this.#keyChangeListeners[key] ?? [];
    const listeners = [...this.#changeListeners, ...keyListeners];

    for (const cb of listeners) {
      cb(key, value);
    }
  }

  entries(): Entries<N> {
    return entries(this.name);
  }

  get<K extends Keys<N>>(key: K): NetworkValue<N, K> | null {
    return get(this.name, key);
  }

  onChange(cb: NetTableListener<N>): void {
    this.#changeListeners.push(cb);
  }

  onKeyChange<K extends Keys<N>>(key: K, cb: NetTableListener<N, K>): void {
    this.#keyChangeListeners[key] ??= [];
    this.#keyChangeListeners[key]?.push(cb);
  }
}
