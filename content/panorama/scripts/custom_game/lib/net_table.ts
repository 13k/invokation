import { Callbacks } from "./callbacks";

export class NetTable<N extends invk.NetTables.TableName> {
  #cb: Callbacks<invk.NetTables.Callbacks<N>>;

  constructor(public name: N) {
    this.#cb = new Callbacks();

    this.subscribe(this._onChange.bind(this));
  }

  private _onChange<
    K extends invk.NetTables.TableKey<N>,
    V extends NetworkedData<invk.NetTables.TableValue<N, K>>
  >(table: N, key: K, value: V) {
    if (table !== this.name) {
      return;
    }

    this.#cb.run(key, { table, key, value });
  }

  subscribe(listener: invk.NetTables.Listener<N>): NetTableListenerID {
    return CustomNetTables.SubscribeNetTableListener(this.name, listener);
  }

  onKeyChange<K extends invk.NetTables.TableKey<N>>(
    key: K,
    listener: invk.NetTables.ChangeListener<N, K>
  ): void {
    this.#cb.on(key, listener);
  }

  all(): invk.NetTables.TableEntries<N> {
    return CustomNetTables.GetAllTableValues(this.name);
  }

  get<K extends invk.NetTables.TableKey<N>>(
    key: K
  ): NetworkedData<invk.NetTables.TableValue<N, K>> {
    return CustomNetTables.GetTableValue(this.name, key);
  }
}
