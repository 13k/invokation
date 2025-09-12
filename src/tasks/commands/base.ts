import type { SyncSubprocess } from "bun";

import type { Command, OptionValues } from "commander";
import type { ConfigOptions } from "../config";
import { Config } from "../config";
import type { CaptureOptions, ExecOptions } from "../exec";
import { capture, exec, parseShell } from "../exec";
import type { Logger } from "../logger";
import { LOGGER } from "../logger";
import type { PathLike } from "../path";
import { Path, ROOT_DIR } from "../path";

const ENV_DOTA2_PATH = "DOTA2_PATH";
const ENV_RESOURCE_COMPILER = "RESOURCE_COMPILER";

interface GlobalOptions {
  dota2?: string;
  debug: boolean;
}

export abstract class BaseCommand<Args, Options extends OptionValues> {
  #log?: Logger;
  #config?: Config;
  #args?: Args;
  #globalOptions?: GlobalOptions;
  #options?: Options;

  protected cmd: Command;

  protected abstract subcommand(parent: Command): Command;
  protected abstract parseArgs(...args: unknown[]): Args;
  protected abstract run(): Promise<void>;

  constructor(parent: Command) {
    this.cmd = this.subcommand(parent).action(this.#run.bind(this));
  }

  get log(): Logger {
    if (this.#log == null) {
      this.#log = LOGGER;
    }

    return this.#log;
  }

  get config(): Config {
    if (this.#config == null) {
      const dota2Dir = this.globalOptions.dota2 ?? process.env[ENV_DOTA2_PATH];

      if (!dota2Dir) {
        throw new Error("Dota2 path must be given");
      }

      const options: ConfigOptions = {
        rootDir: ROOT_DIR,
        dota2Dir: Path.new(dota2Dir),
      };

      const resourceCompilerEnv = process.env[ENV_RESOURCE_COMPILER];

      if (resourceCompilerEnv) {
        options.resourceCompiler = parseShell(resourceCompilerEnv);
      }

      this.#config = new Config(options);
    }

    return this.#config;
  }

  get args(): Args {
    if (this.#args == null) {
      if (this.cmd.processedArgs == null) {
        throw new Error("args used before initialization");
      }

      this.#args = this.parseArgs(...this.cmd.processedArgs);
    }

    return this.#args;
  }

  get globalOptions(): GlobalOptions {
    if (this.#globalOptions == null) {
      this.#globalOptions = this.cmd.optsWithGlobals();
    }

    return this.#globalOptions;
  }

  get options(): Options {
    if (this.#options == null) {
      this.#options = this.cmd.opts();
    }

    return this.#options;
  }

  async #run(): Promise<void> {
    const path = this.config.dota2.gameBinPath;

    if (!(await path.exists())) {
      throw new Error(`Could not find dota2 binary in ${path}`);
    }

    await this.run();
  }

  protected executable(cmd: PathLike): string | null {
    return Bun.which(cmd.toString());
  }

  protected exec(cmd: PathLike, args: PathLike[] = [], options?: ExecOptions): SyncSubprocess {
    return exec(
      cmd.toString(),
      args.map((arg) => arg.toString()),
      options,
    );
  }

  protected capture(cmd: PathLike, args: PathLike[] = [], options?: CaptureOptions): string {
    return capture(
      cmd.toString(),
      args.map((arg) => arg.toString()),
      options,
    );
  }
}
