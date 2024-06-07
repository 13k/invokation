import type { Command } from "commander";

import { BaseCommand } from "../base";
import { KeyValuesCommand } from "./key_values";
import { ShopsCommand } from "./shops";

export type Args = Record<string, never>;
export type Options = Record<string, never>;

export class DataCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    const command = parent.command("data").description("Parse and convert data from game files");

    new KeyValuesCommand(command);
    new ShopsCommand(command);

    return command;
  }

  override parseArgs(): Args {
    return {};
  }

  override async run(): Promise<void> {
    // nothing
  }
}
