"use strict";

(function(global /*, context */) {
  var module = {};

  module.Subscribe = function(name, fn) {
    return GameEvents.Subscribe(name, fn);
  };

  module.Unsubscribe = function(subscriptionId) {
    return GameEvents.Unsubscribe(subscriptionId);
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
