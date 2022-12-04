import type { Callback, Callbacks as TCallbacks } from "./callbacks";
import type { Logger as TLogger } from "./logger";
import type { NetTable as TNetTable, NetworkValue } from "./net_table";

const { Callbacks, Logger, Lua, NetTable } = CustomUIConfig;

enum CallbackName {
  Change = "change",
}

class NetTableListener<
  N extends keyof CustomNetTableDeclarations,
  K extends keyof CustomNetTableDeclarations[N],
  D = CustomNetTableDeclarations[N][K]
> {
  private callbacks: TCallbacks;
  protected log: TLogger;
  protected table: TNetTable<N, CustomNetTableDeclarations[N]>;
  protected data?: D;

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

  private onNetTableKeyChange(
    key: K,
    value: NetworkValue<N, CustomNetTableDeclarations[N], K>
  ): void {
    if (key !== this.key) {
      return;
    }

    this.log.debug("onNetTableChange()");
    this.set(value);
  }

  private set(value: NetworkValue<N, CustomNetTableDeclarations[N], K> | null): void {
    if (!value) {
      this.log.warning("tried to set data with an undefined value");
      return;
    }

    this.data = this.normalize(value);

    this.callbacks.run(CallbackName.Change, this.data);
  }

  protected normalize(value: NetworkValue<N, CustomNetTableDeclarations[N], K>): D {
    return Lua.fromArrayDeep(value) as D;
  }

  onChange(fn: Callback): void {
    this.callbacks.on(CallbackName.Change, fn);

    if (this.data) {
      fn(this.data);
    }
  }
}

export type { NetTableListener };

CustomUIConfig.NetTableListener = NetTableListener;
