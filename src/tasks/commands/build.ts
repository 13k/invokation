import assert from "node:assert";
import os from "node:os";

import type { Command } from "commander";
import { InvalidArgumentError } from "commander";

import { parseShell } from "../exec";
import { Label } from "../logger";
import { BaseCommand } from "./base";

export interface Args {
  parts: BuildPart[];
}

export interface Options {
  compiler?: string[];
  force?: boolean;
}

enum BuildPart {
  PanoramaScripts = "panorama-scripts",
  Maps = "maps",
  Resources = "resources",
}

function parseBuildPart(value: string, previous?: BuildPart[]): BuildPart[] {
  const part = value as BuildPart;

  switch (part) {
    case BuildPart.PanoramaScripts:
    case BuildPart.Maps:
    case BuildPart.Resources:
      break;
    default: {
      const _check: never = part;
      throw new InvalidArgumentError(`Invalid build part: ${Bun.inspect(_check)}`);
    }
  }

  return [...(previous ?? []), part];
}

function parseCommand(value: string, previous?: string[]): string[] {
  const cmd = parseShell(value);

  return [...(previous ?? []), ...cmd];
}

const MAX_TEXTURE_RES = 256;
const DIRECTX_LEVEL = "110";

export class BuildCommand extends BaseCommand<Args, Options> {
  protected override subcommand(parent: Command): Command {
    const partChoices = Object.values(BuildPart).join(", ");

    return parent
      .command("build")
      .description("Build custom game resources")
      .option(
        "-c, --compiler <COMMAND>",
        "\
Resource compiler command. \
Can be given multiple times to separate executable and arguments. \
Accepts environment variables. \
        ",
        parseCommand,
      )
      .option("-f, --force", "Force rebuild", false)
      .argument(
        "[parts...]",
        `Only build specific parts (choices: ${partChoices})`,
        parseBuildPart,
      );
  }

  protected override parseArgs(parts: BuildPart[]): Args {
    return { parts };
  }

  protected override async run(): Promise<void> {
    const parts = this.args.parts.length === 0 ? Object.values(BuildPart) : this.args.parts;

    for (const part of parts) {
      switch (part) {
        case BuildPart.PanoramaScripts: {
          await this.compilePanoramaScripts();
          break;
        }
        case BuildPart.Maps: {
          await this.compileMaps();
          break;
        }
        case BuildPart.Resources: {
          await this.compileResources();
          break;
        }
        default: {
          const _check: never = part;
          throw new InvalidArgumentError(`Invalid build part: ${Bun.inspect(_check)}`);
        }
      }
    }
  }

  get compilerCommand(): string[] {
    const {
      dota2: { resourceCompiler },
    } = this.config;

    const cmd = this.options.compiler ?? resourceCompiler;

    if (!cmd) {
      throw new Error("Could not find resource compiler");
    }

    return cmd;
  }

  async compilePanoramaScripts(): Promise<void> {
    const srcDir = this.config.sources.srcDir.join("content", "panorama", "scripts");

    this.log.label(Label.Generate).fields({ srcDir }).info("panorama scripts");

    const args = ["--no-install", "x", "--", "tsc", "--build", srcDir.toString(), "--verbose"];

    if (this.options.force) {
      args.push("--force");
    }

    this.exec("bun", args, {
      echo: true,
      log: this.log,
    });
  }

  async compileMaps(): Promise<void> {
    const mapsPatt = this.config.sources.contentDir.join("maps", "*");
    const relPatt = this.config.customGameContentRelPath(mapsPatt).toString();

    this.log.fields({ mapsPath: mapsPatt, relPath: relPatt }).debug("compileMaps()");
    this.log.label(Label.Compile).fields({ pattern: relPatt }).info("maps");

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

  async compile(args: string[]): Promise<void> {
    const {
      dota2: { baseDir },
    } = this.config;

    const [compilerCmd, ...compilerCmdArgs] = this.compilerCommand;

    assert(compilerCmd, `Invalid resource compiler commmand: ${Bun.inspect(this.compilerCommand)}`);

    const execArgs = [...compilerCmdArgs, ...args];

    if (this.options.force) {
      execArgs.push("-fshallow");
    }

    this.exec(compilerCmd, execArgs, {
      echo: true,
      log: this.log,
      cwd: baseDir.toString(),
    });
  }
}
