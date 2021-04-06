"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;

  const LEVELS = {
    UNKNOWN: 0,
    DEBUG: 10,
    INFO: 20,
    WARNING: 30,
    ERROR: 40,
    CRITICAL: 50,
  };

  const MAX_LEVEL_NAME_LEN = _.maxBy(_.keys(LEVELS), "length").length;
  const LEVEL_NAMES = _.invert(LEVELS);

  class Logger {
    constructor(options) {
      options = options || {};

      this.level = options.level || LEVELS.INFO;
      this.progname = options.progname && `[${options.progname}]`;
    }

    log(level) {
      level = parseInt(level) || -1;

      if (level < this.level || arguments.length < 2) {
        return;
      }

      const name = LEVEL_NAMES[level];
      let args = _.chain([_.padStart(name, MAX_LEVEL_NAME_LEN)]);

      if (this.progname) {
        args = args.push(this.progname);
      }

      args = args
        .concat(_.drop(arguments))
        .flatMap((arg) => [arg, " "])
        .dropRight()
        .value();

      return $.Msg.apply(null, args);
    }

    logFn(level, fn) {
      if (level < this.level) {
        return;
      }

      let values = fn();

      if (!values) {
        return;
      }

      if (!_.isArray(values)) {
        values = [values];
      }

      const args = _.concat([level], values);

      return this.log.apply(this, args);
    }
  }

  _.forEach(LEVELS, (value, name) => {
    if (name === "UNKNOWN") return;

    const baseName = _.lowerCase(name);

    Logger.prototype[baseName] = function () {
      const args = _.concat([value], arguments);
      return this.log.apply(this, args);
    };

    Logger.prototype[`${baseName}Fn`] = function () {
      const args = _.concat([value], arguments);
      return this.logFn.apply(this, args);
    };
  });

  _.assign(Logger, LEVELS);

  global.Logger = Logger;
})(GameUI.CustomUIConfig(), this);
