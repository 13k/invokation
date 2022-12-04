export type NetworkTable<
  N extends keyof CustomNetTableDeclarations,
  T extends CustomNetTableDeclarations[N] = CustomNetTableDeclarations[N]
> = NetworkedData<T>;

export type NetworkValue<
  N extends keyof CustomNetTableDeclarations,
  T extends CustomNetTableDeclarations[N] = CustomNetTableDeclarations[N],
  K extends keyof T = keyof T
> = NetworkedData<T[K]>;

export type Entries<
  N extends keyof CustomNetTableDeclarations,
  T extends CustomNetTableDeclarations[N] = CustomNetTableDeclarations[N]
> = {
  [K in keyof T]: { key: K; value: NetworkedData<T[K]> };
}[keyof T][];

export type Listener<
  N extends keyof CustomNetTableDeclarations,
  T extends CustomNetTableDeclarations[N] = CustomNetTableDeclarations[N],
  K extends keyof T = keyof T
> = (key: K, value: NetworkValue<N, T, K>) => void;

const { lodash: _ } = CustomUIConfig;

class NetTable<
  N extends keyof CustomNetTableDeclarations,
  T extends CustomNetTableDeclarations[N] = CustomNetTableDeclarations[N]
> {
  private onChangeCallbacks: Listener<N, T>[];
  private onKeyChangeCallbacks: { [K in keyof T]?: Listener<N, T, K>[] };

  constructor(public name: N) {
    this.onChangeCallbacks = [];
    this.onKeyChangeCallbacks = {};

    this.subscribe(this._onChange.bind(this));
  }

  private subscribe(
    cb: (name: N, key: keyof T, value: NetworkValue<N, T>) => void
  ): NetTableListenerID {
    return CustomNetTables.SubscribeNetTableListener(this.name, cb);
  }

  private _onChange<K extends keyof T>(name: N, key: K, value: NetworkValue<N, T, K>) {
    if (name !== this.name) {
      return;
    }

    _.each(this.onChangeCallbacks, (cb) => cb(key, value));

    const keyListeners = _.get(this.onKeyChangeCallbacks, key, []);

    _.each(keyListeners, (cb) => cb(key, value));
  }

  all(): Entries<N, T> {
    return CustomNetTables.GetAllTableValues(this.name);
  }

  get<K extends keyof T>(key: K): NetworkValue<N, T, K> | null {
    return CustomNetTables.GetTableValue(this.name, key);
  }

  onChange(cb: Listener<N, T>): void {
    this.onChangeCallbacks.push(cb);
  }

  onKeyChange<K extends keyof T>(key: K, cb: Listener<N, T, K>): void {
    let callbacks = this.onKeyChangeCallbacks[key];

    if (!callbacks) {
      callbacks = [];
      this.onKeyChangeCallbacks[key] = callbacks;
    }

    callbacks.push(cb);
  }
}

export type { NetTable };

CustomUIConfig.NetTable = NetTable;
