import { inspect } from "node:util";

import type { Options as ExecaOptions, SyncOptions as ExecaSyncOptions } from "execa";
import { execa, execaSync } from "execa";

import type { Logger } from "./logger.mjs";

export interface ExecOptions extends ExecaOptions {
  echo?: boolean;
  log?: Logger;
}

export async function exec(cmd: string, args: string[] = [], options?: ExecOptions) {
  const { log, echo, ...execaOptions } = options || {};

  log?.field("cmd", inspect([cmd, ...args])).debug("executing");

  if (echo) {
    execaOptions.encoding = "utf-8";
  }

  if (!execaOptions.encoding) {
    execaOptions.encoding = "utf-8";
  }

  const cp = execa(cmd, args, execaOptions);

  if (echo) {
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);
  }

  return await cp;
}

export interface ExecSyncOptions extends ExecaSyncOptions {
  log?: Logger;
}

export function execSync(cmd: string, args: string[] = [], options?: ExecSyncOptions) {
  const { log, ...execaOptions } = options || {};

  if (!execaOptions.encoding) {
    execaOptions.encoding = "utf-8";
  }

  log?.field("cmd", inspect([cmd, ...args])).debug("executing");

  const cp = execaSync(cmd, args, execaOptions);

  if (execaOptions.encoding) {
    log?.debug(cp.stdout);
    log?.debug(cp.stderr);
  }

  if (cp instanceof Error) {
    throw cp;
  }

  return cp;
}
