"use strict";

(function(global /*, context */) {
  var _ = global.lodash;
  var FlattenObjectWith = global.Util.FlattenObjectWith;

  var module = {};

  var subscriptions = {};

  // "escape" keys by surrounding key parts with brackets
  function cacheKey(key) {
    var bracketify = function(k) {
      return "[" + k + "]";
    };

    return _.chain(key)
      .split(".")
      .map(bracketify)
      .value();
  }

  // "unescape" cache keys
  function uncacheKey(key) {
    var unbracket = _.chain(_.trim)
      .partialRight("[]")
      .unary()
      .value();

    return _.chain(key)
      .split(".")
      .map(unbracket)
      .join(".")
      .value();
  }

  function cacheGet(key) {
    var path = cacheKey(key);
    var page = _.get(subscriptions, path);

    if (!page) {
      page = [];
      _.set(subscriptions, path, page);
    }

    return page;
  }

  function cacheAdd(key, subscriptionId) {
    var page = cacheGet(key);
    page.push(subscriptionId);
    return subscriptionId;
  }

  module.Subscribe = function(key, name, fn) {
    key += "." + name;
    return cacheAdd(key, GameEvents.Subscribe(name, fn));
  };

  module.Unsubscribe = function(subscriptionId) {
    GameEvents.Unsubscribe(subscriptionId);
    return subscriptionId;
  };

  module.UnsubscribeAll = function(subscriptionIds) {
    return _.map(subscriptionIds, module.Unsubscribe);
  };

  module.UnsubscribeAllSiblings = function(key) {
    var path = cacheKey(key);
    var slabPath = _.initial(path);
    var pageId = _.last(path);

    if (_.isEmpty(slabPath)) {
      return;
    }

    var slab = _.get(subscriptions, slabPath);

    if (!_.isPlainObject(slab)) {
      return;
    }

    var siblings = _.omit(slab, pageId);
    // recursively unsubscribe all siblings
    var result = FlattenObjectWith(siblings, slabPath, module.UnsubscribeAll);
    // unset all siblings
    _.transform(siblings, _.rearg(_.unset, [0, 2]), slab);
    // convert keys back to non-bracket form
    return _.mapKeys(result, _.rearg(uncacheKey, [1]));
  };

  module.SendServer = function(name, payload) {
    return GameEvents.SendCustomGameEventToServer(name, payload || {});
  };

  module.SendAll = function(name, payload) {
    return GameEvents.SendCustomGameEventToAllClients(name, payload || {});
  };

  module.SendPlayer = function(playerIndex, name, payload) {
    return GameEvents.SendCustomGameEventToClient(name, playerIndex, payload || {});
  };

  module.SendClientSide = function(name, payload) {
    return GameEvents.SendEventClientSide(name, payload || {});
  };

  global.CustomEvents = module;
})(GameUI.CustomUIConfig(), this);
