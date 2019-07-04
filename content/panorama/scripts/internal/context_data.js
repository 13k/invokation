"use strict";

(function() {
  var ctx = $.GetContextPanel();
  ctx.data = ctx.data || {};
})();

function SetContextData(key, value) {
  var ctx = $.GetContextPanel();
  ctx.data[key] = value;
  return ctx.data;
}

function UpdateContextData(data) {
  var ctx = $.GetContextPanel();

  $.Each(data, function(value, key) {
    ctx.data[key] = value;
  });

  return ctx.data;
}

function GetContextData(key) {
  return $.GetContextPanel().data[key];
}