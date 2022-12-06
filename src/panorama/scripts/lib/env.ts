namespace invk {
  export namespace Env {
    export enum Name {
      Development = "development",
      Production = "production",
    }

    export class Env {
      static Name = Name;

      constructor(public name = Game.IsInToolsMode() ? Name.Development : Name.Production) {}

      get development() {
        return this.name === Name.Development;
      }

      get production() {
        return this.name === Name.Production;
      }
    }
  }
}
