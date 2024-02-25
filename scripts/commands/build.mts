import os from "node:os";
import { inspect } from "node:util";

import type { Command } from "commander";

import { Label } from "../logger.mjs";
import BaseCommand from "./base.mjs";

export interface Args {
  parts: BuildPart[];
}

export interface Options {
  force?: boolean;
}

enum BuildPart {
  PanoramaScripts = "panorama-scripts",
  Maps = "maps",
  Resources = "resources",
}

function parseBuildParts(value: string, parts?: BuildPart[]): BuildPart[] {
  const buildParts = parts ?? [];

  buildParts.push(parseBuildPart(value));

  return buildParts;
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

const ALL_PARTS = [BuildPart.PanoramaScripts, BuildPart.Maps, BuildPart.Resources];

const MAX_TEXTURE_RES = 256;
const DIRECTX_LEVEL = "110";

export default class BuildCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    const partChoices = Object.values(BuildPart).join(", ");

    return parent
      .command("build")
      .description("Build custom game resources")
      .option("-f, --force", "Force rebuild", false)
      .argument("[parts...]", `Only build specific parts (choices: ${partChoices})`, parseBuildParts);
  }

  override parse_args(...parts: BuildPart[]): Args {
    return { parts };
  }

  override async run(): Promise<void> {
    const buildParts = this.args.parts.length === 0 ? ALL_PARTS : this.args.parts;

    if (buildParts.indexOf(BuildPart.PanoramaScripts) >= 0) {
      await this.transpileScripts();
    }

    if (buildParts.indexOf(BuildPart.Maps) >= 0) {
      await this.compileMaps();
    }

    if (buildParts.indexOf(BuildPart.Resources) >= 0) {
      await this.compileResources();
    }
  }

  async transpileScripts(): Promise<void> {
    const srcDir = this.config.sources.srcDir.join("content", "panorama", "scripts");

    this.log.label(Label.Generate).fields({ srcDir }).info("panorama scripts");

    const args = ["exec", "--", "tsc", "--build", srcDir.toString(), "--verbose"];

    if (this.options.force) {
      args.push("--force");
    }

    await this.exec("npm", args, {
      echo: true,
      log: this.log,
    });
  }

  async compileMaps(): Promise<void> {
    const mapsPatt = this.config.sources.contentDir.join("maps", "*");
    const relPatt = this.config.customGameContentRelPath(mapsPatt).toString();

    this.log.fields({ mapsPath: mapsPatt, relPath: relPatt }).debug("compileMaps()");
    this.log.label(Label.Compile).fields({ glob: relPatt }).info("maps");

    await this.compile(["-r", "-i", relPatt]);
  }

  async compileResources(): Promise<void> {
    const {
      sources: { contentDir: srcContentDir },
    } = this.config;

    const srcMapsDir = srcContentDir.join("maps");
    const srcResourcesPaths = await srcContentDir.glob("*", {
      ignore: srcMapsDir.toString(),
    });

    const inputArgs = srcResourcesPaths.flatMap((p) => [
      "-i",
      this.config.customGameContentRelPath(p).join("*").toString(),
    ]);

    this.log.label(Label.Compile).info("resources");

    await this.compile(["-r", ...inputArgs]);
  }

  async compileMap(relPath: string): Promise<void> {
    await this.compile([
      "-threads",
      os.availableParallelism().toString(),
      "-maxtextureres",
      MAX_TEXTURE_RES.toString(),
      "-dxlevel",
      DIRECTX_LEVEL,
      "-quiet",
      "-html",
      "-unbufferedio",
      "-noassert",
      "-world",
      "-phys",
      "-vis",
      "-gridnav",
      "-breakpad",
      "-nop4",
      "-i",
      relPath,
    ]);
  }

  // TODO: allow configuration of resourcecompiler command
  async compile(args: string[]): Promise<void> {
    const { dota2 } = this.config;

    const execArgs = [...args];

    if (this.options.force) {
      execArgs.push("-fshallow");
    }

    await this.exec(dota2.resourceCompilerBinPath.toString(), execArgs, {
      echo: true,
      log: this.log,
      cwd: dota2.baseDir.toString(),
    });
  }
}
