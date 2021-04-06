const path = require("path");

const fse = require("fs-extra");

class Config {
  static async create({ rootPath, dota2Path, log }) {
    const pkg = await fse.readJson(path.join(rootPath, "package.json"));
    const {
      dota2: { customGame },
    } = pkg;

    const config = new this({
      rootPath,
      dota2Path,
      customGame,
      log,
    });

    await config.validate();

    return config;
  }

  constructor({ rootPath, dota2Path, customGame, log }) {
    const srcContentPath = path.join(rootPath, "content");
    const srcGamePath = path.join(rootPath, "game");
    const dota2BinPath = path.join(dota2Path, "game", "bin", "win64");
    const dota2AddonsContentPath = path.join(dota2Path, "content", "dota_addons");
    const dota2AddonsGamePath = path.join(dota2Path, "game", "dota_addons");

    this.log = log;
    this.rootPath = rootPath;

    this.sources = {
      contentPath: srcContentPath,
      gamePath: srcGamePath,
    };

    this.dota2 = {
      path: dota2Path,
      binPath: path.join(dota2BinPath, "dota2.exe"),
      toolsBinPath: path.join(dota2BinPath, "dota2cfg.exe"),
      resCompilerBinPath: path.join(dota2BinPath, "resourcecompiler.exe"),
      addonsContentPath: dota2AddonsContentPath,
      addonsGamePath: dota2AddonsGamePath,
    };

    this.customGame = {
      ...customGame,
      contentPath: path.join(dota2AddonsContentPath, customGame.name),
      gamePath: path.join(dota2AddonsGamePath, customGame.name),
    };
  }

  async requirePath(path) {
    if (!(await fse.pathExists(path))) {
      this.log.field("path", path).fatal("Could not find required path");
      throw Error(`${path}: not found`);
    }
  }

  async validate() {
    return Promise.all([
      this.requirePath(this.rootPath),
      this.requirePath(this.sources.contentPath),
      this.requirePath(this.sources.gamePath),
      this.requirePath(this.dota2.path),
      this.requirePath(this.dota2.binPath),
      this.requirePath(this.dota2.toolsBinPath),
      this.requirePath(this.dota2.resCompilerBinPath),
      this.requirePath(this.dota2.addonsContentPath),
      this.requirePath(this.dota2.addonsGamePath),
    ]);
  }
}

module.exports = Config;
