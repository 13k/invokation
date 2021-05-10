const { deserialize, deserializeFile } = require("valve-kv");

function getBoolean(kv, key, defaultValue) {
  const value = kv[key];

  defaultValue = defaultValue !== undefined ? defaultValue : false;

  return typeof value === "string" ? value === "1" : defaultValue;
}

function getNumber(kv, key, defaultValue) {
  const value = kv[key];

  defaultValue = defaultValue !== undefined ? defaultValue : null;

  return typeof value === "string" ? +value : defaultValue;
}

module.exports = {
  getBoolean,
  getNumber,
  parse: deserialize,
  parseFile: deserializeFile,
};
