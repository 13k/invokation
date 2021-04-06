"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;
  const { FlattenObjectWith } = global.Util;

  const subscriptions = {};

  // surround a string with brackets
  const bracketify = (k) => `[${k}]`;
  // remove surrounding brackets
  const unbracketify = _.chain(_.trim).partialRight("[]").unary().value();
  // "escape" keys by surrounding key parts with brackets
  const cacheKey = (key) => _.chain(key).split(".").map(bracketify).value();
  // "unescape" cache keys
  const uncacheKey = (key) => _.chain(key).split(".").map(unbracketify).join(".").value();

  const cacheGet = (key) => {
    const path = cacheKey(key);
    let page = _.get(subscriptions, path);

    if (!page) {
      page = [];

      _.set(subscriptions, path, page);
    }

    return page;
  };

  const cacheAdd = (key, subscriptionId) => {
    const page = cacheGet(key);

    page.push(subscriptionId);

    return subscriptionId;
  };

  const CustomEvents = {};

  CustomEvents.Subscribe = (key, name, fn) =>
    cacheAdd(`${key}.${name}`, GameEvents.Subscribe(name, fn));

  CustomEvents.Unsubscribe = (subscriptionId) => {
    GameEvents.Unsubscribe(subscriptionId);

    return subscriptionId;
  };

  CustomEvents.UnsubscribeAll = (subscriptionIds) =>
    _.map(subscriptionIds, CustomEvents.Unsubscribe);

  CustomEvents.UnsubscribeAllSiblings = (key) => {
    const path = cacheKey(key);
    const slabPath = _.initial(path);
    const pageId = _.last(path);

    if (_.isEmpty(slabPath)) {
      return;
    }

    const slab = _.get(subscriptions, slabPath);

    if (!_.isPlainObject(slab)) {
      return;
    }

    const siblings = _.omit(slab, pageId);
    // recursively unsubscribe all siblings
    const result = FlattenObjectWith(siblings, slabPath, CustomEvents.UnsubscribeAll);
    // unset all siblings
    _.transform(siblings, _.rearg(_.unset, [0, 2]), slab);
    // convert keys back to non-bracket form
    return _.mapKeys(result, _.rearg(uncacheKey, [1]));
  };

  CustomEvents.SendServer = (name, payload) =>
    GameEvents.SendCustomGameEventToServer(name, payload || {});

  CustomEvents.SendAll = (name, payload) =>
    GameEvents.SendCustomGameEventToAllClients(name, payload || {});

  CustomEvents.SendPlayer = (playerIndex, name, payload) =>
    GameEvents.SendCustomGameEventToClient(name, playerIndex, payload || {});

  CustomEvents.SendClientSide = (name, payload) =>
    GameEvents.SendEventClientSide(name, payload || {});

  global.CustomEvents = CustomEvents;
})(GameUI.CustomUIConfig(), this);
