const path = require("path");
const winpath = require("path/win32");

const fse = require("fs-extra");
const globby = require("globby");

const Enum = require("../enum");
const wsl = require("../wsl");
const { run } = require("../process");
const { Platform, PLATFORM } = require("../platform");

const PWSH_BIN = "pwsh.exe";

const LinkType = Enum({
  SymbolicLink: 1,
  HardLink: 2,
  Junction: 3,
});

class LinkCommand {
  static cliOptions(/* config */) {
    return {
      usage: "link",
      description: "Link source code paths to Dota 2 addon paths",
      options: [
        {
          flags: "-n, --noop",
          description: "Only print paths that would be linked",
          default: false,
        },
      ],
    };
  }

  constructor(_args, { noop }, { log, ...config }) {
    this.noop = noop;
    this.config = config;
    this.log = log;

    this._sourcesGamePatt = path.join(config.sources.gamePath, "*");
  }

  async run() {
    const { rootPath, dota2 } = this.config;

    this.log.fields("src", rootPath, "dest", dota2.path).info("Linking custom game");

    const links = await this.findLinks();
    const promises = links.map(this.link.bind(this));

    return Promise.all(promises);
  }

  async findLinks() {
    const { sources, customGame } = this.config;
    const baseLinks = [{ src: sources.contentPath, dest: customGame.contentPath }];
    const sourcesPaths = await globby(this._sourcesGamePatt, { onlyFiles: false });
    const sourcesLinks = sourcesPaths.map((src) => {
      const relPath = path.relative(sources.gamePath, src);
      const dest = path.join(customGame.gamePath, relPath);
      return { src, dest };
    });

    return [...baseLinks, ...sourcesLinks];
  }

  async link({ src, dest }) {
    const { rootPath, dota2 } = this.config;
    const srcRelPath = path.relative(rootPath, src);
    const destRelPath = path.relative(dota2.path, dest);
    let log = this.log.fields("src", srcRelPath, "dest", destRelPath);

    if (this.noop) {
      log.info("dry run", { label: "skip", color: "cyan" });
      return { src, dest };
    }

    try {
      const destSt = await fse.stat(dest);

      log
        .fields("isFile", destSt.isFile(), "isDir", destSt.isDirectory())
        .info("already exists", { label: "skip", color: "magenta" });

      return { src, dest };
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }

    const srcSt = await fse.stat(src);
    let type;

    if (srcSt.isDirectory()) {
      if (PLATFORM === Platform.WSL || PLATFORM === Platform.Windows) {
        type = LinkType.Junction;
      } else {
        type = LinkType.SymbolicLink;
      }
    } else if (srcSt.isFile()) {
      type = LinkType.HardLink;
    } else {
      throw Error(`${src}: invalid link source (not a file or directory)`);
    }

    log = log.field("type", LinkType[type]);

    await this._mklink({ src, dest, type }, { log });

    log.success("created", { label: "link" });

    return { src, dest };
  }

  async _mklink({ src, dest, type = LinkType.SymbolicLink }, { log }) {
    switch (PLATFORM) {
      case Platform.Darwin:
      case Platform.Linux:
        return await this._mklinkUnix({ src, dest, type }, { log });
      case Platform.Windows:
        return await this._mklinkWindows({ src, dest, type }, { log });
      case Platform.WSL:
        return await this._mklinkWSL({ src, dest, type }, { log });
    }

    throw Error(`unknown platform ${PLATFORM}`);
  }

  async _mklinkUnix({ src, dest, type = LinkType.SymbolicLink }, { log }) {
    src = path.resolve(src);
    dest = path.resolve(dest);

    await fse.ensureDir(path.dirname(dest));

    switch (type) {
      case LinkType.SymbolicLink:
        return await fse.ensureSymlink(src, dest);
      default:
        return await fse.ensureLink(src, dest);
    }
  }

  async _mklinkWindows({ src, dest, type = LinkType.SymbolicLink }, { log }) {
    src = winpath.resolve(src);
    dest = winpath.resolve(dest);

    await fse.ensureDir(winpath.dirname(dest));

    const args = [
      "-Command",
      `New-Item -ItemType '${LinkType[type]}' -Path '${dest}' -Target '${src}'`,
    ];

    return await run(PWSH_BIN, args, { log });
  }

  async _mklinkWSL({ src, dest, type = LinkType.SymbolicLink }, { log }) {
    const destDir = path.dirname(dest);
    const destName = path.basename(dest);
    const winSrc = await wsl.windowsPath(src, { absolute: true });
    const winDestDir = await wsl.windowsPath(destDir, { absolute: true });
    const winDest = winpath.join(winDestDir, destName);

    return await this._mklinkWindows({ src: winSrc, dest: winDest, type }, { log });
  }
}

module.exports = LinkCommand;
