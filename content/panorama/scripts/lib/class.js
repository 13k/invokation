"use strict";

(function (global /*, context */) {
  var _ = global.lodash;

  global.Class = function () {
    var args, body, base, mixins, klass;

    args = _.toArray(arguments);
    body = _.last(args) || {};
    args = _.dropRight(args);
    base = _.first(args) || Object;
    args = _.drop(args);
    mixins = args;

    if (_.has(body, "constructor")) {
      klass = body.constructor;
    } else {
      klass = function () {};
      body.constructor = klass;
    }

    klass.id = _.uniqueId(klass.name + ".");
    klass.super = base;
    klass.prototype = _.create(klass.super.prototype, { classid: klass.id });

    var assignArgs = _.chain([klass.prototype]).concat(mixins).push(body).value();

    _.assign.apply(_, assignArgs);

    return klass;
  };
})(GameUI.CustomUIConfig(), this);
