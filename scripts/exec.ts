import { inspect } from "node:util";
import type { SpawnOptions as BunSpawnOptions } from "bun";

import shellQuote from "shell-quote";

import type { Logger } from "./logger";

export interface SpawnOptions extends BunSpawnOptions.OptionsObject {
  log?: Logger;
}

export function spawnSync(cmd: string, args: string[] = [], options?: SpawnOptions) {
  const { log, ...spawnOptions } = options ?? {};
  const spawnCmd = [cmd, ...args];

  log?.field("cmd", inspect(spawnCmd)).debug("spawning");

  return Bun.spawnSync(spawnCmd, spawnOptions);
}

export interface ExecOptions extends SpawnOptions {
  echo?: boolean;
}

export function exec(cmd: string, args: string[] = [], options?: ExecOptions) {
  const { echo, ...spawnOptions } = options ?? {};

  if (echo) {
    spawnOptions.stdout = "inherit";
    spawnOptions.stderr = "inherit";
  }

  const process = spawnSync(cmd, args, spawnOptions);

  if (!process.success) {
    throw new Error(`Process ${inspect([cmd, ...args])} exited with code ${process.exitCode}`);
  }

  return process;
}

export interface CaptureOptions {
  log?: Logger;
}

export function capture(cmd: string, args: string[] = [], options?: CaptureOptions) {
  const process = spawnSync(cmd, args, {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    ...options,
  });

  if (!process.success) {
    throw new Error(`Process ${inspect([cmd, ...args])} exited with code ${process.exitCode}`);
  }

  return process.stdout.toString();
}

export function parseShell(value: string): string[] {
  return shellQuote.parse(value, process.env).map((node) => {
    if (typeof node !== "string") {
      throw new Error(`Invalid command ${inspect(value)}`);
    }

    return node;
  });
}
