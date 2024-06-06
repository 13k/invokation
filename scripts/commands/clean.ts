import { each as asyncEach } from "async";
import type { Command } from "commander";

import { Label } from "../logger";
import BaseCommand from "./base";

export type Args = null;

export interface Options {
  dryRun?: boolean;
}

export default class CleanCommand extends BaseCommand<Args, Options> {
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
      customGame: { contentDir, gameDir },
    } = this.config;

    await asyncEach([contentDir, gameDir], async (path) => {
      if (this.options.dryRun) {
        this.log.label(Label.Remove).info(`${path} [skip: dry run]`);

        return;
      }

      await path.rm();

      this.log.label(Label.Remove).info(path.toString());
    });
  }
}
