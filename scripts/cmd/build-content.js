const path = require("path");
const { promisify } = require("util");

const webpack = require("webpack");

const { install } = require("../fs");
const webpackConfigGen = require("../webpack/config");
const Logger = require("../logger");

const CONTENT_PATHS = ["maps", "materials", "panorama/localization", "soundevents", "sounds"];

class BuildContentCommand {
  static cliOptions(/* config */) {
    return {
      usage: "build-content",
      description: "Build content sources",
    };
  }

  /**
   * @param {never} _args
   * @param {never} _options
   * @param {import('../config')} config
   */
  constructor(_args, _options, { log, ...config }) {
    this.log = log;
    this.config = config;
    this.contentBuildPath = path.join(this.config.buildPath, "content");
    this.gameBuildPath = path.join(this.config.buildPath, "game");
  }

  async run() {
    await this.compileContent();
    await this.copyFiles();
  }

  async compileContent() {
    const config = await webpackConfigGen(this.config);
    const compiler = webpack(config);
    const run = promisify(compiler.run.bind(compiler));
    const close = promisify(compiler.close.bind(compiler));

    this.log.info("webpack");

    const stats = await run();

    await close();

    const level = stats.hasErrors()
      ? Logger.Level.Error
      : stats.hasWarnings()
      ? Logger.Level.Warn
      : Logger.Level.Info;

    const statsLog = stats.toString({
      chunks: false,
      colors: true,
    });

    this.log.log(level, statsLog, {
      emoji: false,
      label: false,
    });
  }

  async copyFiles() {
    const contentPaths = CONTENT_PATHS.map((contentPath) => ({
      src: path.join(this.config.sources.contentPath, contentPath),
      dst: path.join(this.contentBuildPath, contentPath),
    }));

    const gamePaths = [
      {
        src: this.config.sources.gamePath,
        dst: this.gameBuildPath,
      },
    ];

    for (const copyPath of [...contentPaths, ...gamePaths]) {
      this.log
        .fields(
          "src",
          path.relative(this.config.rootPath, copyPath.src),
          "dst",
          path.relative(this.config.rootPath, copyPath.dst)
        )
        .info("copying");

      await install(copyPath.src, copyPath.dst);
    }
  }
}

module.exports = BuildContentCommand;
