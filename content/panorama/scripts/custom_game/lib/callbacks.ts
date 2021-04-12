type Storage<T> = { [K in keyof T]: Callback<T[K]>[] };

export type Callback<P> = (payload: P) => void;

export class Callbacks<T> {
  #cb: Storage<T>;

  constructor() {
    this.#cb = {} as Storage<T>;
  }

  on<E extends keyof T>(event: E, callback: Callback<T[E]>): E {
    if (typeof event !== "string") {
      throw new Error("Invalid callback name: not a string");
    }

    if (typeof callback !== "function") {
      throw new Error("Invalid callback handler: not a function");
    }

    this.#cb[event] ||= [];
    this.#cb[event].push(callback);

    return event;
  }

  run<E extends keyof T>(event: E, payload: T[E]): void {
    const cbs = this.#cb[event] || [];

    cbs.forEach((cb) => cb(payload));
  }
}
