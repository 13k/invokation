"use strict";

(function (global /*, context */) {
  var _ = global.lodash;
  var Class = global.Class;

  var LEVELS = {
    UNKNOWN: 0,
    DEBUG: 10,
    INFO: 20,
    WARNING: 30,
    ERROR: 40,
    CRITICAL: 50,
  };

  var MAX_LEVEL_NAME_LEN = _.maxBy(_.keys(LEVELS), "length").length;
  var LEVEL_NAMES = _.invert(LEVELS);

  var prototype = {
    constructor: function Logger(options) {
      options = options || {};
      this.level = options.level || LEVELS.INFO;
      this.progname = options.progname && "[" + options.progname + "]";
    },

    log: function (level) {
      level = parseInt(level) || -1;

      if (level < this.level || arguments.length < 2) {
        return;
      }

      var name = LEVEL_NAMES[level];
      var args = _.chain([_.padStart(name, MAX_LEVEL_NAME_LEN)]);

      if (this.progname) {
        args = args.push(this.progname);
      }

      args = args
        .concat(_.drop(arguments))
        .flatMap(function (arg) {
          return [arg, " "];
        })
        .dropRight()
        .value();

      return $.Msg.apply(null, args);
    },

    logFn: function (level, fn) {
      if (level < this.level) {
        return;
      }

      var values = fn();

      if (!values) {
        return;
      }

      if (!_.isArray(values)) {
        values = [values];
      }

      var args = _.concat([level], values);
      return this.log.apply(this, args);
    },
  };

  _.forEach(LEVELS, function (value, name) {
    if (name === "UNKNOWN") return;

    var baseName = _.lowerCase(name);

    prototype[baseName] = function () {
      var args = _.concat([value], arguments);
      return this.log.apply(this, args);
    };

    prototype[baseName + "Fn"] = function () {
      var args = _.concat([value], arguments);
      return this.logFn.apply(this, args);
    };
  });

  var Logger = Class(prototype);

  _.assign(Logger, LEVELS);

  global.Logger = Logger;
})(GameUI.CustomUIConfig(), this);
