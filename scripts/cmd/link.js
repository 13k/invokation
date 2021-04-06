const path = require("path");

const fse = require("fs-extra");
const globby = require("globby");

const Enum = require("../enum");
const wsl = require("../wsl");
const { run } = require("../process");

const winpath = path.win32;
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

  constructor(_, { noop }, { log, ...config }) {
    this.noop = noop;
    this.config = config;
    this.log = log;

    this._sourcesGamePatt = path.join(config.sources.gamePath, "*");
  }

  async run() {
    const { rootPath, dota2 } = this.config;

    this.log.fields("src", rootPath, "dest", dota2.path).info("Linking custom game");

    const links = await this.findLinks();
    const promises = links.map(this.mklink.bind(this));

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

  async mklink({ src, dest }) {
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
      type = LinkType.Junction;
    } else if (srcSt.isFile()) {
      type = LinkType.HardLink;
    } else {
      throw Error(`${src}: invalid link source (not a file or directory)`);
    }

    log = log.field("type", LinkType[type]);

    await this.pwshLink({ src, dest, type }, { log });

    log.success("created", { label: "link" });

    return { src, dest };
  }

  async pwshLink({ src, dest, type = LinkType.SymbolicLink }, { log }) {
    const destDir = path.dirname(dest);
    const destName = path.basename(dest);

    await fse.ensureDir(destDir);

    const winSrc = await wsl.windowsPath(src, { absolute: true });
    const winDestDir = await wsl.windowsPath(destDir, { absolute: true });
    const winDest = winpath.join(winDestDir, destName);
    const args = [
      "-Command",
      `New-Item -ItemType '${LinkType[type]}' -Path '${winDest}' -Target '${winSrc}'`,
    ];

    return run(PWSH_BIN, args, { log });
  }
}

module.exports = LinkCommand;
