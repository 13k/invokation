export type Callback<T, K extends keyof T> = (payload: T[K]) => void;

export type Listeners<T> = {
  [K in keyof T]: Callback<T, K>;
};

type CallbacksStore<T> = {
  [K in keyof T]?: Callback<T, K>[];
};

export class Callbacks<T> {
  #store: CallbacksStore<T> = {};

  on<K extends keyof T>(event: K, cb: Callback<T, K>): void {
    this.#store[event] ??= [];
    this.#store[event]?.push(cb);
  }

  run<K extends keyof T>(event: K, payload: T[K]): void {
    for (const cb of this.#store[event] ?? []) {
      cb(payload);
    }
  }
}
