import type { Command } from "commander";
import { InvalidArgumentError } from "commander";

import { Label } from "../../logger";
import { BaseCommand } from "../base";
import { build as bunBuild } from "./bun";
import { build as grassBuild } from "./grass";
import { build as tscBuild } from "./tsc";

export interface Args {
  parts: Part[];
}

export interface Options {
  compiler?: string[];
  force?: boolean;
}

enum Part {
  PanoramaScripts = "scripts",
  PanoramaStyles = "styles",
}

function parsePart(value: string, previous?: Part[]): Part[] {
  const part = value as Part;

  switch (part) {
    case Part.PanoramaScripts:
    case Part.PanoramaStyles:
      break;
    default: {
      const _check: never = part;
      throw new InvalidArgumentError(`Invalid build part: ${Bun.inspect(_check)}`);
    }
  }

  return [...(previous ?? []), part];
}

export class BuildCommand extends BaseCommand<Args, Options> {
  protected override subcommand(parent: Command): Command {
    const partChoices = Object.values(Part).join(", ");

    return parent
      .command("build")
      .description("Build custom game resources")
      .option("-f, --force", "Force rebuild", false)
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
    const parts = this.args.parts.length === 0 ? Object.values(Part) : this.args.parts;

    for (const part of parts) {
      switch (part) {
        case Part.PanoramaScripts: {
          await this.buildPanoramaScripts();
          break;
        }
        case Part.PanoramaStyles: {
          await this.buildPanoramaStyles();
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

  async buildPanoramaScripts(): Promise<void> {
    await this.typecheckPanoramaScripts();
    await this.bundlePanoramaScripts();
  }

  async typecheckPanoramaScripts(): Promise<void> {
    const srcDir = this.config.sources.srcDir.join("content", "panorama", "scripts");
    const customGameDir = srcDir.join("custom_game");

    this.log
      .label(Label.Check)
      .fields({ srcDir: this.config.rootDir.relative(customGameDir) })
      .info("panorama scripts");

    const options = {
      force: this.options.force ?? false,
      log: this.log,
    };

    await tscBuild(customGameDir, options);
  }

  async bundlePanoramaScripts(): Promise<void> {
    const srcDir = this.config.sources.srcDir.join("content", "panorama", "scripts", "custom_game");
    const destDir = this.config.sources.contentDir.join("panorama", "scripts", "custom_game");

    this.log
      .label(Label.Build)
      .fields({
        srcDir: this.config.rootDir.relative(srcDir),
        destDir: this.config.rootDir.relative(destDir),
      })
      .info("panorama scripts");

    await bunBuild(srcDir, destDir, this.log);
  }

  async buildPanoramaStyles(): Promise<void> {
    const srcDir = this.config.sources.srcDir.join("content", "panorama", "styles");
    const destDir = this.config.sources.contentDir.join("panorama", "styles");

    this.log
      .label(Label.Build)
      .fields({
        srcDir: this.config.rootDir.relative(srcDir),
        destDir: this.config.rootDir.relative(destDir),
      })
      .info("panorama styles");

    await grassBuild(srcDir, destDir, {
      force: this.options.force ?? false,
      log: this.log,
    });
  }
}
