import * as path from "node:path";

import type { Command } from "commander";
import * as temp from "temp";
import fse from "fs-extra";

import type { ConfigOptions } from "../config.mjs";
import { Label } from "../logger.mjs";
import Base from "./base.mjs";

export interface Options {
  force?: boolean;
}

const IGNORED_RESOURCES: string[] = [];

export default class BuildCommand extends Base<Options> {
  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const command = parent
      .command("build")
      .description(`Build custom game resources`)
      .option(`-f, --force`, `Force rebuild`, false)
      .action(async () => await new BuildCommand(command.opts(), configOptions).run());
  }

  constructor(options: Options, configOptions: ConfigOptions) {
    super([], options, configOptions);
  }

  override async run() {
    await this.transpileScripts();
    await this.compileMaps();
    await this.compileResources();
  }

  contentGlobPattern(relPattern: string) {
    return path.join(this.config.sources.contentPath, relPattern);
  }

  addonContentRelPath(filename: string) {
    const { sources, dota2, customGame } = this.config;
    const relPath = path.relative(sources.contentPath, filename);
    const customGameFilename = path.join(customGame.contentPath, relPath);

    return path.relative(dota2.path, customGameFilename);
  }

  async transpileScripts() {
    const srcPanoramaScriptsPath = path.join(this.config.sources.srcPath, "panorama", "scripts");

    this.log.label(Label.Generate).info("transpiling panorama scripts");

    await this.exec("npm", ["exec", "--", "tsc", "-b", srcPanoramaScriptsPath], {
      echo: true,
      log: this.log,
    });
  }

  async compileMaps() {
    const mapsPath = this.contentGlobPattern("maps/*");
    const relPath = this.addonContentRelPath(mapsPath);

    this.log.fields({ mapsPath, relPath }).debug("compileMaps()");
    this.log.label(Label.Compile).info("maps");

    await this.compile(["-r", "-i", relPath]);
  }

  async compileResources() {
    const resourcesDirs = await this.glob(this.contentGlobPattern("*"), {
      ignore: [this.contentGlobPattern("maps")],
    });

    const inputArgs = resourcesDirs.flatMap((p) => [
      "-i",
      path.join(this.addonContentRelPath(p), "*"),
    ]);

    this.log.label(Label.Compile).info("resources");

    await this.compile(["-r", ...inputArgs]);
  }

  async compile(args: string[]) {
    const { dota2 } = this.config;

    args = [...args];

    if (this.options.force) {
      args.push("-fshallow");
    }

    await this.exec(dota2.resourceCompilerBinPath, args, {
      echo: true,
      log: this.log,
      cwd: dota2.path,
    });
  }

  async compileFile(filename: string) {
    const { rootPath } = this.config;
    const customGameRelPath = this.addonContentRelPath(filename);
    const args = ["-i", customGameRelPath];
    const relPath = path.relative(rootPath, filename);

    this.log.label(Label.Compile).info(relPath);

    await this.compile(args);
  }

  async compileFilelist(filenames: string[]) {
    const tmpFilePath = await this.writeResourcesList(filenames);
    const tmpFileWinPath = await this.windowsPath(tmpFilePath, { absolute: true });
    const args = ["-filelist", tmpFileWinPath];

    await this.compile(args);
  }

  async findResources() {
    const ignore = ["maps/**/*.vmap", ...IGNORED_RESOURCES].map((pattern) =>
      this.contentGlobPattern(pattern)
    );

    return await this.glob(this.contentGlobPattern("**/*"), {
      strict: true,
      nodir: true,
      ignore,
    });
  }

  async writeResourcesList(paths: string[]) {
    const tmpFile = await temp.open();

    this.log.field("tmpfile", tmpFile.path).debug("writing resources list to temporary file");

    const lines = paths.map((path) => this.addonContentRelPath(path));
    const data = lines.join("\n");

    await this.writeFile(tmpFile.fd, data);
    await fse.close(tmpFile.fd);

    return tmpFile.path;
  }
}
