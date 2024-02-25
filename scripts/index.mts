import { program } from "commander";
import dotenv from "dotenv";
import temp from "temp";

import BuildCommand from "./commands/build.mjs";
import CleanCommand from "./commands/clean.mjs";
import ConvertShopsCommand from "./commands/convert-shops.mjs";
import LaunchCommand from "./commands/launch.mjs";
import LinkCommand from "./commands/link.mjs";
import LOG from "./logger.mjs";

async function loadDotenv(): Promise<void> {
  const result = dotenv.config({ encoding: "utf8" });
  const error = result.error as NodeJS.ErrnoException;

  if (error && error.code !== "ENOENT") {
    LOG.fields({ error }).warn("Error reading env file");
    throw error;
  }
}

async function parseArgs(): Promise<void> {
  program
    .name("tasks")
    .option("-d, --debug", "Output debug information", false)
    .on("option:debug", () => {
      LOG.level = "debug";
    });

  {
    new BuildCommand(program);
    new CleanCommand(program);
    new ConvertShopsCommand(program);
    new LinkCommand(program);
    new LaunchCommand(program);
  }

  await program.parseAsync();
}

async function main() {
  await loadDotenv();
  await parseArgs();

  return 0;
}

temp.track();

main()
  .catch((error: Error) => {
    LOG.error(error.message);
    LOG.debug(error);

    return 1;
  })
  .then((exitCode) => process.exit(exitCode));
