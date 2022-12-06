/// <reference path="callbacks.ts" />
/// <reference path="logger.ts" />
/// <reference path="lua.ts" />
/// <reference path="net_table.ts" />

namespace invk {
  export namespace NetTableListener {
    const {
      Callbacks: { Callbacks },
      Logger: { Logger },
      NetTable: { NetTable },
    } = invk;

    type Names = keyof CustomNetTableDeclarations;
    type Table<N extends Names> = CustomNetTableDeclarations[N];
    type Keys<N extends Names> = keyof Table<N>;
    type Key<N extends Names, K extends Keys<N>> = Table<N>[K];

    enum Event {
      Change = "change",
    }

    interface Payloads<V> {
      [Event.Change]: V;
    }

    export class NetTableListener<N extends Names, K extends Keys<N>, V = Key<N, K>> {
      private callbacks: Callbacks.Callbacks<Payloads<V>>;
      protected log: Logger.Logger;
      protected table: NetTable.NetTable<N>;
      protected data?: V | undefined;

      constructor(private name: N, private key: K) {
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

        if (!this.data) {
          const data = this.loadFromNetTable();

          if (data != null) {
            this.set(data);
          }
        }
      }

      private listenToNetTableChange(): void {
        this.table.onKeyChange(this.key, this.onNetTableKeyChange.bind(this));
      }

      private onNetTableKeyChange(key: K, value: CustomNetTables.NetworkValue<N, K>): void {
        if (key !== this.key) {
          return;
        }

        this.log.debug("onNetTableChange()");
        this.set(value);
      }

      private set(value: CustomNetTables.NetworkValue<N, K> | null): void {
        if (!value) {
          this.log.warning("tried to set data with an undefined value");
          return;
        }

        this.data = this.normalize(value);

        this.callbacks.run(Event.Change, this.data);
      }

      protected normalize(value: CustomNetTables.NetworkValue<N, K>): V {
        return Lua.fromArrayDeep(value) as V;
      }

      onChange(cb: Callbacks.Callback<Payloads<V>, Event.Change>): void {
        this.callbacks.on(Event.Change, cb);

        if (this.data) {
          cb(this.data);
        }
      }
    }
  }
}
