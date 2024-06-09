import { program } from "commander";
import dotenv from "dotenv";
import { expand as dotenvExpand } from "dotenv-expand";
import temp from "temp";

import { BuildCommand } from "./commands/build";
import { CleanCommand } from "./commands/clean";
import { DataCommand } from "./commands/data";
import { LaunchCommand } from "./commands/launch";
import { LinkCommand } from "./commands/link";
import { LOGGER } from "./logger";

function loadDotenv() {
  const result = dotenvExpand(dotenv.config({ encoding: "utf8" }));
  const error = result.error as NodeJS.ErrnoException;

  if (error && error.code !== "ENOENT") {
    LOGGER.fields({ error }).warn("Error reading env file");
    throw error;
  }
}

async function parseArgs(): Promise<void> {
  program
    .name("tasks")
    .option("-d, --dota2 <PATH>", "Dota2 path")
    .option("-D, --debug", "Output debug information", false)
    .on("option:debug", () => {
      LOGGER.level = "debug";
    });

  new BuildCommand(program);
  new CleanCommand(program);
  new DataCommand(program);
  new LinkCommand(program);
  new LaunchCommand(program);

  await program.parseAsync();
}

async function main(): Promise<number> {
  loadDotenv();

  await parseArgs();

  return 0;
}

if (import.meta.main) {
  temp.track();

  try {
    await main();
  } catch (error: unknown) {
    if (error instanceof Error) {
      LOGGER.error(error.message);
      LOGGER.debug(error);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}
