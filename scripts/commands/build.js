"use strict";

const fs = require("fs");
const glob = require("glob");
const path = require("path");
const temp = require("temp");

const wsl = require("../wsl");
const { spawn } = require("../util");

temp.track();

function compile(args, { force }, { log, dota2 }) {
  args = args.slice(0);

  if (force) {
    args.push("-fshallow");
  }

  return spawn(dota2.resourceCompilerBinPath, args, { log, cwd: dota2.path });
}

function resourceRelPath(filename, { sources, dota2, customGame }) {
  const relPath = path.relative(sources.contentPath, filename);
  const customGameFilename = path.join(customGame.contentPath, relPath);

  return path.relative(dota2.path, customGameFilename);
}

function mapsGlobPattern({ sources }) {
  return path.join(sources.contentPath, "maps", "**", "*.vmap");
}

function findMaps(config) {
  return glob.sync(mapsGlobPattern(config), {
    strict: true,
    nodir: true,
  });
}

function compileMap(filename, options, config) {
  const { log, rootPath } = config;
  const customGameRelPath = resourceRelPath(filename, config);
  const args = ["-i", customGameRelPath];
  const relPath = path.relative(rootPath, filename);

  log.info(relPath, { label: "compile" });

  compile(args, options, config);
}

async function compileMaps(options, config) {
  const compiler = (filename) => compileMap(filename, options, config);

  findMaps(config).forEach(compiler);
}

function resourcesGlobPattern({ sources }) {
  return path.join(sources.contentPath, "**", "*");
}

function findResources(config) {
  const pattern = resourcesGlobPattern(config);

  return glob.sync(pattern, {
    strict: true,
    nodir: true,
    ignore: [mapsGlobPattern(config)],
  });
}

function writeResourcesList(filenames, config) {
  const tmpFile = temp.openSync();
  const writer = (filename) => fs.writeSync(tmpFile.fd, `${resourceRelPath(filename, config)}\n`);

  filenames.forEach(writer);
  fs.closeSync(tmpFile.fd);

  return tmpFile;
}

async function compileResources(options, config) {
  const { log, rootPath, sources } = config;
  const filenames = findResources(config);
  const tmpFile = writeResourcesList(filenames, config);
  const tmpFileWinPath = wsl.windowsPath(tmpFile.path, { absolute: true });
  const args = ["-filelist", tmpFileWinPath];
  const contentRelPath = path.relative(rootPath, sources.contentPath);

  log.field("count", filenames.length).info(path.join(contentRelPath, "*"), { label: "compile" });

  compile(args, options, config);
}

function build(options, config) {
  return compileMaps(options, config).then(() => compileResources(options, config));
}

module.exports = (options, config) => build(options, config);
