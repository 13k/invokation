"use strict";

(function(C) {
  C.Class = function() {
    var len = arguments.length;
    var body = arguments[len - 1];
    var klass;
    var uber = len > 1 ? arguments[0] : Object;
    var properties = {};

    if (body.hasOwnProperty("constructor")) {
      klass = body.constructor;
      delete body.constructor;
    } else {
      klass = function() {};
    }

    for (var key in body) {
      if (!body.hasOwnProperty(key)) {
        continue;
      }

      properties[key] = {
        value: body[key],
        configurable: true,
        enumerable: true,
        writable: true,
      };
    }

    klass.prototype = Object.create(uber.prototype, properties);
    klass.prototype.constructor = klass;
    klass.super = uber;

    return klass;
  };
})(GameUI.CustomUIConfig());
