/// <reference path="net_table/custom_net_tables.ts" />
/// <reference path="net_table/key_listener.ts" />
/// <reference path="net_table/net_table.ts" />

namespace invk {
  export namespace NetTable {
    export function subscribe<N extends Names>(name: N, listener: Listener<N>): NetTableListenerID {
      return CustomNetTables.SubscribeNetTableListener(name, listener);
    }

    export function entries<N extends Names>(name: N): Entries<N> {
      return CustomNetTables.GetAllTableValues(name);
    }

    export function get<N extends Names, K extends Keys<N>>(
      name: N,
      key: K,
    ): NetworkValue<N, K> | null {
      return CustomNetTables.GetTableValue(name, key);
    }
  }
}
