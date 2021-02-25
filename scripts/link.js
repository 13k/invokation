"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const mkdirp = require("mkdirp");

const wsl = require("./wsl");
const { spawn, createEnum } = require("./util");

const LinkType = createEnum({
  SymbolicLink: 1,
  HardLink: 2,
  Junction: 3,
});

function pwshLink({ src, dest, type = LinkType.SymbolicLink }, { log }) {
  const winSrc = wsl.windowsPath(src, { absolute: true });
  const destDir = path.dirname(dest);
  const winDestDir = wsl.windowsPath(destDir, { absolute: true });
  const winDest = `${winDestDir}\\${path.basename(dest)}`;
  const args = [
    "-Command",
    `New-Item -ItemType '${LinkType[type]}' -Path '${winDest}' -Target '${winSrc}'`,
  ];

  return spawn("pwsh.exe", args, { log });
}

function mklink({ src, dest }, { noop }, { log, rootPath, dota2 }) {
  log = log.fields("src", path.relative(rootPath, src), "dest", path.relative(dota2.path, dest));

  if (noop) {
    return log.info("dry run", { label: "skip", color: "cyan" });
  }

  if (fs.existsSync(dest)) {
    return log.info("already exists", { label: "skip", color: "magenta" });
  }

  mkdirp.sync(path.dirname(dest));

  const srcSt = fs.statSync(src);
  let type;

  if (srcSt.isDirectory()) {
    type = LinkType.Junction;
  } else if (srcSt.isFile()) {
    type = LinkType.HardLink;
  } else {
    throw Error(`${src}: invalid link source (not a file or directory)`);
  }

  log = log.field("type", LinkType[type]);

  pwshLink({ src, dest, type }, { log });

  log.success("created", { label: "link" });
}

function findLinks({ sources, customGame }) {
  const links = [{ src: sources.contentPath, dest: customGame.contentPath }];

  glob.sync(path.join(sources.gamePath, "*"), { strict: true }).forEach((src) => {
    const relPath = path.relative(sources.gamePath, src);
    const dest = path.join(customGame.gamePath, relPath);
    links.push({ src, dest });
  });

  return links;
}

async function link(options, config) {
  const { log, rootPath, dota2 } = config;

  log.fields("src", rootPath, "dest", dota2.path).info("Linking custom game");

  findLinks(config).forEach((l) => mklink(l, options, config));
}

module.exports = (options, config) => link(options, config);
