"use strict";

const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const createConfig = require("./config");
const Logger = require("./logger");
const wsl = require("./wsl");

const ROOT_PATH = path.dirname(__dirname);
const LOG = new Logger();

function loadDotenv(path) {
  if (!fs.existsSync(path)) {
    return;
  }

  const result = dotenv.config({ path });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function createCommand(name, config) {
  return (...args) => {
    const main = require(`./commands/${name}`);

    args.pop(); // cmd object

    const cmdOptions = args.pop();
    const options = { ...program.opts(), ...cmdOptions };
    const actionArgs = [...args, options, config];

    return main(...actionArgs);
  };
}

async function parseArgs(config) {
  const choicesTool = `game|tools`;
  const choicesMap = config.customGame.maps.join("|");
  const defaultMap = config.customGame.maps[0];

  program
    .name("tasks")
    .option(`-v, --verbose`, `Be verbose`, false)
    .on("option:verbose", () => (LOG.level = Logger.Level.Debug));

  program
    .command("build")
    .description(`Build custom game resources`)
    .option(`-f, --force`, `Force rebuild`, false)
    .action(createCommand("build", config));

  program
    .command("clean")
    .description(`Remove custom game resources and unlink source code`)
    .option(`-n, --noop`, `Only print paths that would be removed`, false)
    .action(createCommand("clean", config));

  program
    .command("convert-shops <input> <output>")
    .description(`Convert a game KeyValues shops.txt file to custom game KeyValues shops.txt`)
    .action(createCommand("convert-shops", config));

  program
    .command("format-lua")
    .description("Format Lua (vscript) source files")
    .option(`-n, --noop`, `Only print paths that would be formatted`, false)
    .action(createCommand("format-lua", config));

  program
    .command(`launch <tool> [toolArgs...]`)
    .description(`Launches the given tool (${choicesTool})`)
    .option(`-m, --map <map>`, `Map name for 'game' tool (${choicesMap})`, defaultMap)
    .action(createCommand("launch", config));

  program
    .command("link")
    .description(`Link source code paths to Dota 2 addon paths`)
    .option(`-n, --noop`, `Only print paths that would be linked`, false)
    .action(createCommand("link", config));

  return program.parseAsync(process.argv);
}

async function main() {
  if (!wsl.isWSL()) {
    LOG.fatal(`This script must be run within WSL`);
    process.exit(1);
  }

  loadDotenv(path.join(ROOT_PATH, ".env"));

  if (!process.env.DOTA2_PATH) {
    LOG.fatal(`DOTA2_PATH environment variable must be set`);
    process.exit(1);
  }

  const config = createConfig(ROOT_PATH, process.env.DOTA2_PATH, LOG);

  if (!fs.existsSync(config.dota2.binPath)) {
    LOG.field("path", config.dota2.binPath).fatal("Could not find dota2.exe");
    process.exit(1);
  }

  return parseArgs(config);
}

main().catch((err) => {
  LOG.error(err);
  process.exit(1);
});
