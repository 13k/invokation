"use strict";

(function(C) {
  var _ = C.lodash;

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
  var DEFAULT_LEVEL = Game.IsInToolsMode() ? LEVELS.DEBUG : LEVELS.INFO;

  var module = function Logger(options) {
    options = options || {};
    this.level = options.level || DEFAULT_LEVEL;
    this.progname = options.progname && "[" + options.progname + "]";
  };

  module.prototype.log = function(level) {
    if (level < this.level) {
      return;
    }

    var args = _.chain([_.padStart(LEVEL_NAMES[level], MAX_LEVEL_NAME_LEN)]);

    if (this.progname) {
      args = args.push(this.progname);
    }

    args = args
      .concat(_.drop(arguments))
      .flatMap(function(arg) {
        return [arg, " "];
      })
      .dropRight()
      .value();

    return $.Msg.apply(null, args);
  };

  _.forEach(LEVELS, function(value, name) {
    if (name === "UNKNOWN") return;

    module.prototype[_.lowerCase(name)] = function() {
      var args = _.concat([value], arguments);
      return this.log.apply(this, args);
    };
  });

  module.LEVELS = LEVELS;

  C.Logger = module;
})(GameUI.CustomUIConfig());
