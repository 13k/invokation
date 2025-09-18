import { exec } from "../../exec";
import type { Logger } from "../../logger";
import type { Path } from "../../path";

export interface BuildOptions {
  force?: boolean;
  log?: Logger;
}

export async function build(srcDir: Path, options?: BuildOptions): Promise<void> {
  const args = ["x", "--", "tsc", "--build", "--verbose"];

  if (options?.force) {
    args.push("--force");
  }

  args.push(srcDir.toString());

  await exec("bun", args, { log: options?.log });
}
