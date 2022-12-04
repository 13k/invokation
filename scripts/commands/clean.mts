import { each as asyncEach } from "async";
import type { Command } from "commander";
import fse from "fs-extra";

import type { ConfigOptions } from "../config.mjs";
import { Label } from "../logger.mjs";
import Base from "./base.mjs";

export interface Options {
  dryRun?: boolean;
}

export default class CleanCommand extends Base<Options> {
  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const command = parent
      .command("clean")
      .description(`Remove custom game resources and unlink source code`)
      .option(`-n, --dry-run`, `Only print paths that would be removed`, false)
      .action(async () => await new CleanCommand(command.opts(), configOptions).run());
  }

  constructor(options: Options, configOptions: ConfigOptions) {
    super([], options, configOptions);
  }

  override async run() {
    const {
      customGame: { contentPath, gamePath },
    } = this.config;

    await asyncEach([contentPath, gamePath], async (path) => {
      if (this.options.dryRun) {
        this.log.label(Label.Remove).info(`${path} [skip: dry run]`);
        return;
      }

      await fse.remove(path);

      this.log.label(Label.Remove).info(path);
    });
  }
}
