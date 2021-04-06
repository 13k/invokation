"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;

  class Callbacks {
    constructor() {
      this.callbacks = {};
    }

    On(name, fn) {
      this.callbacks[name] = this.callbacks[name] || [];
      this.callbacks[name].push(fn);

      return name;
    }

    Run(name, payload) {
      _.over(_.get(this.callbacks, name, []))(payload);
    }
  }

  global.Callbacks = Callbacks;
})(GameUI.CustomUIConfig(), this);
