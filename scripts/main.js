const path = require("path");

const globby = require("globby");
const { program, Option } = require("commander");

const { load: loadDotenv } = require("./env");
const Config = require("./config");
const Logger = require("./logger");
// const wsl = require("./wsl");

const ROOT_PATH = path.dirname(__dirname);
const DOTENV_PATH = path.join(ROOT_PATH, ".env");
const CMDS_PATH = path.join(__dirname, "cmd");
const LOG = new Logger();

function arrayWrapIfDefined(value) {
  if (value === undefined) return value;

  return Array.isArray(value) ? value : Array.of(value);
}

function createAction(CmdRunner, config) {
  return (...args) => {
    const cmd = args[args.length - 1];
    const options = { ...program.opts(), ...cmd.opts() };
    const cmdArgs = args.slice(0, -1);
    const runner = new CmdRunner(cmdArgs, options, config);

    runner.run().catch((err) => {
      config.log.fatal(err);
      process.exit(1);
    });
  };
}

function createOption({ flags, description, choices, mandatory, hide, default: optDefault }) {
  optDefault = arrayWrapIfDefined(optDefault);
  choices = arrayWrapIfDefined(choices);

  const opt = new Option(flags, description);

  if (optDefault) opt.default.apply(opt, optDefault);
  if (choices) opt.choices.call(opt, choices);
  if (mandatory) opt.makeOptionMandatory();
  if (hide) opt.hideHelp();

  return opt;
}

function createCommand(CmdRunner, config) {
  let { usage, description, options } = CmdRunner.cliOptions(config);
  const action = createAction(CmdRunner, config);
  const cmd = program.command(usage).action(action);

  description = arrayWrapIfDefined(description);
  options = options || [];

  if (description) cmd.description.apply(cmd, description);

  options.forEach((optSpec) => cmd.addOption(createOption(optSpec)));

  return cmd;
}

async function parseArgs(config) {
  const cmdFiles = await globby(path.join(CMDS_PATH, "*.js"), { onlyFiles: true });

  program
    .name("tasks")
    .storeOptionsAsProperties(false)
    .option("-v, --verbose", "Be verbose", false)
    .on("option:verbose", () => (LOG.level = Logger.Level.Debug));

  cmdFiles.forEach((cmdFile) => {
    const CmdRunner = require(cmdFile);
    createCommand(CmdRunner, config);
  });

  return program.parseAsync(process.argv);
}

async function main() {
  // if (!wsl.isWSL()) {
  //   LOG.fatal("This script must be run within WSL");
  //   process.exit(1);
  // }

  await loadDotenv(DOTENV_PATH);

  if (!process.env.DOTA2_PATH) {
    LOG.fatal("DOTA2_PATH environment variable must be set");
    process.exit(1);
  }

  const config = await Config.create({
    rootPath: ROOT_PATH,
    dota2Path: process.env.DOTA2_PATH,
    log: LOG,
  });

  await parseArgs(config);
}

main().catch((err) => {
  LOG.fatal(err);
  process.exit(1);
});
