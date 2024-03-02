// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace env {
    export enum Name {
      Development = "development",
      Production = "production",
    }

    export class Env {
      static Name = Name;

      constructor(public name = isDevelopment() ? Name.Development : Name.Production) {}

      get development() {
        return this.name === Name.Development;
      }

      get production() {
        return this.name === Name.Production;
      }
    }

    function isDevelopment(): boolean {
      // @ts-expect-error `Game.GetConvar*` functions are missing from types
      return Game.IsInToolsMode() || Game.GetConvarInt("developer") > 0;
    }
  }
}
