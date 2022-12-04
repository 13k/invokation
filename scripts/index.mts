import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { program } from "commander";
import * as dotenv from "dotenv";
import * as temp from "temp";

import BuildCommand from "./commands/build.mjs";
import CleanCommand from "./commands/clean.mjs";
import ConvertShopsCommand from "./commands/convert-shops.mjs";
import LaunchCommand from "./commands/launch.mjs";
import LinkCommand from "./commands/link.mjs";

import type { ConfigOptions } from "./config.mjs";
import log from "./logger.mjs";
import { IS_WSL } from "./wsl.mjs";

// FIXME: This will not work if compiling to javascript
const ROOT_PATH = path.normalize(path.join(fileURLToPath(import.meta.url), "..", ".."));

async function loadDotenv() {
  const result = dotenv.config({ encoding: "utf-8" });
  const error = result.error as NodeJS.ErrnoException;

  if (error && error.code !== "ENOENT") {
    log.fields({ error }).warn(`Error reading env file`);
    throw error;
  }
}

async function parseArgs(configOptions: ConfigOptions) {
  program
    .name("tasks")
    .option(`-d, --debug`, `Output debug information`, false)
    .on("option:debug", () => (log.level = "debug"));

  BuildCommand.subcommand(program, configOptions);
  CleanCommand.subcommand(program, configOptions);
  ConvertShopsCommand.subcommand(program, configOptions);
  LinkCommand.subcommand(program, configOptions);
  LaunchCommand.subcommand(program, configOptions);

  await program.parseAsync();
}

async function main() {
  if (!IS_WSL) {
    log.error("This script must be run within WSL");
    return 1;
  }

  await loadDotenv();

  const dota2Path = process.env["DOTA2_PATH"];

  if (!dota2Path) {
    log.error("DOTA2_PATH environment variable must be set");
    return 1;
  }

  await parseArgs({ rootPath: ROOT_PATH, dota2Path });

  return 0;
}

temp.track();

main()
  .catch((error: Error) => {
    log.error(error.message);
    log.debug(error);

    return 1;
  })
  .then((exitCode) => process.exit(exitCode));
