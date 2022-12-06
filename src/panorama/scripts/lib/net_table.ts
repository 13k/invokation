/// <reference path="custom_net_tables.ts" />

namespace invk {
  export namespace NetTable {
    type Names = keyof CustomNetTableDeclarations;
    type Table<N extends Names> = CustomNetTableDeclarations[N];
    type Keys<N extends Names> = keyof Table<N>;

    export type Listener<N extends Names, K extends Keys<N> = Keys<N>> = (
      key: K,
      value: CustomNetTables.NetworkValue<N, K>
    ) => void;

    export class NetTable<N extends Names> {
      private changeListeners: Listener<N>[];
      private keyChangeListeners: { [K in Keys<N>]?: Listener<N, K>[] };

      constructor(public name: N) {
        this.changeListeners = [];
        this.keyChangeListeners = {};

        CustomNetTables.subscribe(this.name, this._onChange.bind(this));
      }

      private _onChange<K extends Keys<N>>(
        name: N,
        key: K,
        value: CustomNetTables.NetworkValue<N, K>
      ) {
        if (name !== this.name) {
          return;
        }

        const keyListeners = this.keyChangeListeners[key] || [];
        const listeners = [...this.changeListeners, ...keyListeners];

        listeners.forEach((cb) => cb(key, value));
      }

      entries(): CustomNetTables.Entries<N> {
        return CustomNetTables.entries(this.name);
      }

      get<K extends Keys<N>>(key: K): CustomNetTables.NetworkValue<N, K> | null {
        return CustomNetTables.get(this.name, key);
      }

      onChange(cb: Listener<N>): void {
        this.changeListeners.push(cb);
      }

      onKeyChange<K extends Keys<N>>(key: K, cb: Listener<N, K>): void {
        const cbs = this.keyChangeListeners[key] || (this.keyChangeListeners[key] = []);

        cbs.push(cb);
      }
    }
  }
}
