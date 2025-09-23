import shellQuote from "shell-quote";

import type { Logger } from "./logger";

export type Readable = Bun.SpawnOptions.Readable;
export type Writable = Bun.SpawnOptions.Writable;

type BunSpawnOptions<
  In extends Writable,
  Out extends Readable,
  Err extends Readable,
> = Bun.SpawnOptions.OptionsObject<In, Out, Err>;

const { inspect, spawn: bunSpawn } = Bun;

export interface SpawnOptions<
  In extends Writable,
  Out extends Readable,
  Err extends Readable,
> extends BunSpawnOptions<In, Out, Err> {
  log?: Logger | undefined;
}

export function spawn<
  In extends Writable = "ignore",
  Out extends Readable = "pipe",
  Err extends Readable = "inherit",
>(
  cmd: string,
  args: string[] = [],
  options?: SpawnOptions<In, Out, Err>,
): Bun.Subprocess<In, Out, Err> {
  const { log, ...spawnOptions } = options ?? {};
  const spawnCmd = [cmd, ...args];

  log?.field("cmd", inspect(spawnCmd)).debug("spawning");

  return bunSpawn(spawnCmd, spawnOptions);
}

export async function run<
  In extends Writable = "ignore",
  Out extends Readable = "pipe",
  Err extends Readable = "inherit",
>(
  cmd: string,
  args: string[] = [],
  options?: SpawnOptions<In, Out, Err>,
): Promise<Bun.Subprocess<In, Out, Err>> {
  const process = spawn(cmd, args, options);

  const exitCode = await process.exited;

  if (exitCode !== 0) {
    throw new Error(`Process ${inspect([cmd, ...args])} exited with code ${exitCode}`);
  }

  return process;
}

export interface ExecOptions<In extends Writable> extends SpawnOptions<In, "inherit", "inherit"> {}
export type ExecProcess<In extends Writable> = Bun.Subprocess<In, "inherit", "inherit">;

export async function exec<In extends Writable>(
  cmd: string,
  args: string[] = [],
  options?: ExecOptions<In>,
): Promise<ExecProcess<In>> {
  return await run(cmd, args, {
    ...options,
    stdout: "inherit",
    stderr: "inherit",
  });
}

export interface CaptureOptions<In extends Writable> extends SpawnOptions<In, "pipe", "pipe"> {
  trim?: boolean;
  log?: Logger | undefined;
}

export async function capture<In extends Writable>(
  cmd: string,
  args: string[] = [],
  options?: CaptureOptions<In>,
): Promise<string> {
  const process = await run(cmd, args, {
    stdout: "pipe",
    stderr: "pipe",
    ...options,
  });

  const out = await process.stdout.text();

  if (options?.trim) {
    return out.trim();
  } else {
    return out;
  }
}

export function parseShell(value: string): string[] {
  return shellQuote.parse(value, process.env).map((node) => {
    if (typeof node !== "string") {
      throw new Error(`Invalid command ${inspect(value)}`);
    }

    return node;
  });
}
