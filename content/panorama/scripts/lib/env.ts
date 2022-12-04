enum Name {
  Development = "development",
  Production = "production",
}

class Env {
  static Name = Name;

  constructor(public name = Game.IsInToolsMode() ? Name.Development : Name.Production) {}

  get development() {
    return this.name === Name.Development;
  }

  get production() {
    return this.name === Name.Production;
  }
}

export type { Env, Name };

CustomUIConfig.Env = Env;
CustomUIConfig.ENV = new Env();
