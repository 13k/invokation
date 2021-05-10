const path = require("path");

const fse = require("fs-extra");
const globby = require("globby");
const tmp = require("tmp-promise");

const wsl = require("../wsl");
const { run } = require("../process");

tmp.setGracefulCleanup();

class BuildGameCommand {
  static cliOptions(/* config */) {
    return {
      usage: "build-game",
      description: "Build game resources",
      options: [{ flags: "-f, --force", description: "Force rebuild", default: false }],
    };
  }

  constructor(_args, options, { log, ...config }) {
    const {
      customGame: { contentPath },
    } = config;

    this.log = log;
    this.options = options;
    this.config = config;

    this._mapsGlobPatt = path.join(contentPath, "maps", "**", "*.vmap");
    this._resGlobPatt = path.join(contentPath, "**", "*");
  }

  async run() {
    const mapFiles = await this.compileMaps();
    const resFiles = await this.compileResources();

    return [...mapFiles, ...resFiles];
  }

  async findMapFiles() {
    return globby(this._mapsGlobPatt, {
      onlyFiles: true,
    });
  }

  async findResFiles() {
    return globby(this._resGlobPatt, {
      onlyFiles: true,
      ignore: [this._mapsGlobPatt],
    });
  }

  resourceRelPath(filename) {
    return path.relative(this.config.dota2.path, filename);
  }

  async compile(args) {
    const {
      dota2: { compilerPath, path: dota2Path },
    } = this.config;

    if (this.options.force) {
      args.push("-fshallow");
    }

    return run(compilerPath, args, { log: this.log, cwd: dota2Path });
  }

  async compileMaps() {
    const mapFiles = await this.findMapFiles();

    return mapFiles.map(this.compileMap.bind(this));
  }

  async compileMap(filename) {
    const relPath = this.resourceRelPath(filename);
    const args = ["-i", relPath];

    this.log.info(relPath, { label: "compile" });

    await this.compile(args);

    return filename;
  }

  async createResListFile(filenames) {
    const data = filenames.map((filename) => this.resourceRelPath(filename)).join("\n");
    const tmpFile = await tmp.file();

    await fse.write(tmpFile.fd, data);
    await fse.close(tmpFile.fd);

    return tmpFile;
  }

  async compileResources() {
    const contentRelPath = path.relative(
      this.config.dota2.path,
      this.config.customGame.contentPath
    );

    const resFiles = await this.findResFiles();
    const tmpFile = await this.createResListFile(resFiles);
    const tmpFilePath =
      this.config.platform === "wsl"
        ? await wsl.windowsPath(tmpFile.path, { absolute: true, log: this.log })
        : tmpFile.path;

    const args = ["-filelist", tmpFilePath];

    this.log
      .field("count", resFiles.length)
      .info(path.join(contentRelPath, "*"), { label: "compile" });

    await this.compile(args);

    return resFiles;
  }
}

module.exports = BuildGameCommand;
