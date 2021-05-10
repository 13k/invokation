export enum Environment {
  Development = "development",
  Production = "production",
}

export class Env {
  #env: Environment;

  constructor(env?: Environment) {
    this.#env = env || Environment.Production;
  }

  get development(): boolean {
    return this.#env === Environment.Development;
  }

  get production(): boolean {
    return this.#env === Environment.Production;
  }
}

export const ENV = new Env(Game.IsInToolsMode() ? Environment.Development : Environment.Production);
