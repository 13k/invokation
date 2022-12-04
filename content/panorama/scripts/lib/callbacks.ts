const { lodash: _ } = CustomUIConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callback = (payload: any) => void;

class Callbacks {
  private callbacks: Record<string, Callback[]> = {};

  on(name: string, cb: Callback): void {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(cb);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(name: string, payload: any): void {
    const cbs = _.get(this.callbacks, name, []);

    _.over(cbs)(payload);
  }
}

export type { Callbacks };

CustomUIConfig.Callbacks = Callbacks;
