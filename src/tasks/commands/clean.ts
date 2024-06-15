import { each as asyncEach } from "async";
import type { Command } from "commander";

import { Label } from "../logger";
import { BaseCommand } from "./base";

export type Args = null;

export interface Options {
  dryRun?: boolean;
}

export class CleanCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    return parent
      .command("clean")
      .description("Remove custom game resources and unlink source code")
      .option("-n, --dry-run", "Only print paths that would be removed", false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override parseArgs(..._args: unknown[]): Args {
    return null;
  }

  override async run(): Promise<void> {
    const {
      dota2: { baseDir },
      customGame: { contentDir, gameDir },
    } = this.config;

    this.log.fields({ baseDir }).info("Clean");

    await asyncEach([contentDir, gameDir], async (path) => {
      const log = this.log.label(Label.Remove).field("path", baseDir.relative(path));

      if (this.options.dryRun) {
        log.info("skip (dry run)");
        return;
      }

      await path.rm({ recursive: true });

      log.info("removed");
    });
  }
}
