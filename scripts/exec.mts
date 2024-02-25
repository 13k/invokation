import { inspect } from "node:util";

import type { ExecaReturnValue as ExecReturnValue, Options as ExecaOptions } from "execa";
import { execa } from "execa";

import type { Logger } from "./logger.mjs";

export type { ExecaReturnValue as ExecReturnValue } from "execa";

export interface ExecOptions extends ExecaOptions {
  echo?: boolean;
  log?: Logger;
}

export async function exec(cmd: string, args: string[] = [], options?: ExecOptions): Promise<ExecReturnValue<string>> {
  const { log, echo, ...execaOptions } = options ?? {};

  log?.field("cmd", inspect([cmd, ...args])).debug("executing");

  if (echo) {
    execaOptions.encoding = "utf8";
  }

  if (!execaOptions.encoding) {
    execaOptions.encoding = "utf8";
  }

  const cp = execa(cmd, args, execaOptions);

  if (echo) {
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);
  }

  return await cp;
}
