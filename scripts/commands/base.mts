import { promisify } from "node:util";

import glob from "glob";

import fse from "fs-extra";
import type { Config, ConfigOptions } from "../config.mjs";
import { createConfig } from "../config.mjs";
import type { Logger } from "../logger.mjs";
import log from "../logger.mjs";
import type { ExecOptions, ExecSyncOptions } from "../util.mjs";
import { exec, execSync } from "../util.mjs";
import type { PathOptions as WslPathOptions } from "../wsl.mjs";
import { unixPath, windowsPath } from "../wsl.mjs";

const globP = promisify(glob);

export default abstract class Base<Options> {
  protected config: Config;
  protected log: Logger;

  constructor(protected args: string[], protected options: Options, configOptions: ConfigOptions) {
    this.log = log;
    this.config = createConfig(configOptions);
  }

  async init() {
    const path = this.config.dota2.binPath;
    try {
      await fse.stat(path);
    } catch (error) {
      this.log.fields({ path }).error("Could not find dota2 binary");
      this.log.debug(error as Error);

      throw error;
    }
  }

  abstract run(): Promise<void>;

  async readFile(file: number | fse.PathLike, options?: { flag?: string | undefined }) {
    return await fse.readFile(file, { encoding: "utf-8", ...options });
  }

  async writeFile(file: number | fse.PathLike, data: string, options?: fse.WriteFileOptions) {
    return await fse.writeFile(file, data, { encoding: "utf-8", ...options });
  }

  async glob(pattern: string, options?: glob.IOptions) {
    return await globP(pattern, options);
  }

  async exec(cmd: string, args: string[] = [], options?: ExecOptions) {
    return await exec(cmd, args, options);
  }

  async execSync(cmd: string, args: string[] = [], options?: ExecSyncOptions) {
    return execSync(cmd, args, options);
  }

  async windowsPath(name: string, options?: WslPathOptions) {
    return await windowsPath(name, options);
  }

  async unixPath(name: string, options?: WslPathOptions) {
    return await unixPath(name, options);
  }
}
