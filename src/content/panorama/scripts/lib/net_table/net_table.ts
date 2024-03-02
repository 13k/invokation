/// <reference path="custom_net_tables.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace net_table {
    export type NetTableListener<N extends Names, K extends Keys<N> = Keys<N>> = (
      key: K,
      value: NetworkValue<N, K>,
    ) => void;

    type KeyChangeListeners<N extends Names> = {
      [K in Keys<N>]?: NetTableListener<N, K>[];
    };

    export class NetTable<N extends Names> {
      private changeListeners: NetTableListener<N>[];
      private keyChangeListeners: KeyChangeListeners<N>;

      constructor(public name: N) {
        this.changeListeners = [];
        this.keyChangeListeners = {};

        net_table.subscribe(this.name, this._onChange.bind(this));
      }

      private _onChange<K extends Keys<N>>(name: N, key: K, value: NetworkValue<N, K>) {
        if (name !== this.name) {
          return;
        }

        const keyListeners = this.keyChangeListeners[key] ?? [];
        const listeners = [...this.changeListeners, ...keyListeners];

        for (const cb of listeners) {
          cb(key, value);
        }
      }

      entries(): Entries<N> {
        return net_table.entries(this.name);
      }

      get<K extends Keys<N>>(key: K): NetworkValue<N, K> | null {
        return net_table.get(this.name, key);
      }

      onChange(cb: NetTableListener<N>): void {
        this.changeListeners.push(cb);
      }

      onKeyChange<K extends Keys<N>>(key: K, cb: NetTableListener<N, K>): void {
        this.keyChangeListeners[key] ??= [];
        this.keyChangeListeners[key]?.push(cb);
      }
    }
  }
}
