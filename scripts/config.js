const path = require("path");
const fse = require("fs-extra");
const wsl = require("./wsl");
const kv = require("./kv");

const DOTA2_BIN_WINDOWS = {
  binPath: path.join("game", "bin", "win64", "dota2.exe"),
  toolsPath: path.join("game", "bin", "win64", "dota2cfg.exe"),
  compilerPath: path.join("game", "bin", "win64", "resourcecompiler.exe"),
};

const DOTA2_BIN_LINUX = {
  binPath: path.join("game", "dota.sh"),
  toolsPath: null,
  compilerPath: null,
};

const DOTA2_BIN_MACOS = {
  binPath: path.join("game", "dota.sh"),
  toolsPath: null,
  compilerPath: null,
};

const DOTA2_BIN = {
  darwin: DOTA2_BIN_MACOS,
  linux: DOTA2_BIN_LINUX,
  win32: DOTA2_BIN_WINDOWS,
  wsl: DOTA2_BIN_WINDOWS,
};

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

  /**
   * @param {Object} options
   * @param {string} options.rootPath
   * @param {string} options.dota2Path
   * @param {Object} options.customGame
   * @param {string} options.customGame.name
   * @param {import('./logger')} options.log
   */
  constructor({ rootPath, dota2Path, customGame, log }) {
    this.platform = wsl.isWSL() ? "wsl" : process.platform;

    if (!(this.platform in DOTA2_BIN)) {
      throw Error(`Platform '${this.platform}' not supported`);
    }

    this.log = log;
    this.rootPath = rootPath;
    this.buildPath = path.join(rootPath, "build");
    this.sources = this._sourcesConfig(rootPath);
    this.dota2 = this._dota2Config(dota2Path);
    this.customGame = this._customGameConfig(customGame.name);
  }

  /**
   * @param {string} rootPath
   */
  _sourcesConfig(rootPath) {
    return {
      contentPath: path.join(rootPath, "content"),
      gamePath: path.join(rootPath, "game"),
    };
  }

  /**
   * @param {string} dota2Path
   */
  _dota2Config(dota2Path) {
    const dota2 = {
      path: dota2Path,
      addonsContentPath: path.join(dota2Path, "content", "dota_addons"),
      addonsGamePath: path.join(dota2Path, "game", "dota_addons"),
    };

    for (const pathKey of Object.keys(DOTA2_BIN[this.platform])) {
      const relPath = DOTA2_BIN[this.platform][pathKey];

      dota2[pathKey] = relPath && path.join(dota2Path, relPath);
    }

    return dota2;
  }

  /**
   * @param {string} customGameName
   */
  _customGameConfig(customGameName) {
    const customGameInfo = this._parseAddonInfo(customGameName);

    return {
      name: customGameName,
      ...customGameInfo,
      contentPath: path.join(this.dota2.addonsContentPath, customGameName),
      gamePath: path.join(this.dota2.addonsGamePath, customGameName),
    };
  }

  /**
   * @param {string} customGameName
   */
  _parseAddonInfo(customGameName) {
    const addonInfoPath = path.join(this.sources.gamePath, "addoninfo.txt");
    const addonInfo = kv.parseFile(addonInfoPath);

    if (!(customGameName in addonInfo)) {
      throw new Error(
        `KeyValues file ${addonInfoPath} doesn't contain information for addon ${customGameName}`
      );
    }

    return this._parseAddonInfoCustomGame(addonInfo[customGameName]);
  }

  _parseAddonInfoCustomGame(customGameInfo) {
    /** @type {string[]} */
    const mapNames = (customGameInfo.maps || "").split(" ");

    return {
      mapNames,
      maps: this._parseAddonInfoMaps(customGameInfo, mapNames),
      isPlayable: kv.getBoolean(customGameInfo, "IsPlayable", true),
      teamCount: kv.getNumber(customGameInfo, "TeamCount"),
    };
  }

  _parseAddonInfoMaps(customGameInfo, mapNames) {
    const maps = {};

    for (const mapName of mapNames) {
      maps[mapName] = this._parseAddonInfoMap(customGameInfo[mapName]);
    }

    return maps;
  }

  _parseAddonInfoMap(mapInfo) {
    if (mapInfo == null) {
      return {};
    }

    return {
      maxPlayers: kv.getNumber(mapInfo, "MaxPlayers"),
    };
  }

  async _validatePath(path) {
    if (!(await fse.pathExists(path))) {
      this.log.field("path", path).fatal("Could not find required path");

      throw Error(`${path}: not found`);
    }
  }

  async validate() {
    const promises = [
      this._validatePath(this.rootPath),
      this._validatePath(this.sources.contentPath),
      this._validatePath(this.sources.gamePath),
      this._validatePath(this.dota2.path),
      this._validatePath(this.dota2.binPath),
      this._validatePath(this.dota2.addonsContentPath),
      this._validatePath(this.dota2.addonsGamePath),
    ];

    if (this.dota2.toolsPath != null) {
      promises.push(this._validatePath(this.dota2.toolsPath));
    }

    if (this.dota2.compilerPath != null) {
      promises.push(this._validatePath(this.dota2.compilerPath));
    }

    return Promise.all(promises);
  }
}

module.exports = Config;
