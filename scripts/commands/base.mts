import type { Command, OptionValues } from "commander";

import { Config } from "../config.mjs";
import type { ExecReturnValue } from "../exec.mjs";
import type { ExecOptions } from "../exec.mjs";
import { exec } from "../exec.mjs";
import type { Logger } from "../logger.mjs";
import LOG from "../logger.mjs";
import { Path, ROOT_DIR } from "../path.mjs";
import type { PathLike } from "../path.mjs";

export interface Subcommand<Options> {
  subcommand(parent: Command): Command;
  run(options: Options, ...args: unknown[]): Promise<void>;
}

export default abstract class BaseCommand<Args, Options extends OptionValues> {
  #log?: Logger;
  #config?: Config;
  #args?: Args;
  #options?: Options;

  protected cmd: Command;

  constructor(parent: Command) {
    this.cmd = this.subcommand(parent).action(this.#run.bind(this));
  }

  get log(): Logger {
    if (this.#log == null) {
      this.#log = LOG;
    }

    return this.#log;
  }

  get config(): Config {
    if (this.#config == null) {
      // biome-ignore lint/complexity/useLiteralKeys: doesn't apply to `process.env` keys
      const dota2DirEnv = process.env["DOTA2_PATH"];

      if (!dota2DirEnv) {
        const error = new Error("DOTA2_PATH environment variable must be set");

        this.log.error(error.message);

        throw error;
      }

      this.#config = new Config({ rootDir: ROOT_DIR, dota2Dir: Path.new(dota2DirEnv) });
    }

    return this.#config;
  }

  get args(): Args {
    if (this.#args == null) {
      if (this.cmd.processedArgs == null) {
        throw new Error("args used before initialization");
      }

      this.#args = this.parse_args(this.cmd.processedArgs);
    }

    return this.#args;
  }

  get options(): Options {
    if (this.#options == null) {
      this.#options = this.cmd.opts();
    }

    return this.#options;
  }

  async #run(): Promise<void> {
    const path = this.config.dota2.gameBinPath;
    const exists = await path.exists();

    if (!exists) {
      const error = new Error("Could not find dota2 binary");

      this.log.fields({ path }).error(error.message);
      this.log.debug(error);

      throw error;
    }

    await this.run();
  }

  abstract subcommand(parent: Command): Command;
  abstract parse_args(...args: unknown[]): Args;
  abstract run(): Promise<void>;

  protected async exec(cmd: PathLike, args: PathLike[] = [], options?: ExecOptions): Promise<ExecReturnValue<string>> {
    return await exec(
      cmd.toString(),
      args.map((arg) => arg.toString()),
      options,
    );
  }
}
