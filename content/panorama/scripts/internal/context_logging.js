"use strict";

var LAYOUT_FILE_PREFIX = "panorama/layout/custom_game/";

var _logger;

function extractHeading(ctxPanel) {
  var heading = ctxPanel.layoutfile
    .replace(/\\/g, "/")
    .replace(LAYOUT_FILE_PREFIX, "")
    .replace(".xml", "");

  return "[" + heading + "] ";
}

function Logger(ctxPanel) {
  this.heading = extractHeading(ctxPanel);
}

Logger.prototype.Log = function() {
  var args = [this.heading];
  args = args.concat(Array.prototype.slice.call(arguments));
  return $.Msg.apply(null, args);
};

function L() {
  _logger.Log.apply(_logger, arguments);
}

(function() {
  _logger = new Logger($.GetContextPanel());
})();