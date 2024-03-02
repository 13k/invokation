/// <reference path="env.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace singleton {
    import Env = invk.env.Env;

    export const ENV = new Env();
  }
}
