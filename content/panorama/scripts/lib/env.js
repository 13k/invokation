"use strict";

(function (global /*, context */) {
  var Class = global.Class;

  var Env = Class({
    constructor: function Env(name) {
      this.name = name || Env.PRODUCTION;
      this.development = this.name == Env.DEVELOPMENT;
      this.production = this.name == Env.PRODUCTION;
    },
  });

  Env.DEVELOPMENT = "development";
  Env.PRODUCTION = "production";

  global.ENV = new Env(Game.IsInToolsMode() ? Env.DEVELOPMENT : Env.PRODUCTION);
})(GameUI.CustomUIConfig(), this);
