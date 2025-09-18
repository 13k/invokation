import assert from "node:assert";

import type { Command } from "commander";
import { InvalidArgumentError } from "commander";

import { parseShell } from "../exec";
import { Label } from "../logger";
import type { Path } from "../path";
import { BaseCommand } from "./base";

export interface Args {
  parts: Part[];
}

export interface Options {
  compiler?: string[];
  force?: boolean;
}

enum Part {
  Maps = "maps",
  Panorama = "panorama",
  PanoramaScripts = "scripts",
  PanoramaStyles = "styles",
  Resources = "resources",
}

const DEFAULT_PARTS = [
  Part.Maps,
  Part.Panorama,
  Part.Resources,
];

function parsePart(value: string, previous?: Part[]): Part[] {
  const part = value as Part;

  switch (part) {
    case Part.Maps:
    case Part.Panorama:
    case Part.PanoramaScripts:
    case Part.PanoramaStyles:
    case Part.Resources:
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

export class CompileCommand extends BaseCommand<Args, Options> {
  protected override subcommand(parent: Command): Command {
    const partChoices = Object.values(Part).join(", ");

    return parent
      .command("compile")
      .description("Compile custom game resources")
      .option(
        "-c, --compiler <COMMAND>",
        "\
Resource compiler command. \
Can be given multiple times to separate executable and arguments. \
Accepts environment variables. \
        ",
        parseCommand,
      )
      .option("-f, --force", "Force recompilation", false)
      .argument(
        "[parts...]",
        `Only build specific parts (choices: ${partChoices})`,
        parsePart,
      );
  }

  protected override parseArgs(parts: Part[]): Args {
    return { parts };
  }

  protected override async run(): Promise<void> {
    const parts = this.args.parts.length === 0 ? DEFAULT_PARTS : this.args.parts;

    for (const part of parts) {
      switch (part) {
        case Part.Maps: {
          await this.compileMaps();
          break;
        }
        case Part.Panorama: {
          await this.compilePanorama();
          break;
        }
        case Part.PanoramaScripts: {
          await this.compilePanoramaScripts();
          break;
        }
        case Part.PanoramaStyles: {
          await this.compilePanoramaStyles();
          break;
        }
        case Part.Resources: {
          await this.compileResources();
          break;
        }
        default: {
          const _check: never = part;
          throw new InvalidArgumentError(`Invalid build part: ${Bun.inspect(_check)}`);
        }
      }
    }

    this.log.emojify(true).info(":house: done");
  }

  get srcDirContent(): Path {
    return this.config.sources.contentDir;
  }

  get srcDirMaps(): Path {
    return this.srcDirContent.join("maps");
  }

  get srcDirPanorama(): Path {
    return this.srcDirContent.join("panorama");
  }

  get srcDirPanoramaScripts(): Path {
    return this.srcDirPanorama.join("scripts");
  }

  get srcDirPanoramaStyles(): Path {
    return this.srcDirPanorama.join("styles");
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

    await this.exec(compilerCmd, execArgs, {
      log: this.log,
      cwd: baseDir.toString(),
    });
  }

  async compileDirectory(message: string, srcDir: Path): Promise<void> {
    const relPath = this.config.contentRelPath(srcDir);

    this.log
      .label(Label.Compile)
      .fields({ srcDir: this.config.rootDir.relative(srcDir) })
      .info(message);

    await this.compile(["-r", "-i", relPath.join("*").toString()]);
  }

  async compileMaps(): Promise<void> {
    await this.compileDirectory("maps", this.srcDirMaps);
  }

  async compilePanorama(): Promise<void> {
    await this.compileDirectory("panorama", this.srcDirPanorama);
  }

  async compilePanoramaScripts(): Promise<void> {
    await this.compileDirectory("panorama scripts", this.srcDirPanoramaScripts);
  }

  async compilePanoramaStyles(): Promise<void> {
    await this.compileDirectory("panorama styles", this.srcDirPanoramaStyles);
  }

  async compileResources(): Promise<void> {
    const srcResourcesPaths = await this.srcDirContent.glob("*", {
      ignore: [
        this.srcDirMaps.toString(),
        this.srcDirPanorama.toString(),
      ],
    });

    const inputArgs = srcResourcesPaths.flatMap((p) => [
      "-i",
      this.config.contentRelPath(p).join("*").toString(),
    ]);

    this.log.label(Label.Compile).info("resources");

    await this.compile(["-r", ...inputArgs]);
  }
}
