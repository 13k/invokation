const path = require("path");

const fse = require("fs-extra");
const globby = require("globby");
const tmp = require("tmp-promise");

const wsl = require("../wsl");
const { run } = require("../process");

tmp.setGracefulCleanup();

class BuildCommand {
  static cliOptions(/* config */) {
    return {
      usage: "build",
      description: "Build custom game resources",
      options: [{ flags: "-f, --force", description: "Force rebuild", default: false }],
    };
  }

  constructor(_args, options, { log, ...config }) {
    const {
      sources: { contentPath },
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
    const { sources, dota2, customGame } = this.config;
    const relPath = path.relative(sources.contentPath, filename);
    const customGameFilename = path.join(customGame.contentPath, relPath);

    return path.relative(dota2.path, customGameFilename);
  }

  async compile(args) {
    const {
      dota2: { resCompilerBinPath, path: dota2Path },
    } = this.config;

    if (this.options.force) {
      args.push("-fshallow");
    }

    return run(resCompilerBinPath, args, { log: this.log, cwd: dota2Path });
  }

  async compileMaps() {
    const mapFiles = await this.findMapFiles();

    return mapFiles.map(this.compileMap.bind(this));
  }

  async compileMap(filename) {
    const { rootPath } = this.config;
    const customGameRelPath = this.resourceRelPath(filename);
    const args = ["-i", customGameRelPath];
    const relPath = path.relative(rootPath, filename);

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
    const { rootPath, sources } = this.config;
    const resFiles = await this.findResFiles();
    const tmpFile = await this.createResListFile(resFiles);
    const tmpFileWinPath = await wsl.windowsPath(tmpFile.path, { absolute: true, log: this.log });
    const args = ["-filelist", tmpFileWinPath];
    const contentRelPath = path.relative(rootPath, sources.contentPath);

    this.log
      .field("count", resFiles.length)
      .info(path.join(contentRelPath, "*"), { label: "compile" });

    await this.compile(args);

    return resFiles;
  }
}

module.exports = BuildCommand;
