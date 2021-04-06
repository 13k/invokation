"use strict";

((global /*, context */) => {
  class Env {
    constructor(name) {
      this.name = name || Env.PRODUCTION;
    }

    get development() {
      return this.name == Env.DEVELOPMENT;
    }

    get production() {
      return this.name == Env.PRODUCTION;
    }
  }

  Env.DEVELOPMENT = "development";
  Env.PRODUCTION = "production";

  global.ENV = new Env(Game.IsInToolsMode() ? Env.DEVELOPMENT : Env.PRODUCTION);
})(GameUI.CustomUIConfig(), this);
