"use strict";

const glob = require("glob");
const path = require("path");
const yaml = require("js-yaml");
const { readFileSync } = require("fs");

const { spawn } = require("./util");

const LUAFORMATTER_BIN = "lua-format";
const LUAFORMATTER_CONFIG = ".lua-format";

function loadFormatConfig(filename) {
  let data;

  try {
    data = readFileSync(filename, "utf-8");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;

    return {};
  }

  return yaml.safeLoad(data);
}

function findFiles(fmtConfig, { rootPath }) {
  const pattern = path.join(rootPath, "**", "*.lua");
  const ignore = (fmtConfig.ignore || []).map((patt) => path.join(rootPath, patt));

  return glob.sync(pattern, {
    strict: true,
    nodir: true,
    ignore,
  });
}

function formatFile(fmtConfigPath, filename, { noop }, { log, rootPath }) {
  const relPath = path.relative(rootPath, filename);

  if (noop) {
    return log.info(relPath, { label: "skip" });
  }

  const args = ["-c", fmtConfigPath, "-i", filename];

  spawn(LUAFORMATTER_BIN, args);

  log.success(relPath, { label: "format" });
}

async function format(options, config) {
  const { rootPath } = config;
  const fmtConfigPath = path.join(rootPath, LUAFORMATTER_CONFIG);
  const fmtConfig = loadFormatConfig(fmtConfigPath);
  const filenames = findFiles(fmtConfig, config);

  filenames.forEach((filename) => formatFile(fmtConfigPath, filename, options, config));
}

module.exports = (options, config) => format(options, config);
