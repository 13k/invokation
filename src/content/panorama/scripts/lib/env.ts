export enum Name {
  Development = "development",
  Production = "production",
}

export class Env {
  name: Name;

  constructor(name = isDevelopment() ? Name.Development : Name.Production) {
    this.name = name;
  }

  get development() {
    return this.name === Name.Development;
  }

  get production() {
    return this.name === Name.Production;
  }
}

function isDevelopment(): boolean {
  return Game.IsInToolsMode() || Game.GetConvarInt("developer") > 0;
}

export const ENV = new Env();
