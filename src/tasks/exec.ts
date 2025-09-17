import type {
  NullSyncSubprocess,
  ReadableSyncSubprocess,
  SpawnOptions as BunSpawnOptions,
  SyncSubprocess,
} from "bun";

import shellQuote from "shell-quote";

import type { Logger } from "./logger";

export interface SpawnOptions extends BunSpawnOptions.OptionsObject {
  log?: Logger | undefined;
}

export function spawnSync(
  cmd: string,
  args: string[] = [],
  options?: SpawnOptions,
): SyncSubprocess {
  const { log, ...spawnOptions } = options ?? {};
  const spawnCmd = [cmd, ...args];

  log?.field("cmd", Bun.inspect(spawnCmd)).debug("spawning");

  return Bun.spawnSync(spawnCmd, spawnOptions);
}

export interface ExecOptions extends SpawnOptions {
  echo?: boolean | undefined;
}

export function exec(cmd: string, args: string[] = [], options?: ExecOptions): NullSyncSubprocess {
  const { echo, ...spawnOptions } = options ?? {};

  if (echo) {
    spawnOptions.stdout = "inherit";
    spawnOptions.stderr = "inherit";
  }

  const process = spawnSync(cmd, args, spawnOptions);

  if (!process.success) {
    throw new Error(`Process ${Bun.inspect([cmd, ...args])} exited with code ${process.exitCode}`);
  }

  return process;
}

export interface CaptureOptions {
  log?: Logger | undefined;
}

export function capture(cmd: string, args: string[] = [], options?: CaptureOptions): string {
  const process: ReadableSyncSubprocess = spawnSync(cmd, args, {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    ...options,
  });

  if (!process.success) {
    throw new Error(`Process ${Bun.inspect([cmd, ...args])} exited with code ${process.exitCode}`);
  }

  return process.stdout.toString();
}

export function parseShell(value: string): string[] {
  return shellQuote.parse(value, process.env).map((node) => {
    if (typeof node !== "string") {
      throw new Error(`Invalid command ${Bun.inspect(value)}`);
    }

    return node;
  });
}
