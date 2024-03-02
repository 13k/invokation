// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace callbacks {
    export type Callback<T, K extends keyof T> = (payload: T[K]) => void;

    export type Listeners<T> = {
      [K in keyof T]: Callback<T, K>;
    };

    type CallbacksStore<T> = {
      [K in keyof T]?: Callback<T, K>[];
    };

    export class Callbacks<T> {
      private cbs: CallbacksStore<T> = {};

      on<K extends keyof T>(event: K, cb: Callback<T, K>): void {
        this.cbs[event] ??= [];
        this.cbs[event]?.push(cb);
      }

      run<K extends keyof T>(event: K, payload: T[K]): void {
        for (const cb of this.cbs[event] ?? []) {
          cb(payload);
        }
      }
    }
  }
}
