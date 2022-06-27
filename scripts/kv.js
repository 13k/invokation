const fs = require("fs");
const { parse } = require("kv3tojs");

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

function parseFile(filename) {
  const src = fs.readFileSync(filename, { encoding: "utf-8" });

  return parse(src);
}

module.exports = {
  getBoolean,
  getNumber,
  parse,
  parseFile,
};
