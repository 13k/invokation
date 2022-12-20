import * as path from "node:path";
import { inspect } from "node:util";

import type { Command } from "commander";

import type { ConfigOptions } from "../config.mjs";
import { Label } from "../logger.mjs";
import BaseCommand from "./base.mjs";

export interface Options {
  force?: boolean;
}

enum BuildPart {
  PanoramaScripts = "panorama-scripts",
  Maps = "maps",
  Resources = "resources",
}

const ALL_PARTS = [BuildPart.PanoramaScripts, BuildPart.Maps, BuildPart.Resources];

export default class BuildCommand extends BaseCommand<Options> {
  #parts: BuildPart[];

  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const partChoices = Object.values(BuildPart).join(", ");
    const command = parent
      .command("build")
      .description(`Build custom game resources`)
      .option(`-f, --force`, `Force rebuild`, false)
      .argument(
        "[parts...]",
        `Only build specific parts (choices: ${partChoices})`,
        parseBuildParts
      )
      .action(
        async (parts: BuildPart[]) =>
          await new BuildCommand(parts, command.opts(), configOptions).run()
      );
  }

  constructor(parts: BuildPart[], options: Options, configOptions: ConfigOptions) {
    super(parts, options, configOptions);

    if (parts.length === 0) {
      parts = ALL_PARTS;
    }

    this.#parts = parts;
  }

  override async run() {
    if (this.#parts.indexOf(BuildPart.PanoramaScripts) >= 0) {
      await this.transpileScripts();
    }

    if (this.#parts.indexOf(BuildPart.Maps) >= 0) {
      await this.compileMaps();
    }

    if (this.#parts.indexOf(BuildPart.Resources) >= 0) {
      await this.compileResources();
    }
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
    const srcPanoramaScriptsPath = path.join(
      this.config.sources.srcPath,
      "content",
      "panorama",
      "scripts"
    );

    this.log.label(Label.Generate).info("panorama scripts");

    const args = ["exec", "--", "tsc", "--build", srcPanoramaScriptsPath, "--verbose"];

    if (this.options.force) {
      args.push("--force");
    }

    await this.exec("npm", args, {
      echo: true,
      log: this.log,
    });
  }

  async compileMaps() {
    const mapsPath = this.contentGlobPattern(path.join("maps", "*"));
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
}

function parseBuildPart(value: string): BuildPart {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, v] of Object.entries(BuildPart)) {
    if (value === v) {
      return v;
    }
  }

  throw new Error(`Invalid build part: ${inspect(value)}`);
}

function parseBuildParts(value: string, parts: BuildPart[] | undefined) {
  if (parts == null) {
    parts = [];
  }

  parts.push(parseBuildPart(value));

  return parts;
}
