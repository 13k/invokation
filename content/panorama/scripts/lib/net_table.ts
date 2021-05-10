import { Callbacks } from "./callbacks";
import type {
  Callbacks as NetTablesCallbacks,
  ChangeListener,
  Listener,
  TableEntries,
  TableKey,
  TableName,
  TableValue,
} from "./const/net_table";

export class NetTable<N extends TableName> {
  #cb: Callbacks<NetTablesCallbacks<N>>;

  constructor(public name: N) {
    this.#cb = new Callbacks();

    this.subscribe(this._onChange.bind(this));
  }

  private _onChange<K extends TableKey<N>, V extends NetworkedData<TableValue<N, K>>>(
    table: N,
    key: K,
    value: V
  ) {
    if (table !== this.name) {
      return;
    }

    this.#cb.run(key, { table, key, value });
  }

  subscribe(listener: Listener<N>): NetTableListenerID {
    return CustomNetTables.SubscribeNetTableListener(this.name, listener);
  }

  onKeyChange<K extends TableKey<N>>(key: K, listener: ChangeListener<N, K>): void {
    this.#cb.on(key, listener);
  }

  all(): TableEntries<N> {
    return CustomNetTables.GetAllTableValues(this.name);
  }

  get<K extends TableKey<N>>(key: K): NetworkedData<TableValue<N, K>> {
    return CustomNetTables.GetTableValue(this.name, key);
  }
}
