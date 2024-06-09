export enum CustomNetTable {
  Invokation = "invokation",
  Hero = "hero",
  Abilities = "abilities",
}

export type Names = keyof CustomNetTableDeclarations;
export type Table<N extends Names> = CustomNetTableDeclarations[N];
export type Keys<N extends Names> = keyof Table<N>;
export type Key<N extends Names, K extends Keys<N>> = Table<N>[K];

export type NetworkValue<N extends Names, K extends Keys<N> = Keys<N>> = NetworkedData<Key<N, K>>;

export type Entries<N extends Names> = {
  [K in Keys<N>]: {
    key: K;
    value: NetworkedData<Key<N, K>>;
  };
}[Keys<N>][];

export type Listener<N extends Names, K extends Keys<N> = Keys<N>> = (
  name: N,
  key: K,
  value: NetworkValue<N, K>,
) => void;

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
