"use strict";

const { readFileSync } = require("fs");
const { spawnSync } = require("child_process");

const glob = require("glob");
const yaml = require("js-yaml");

async function loadConfig(filename) {
  let src;

  try {
    src = readFileSync(filename, "utf-8");
  } catch (err) {
    return {};
  }

  return yaml.safeLoad(src);
}

async function findFiles(config) {
  const ignore = config.ignore || [];
  const options = { strict: true, nodir: true, ignore };

  return glob.sync("**/*.lua", options);
}

async function formatFiles(files) {
  files.forEach(formatFile);
}

function formatFile(file) {
  console.log(file);

  const res = spawnSync("lua-format", ["-i", file], { encoding: "utf-8" });

  if (res.error) {
    throw res.error;
  }

  if (res.status !== 0) {
    throw `${file}: lua-format exited with status ${res.status}`;
  }
}

loadConfig(".lua-format").then(findFiles).then(formatFiles);
