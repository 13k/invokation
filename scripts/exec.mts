import process from "node:process";
import { inspect } from "node:util";

import type { ExecaReturnValue as ExecReturnValue, Options as ExecaOptions } from "execa";
import { execa } from "execa";
import shellQuote from "shell-quote";

import type { Logger } from "./logger.mjs";

export type { ExecaReturnValue as ExecReturnValue } from "execa";

const ENCODING = "utf8";

export interface ExecOptions extends ExecaOptions {
  echo?: boolean;
  log?: Logger;
}

export async function exec(cmd: string, args: string[] = [], options?: ExecOptions): Promise<ExecReturnValue<string>> {
  const { log, echo, ...execaOptions } = options ?? {};

  log?.field("cmd", inspect([cmd, ...args])).debug("executing");

  if (echo) {
    execaOptions.encoding = ENCODING;
  }

  if (!execaOptions.encoding) {
    execaOptions.encoding = ENCODING;
  }

  const cp = execa(cmd, args, execaOptions);

  if (echo) {
    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);
  }

  return await cp;
}

export function parseShell(value: string): string[] {
  return shellQuote.parse(value, process.env).map((node) => {
    if (typeof node !== "string") {
      throw new Error(`Invalid command ${inspect(value)}`);
    }

    return node;
  });
}
