import { inspect } from "node:util";

import type { Command } from "commander";

import type { ConfigOptions } from "../config.mjs";
import { PACKAGE } from "../config.mjs";
import Base from "./base.mjs";

export interface Options {
  map?: string;
}

export enum Tool {
  Game = "game",
  Tools = "tools",
}

const COMMON_LAUNCH_OPTIONS = [
  "-novid",
  "-dev",
  "-uidev",
  "-nominidumps",
  "-condebug",
  "-toconsole",
  "-vconsole",
  "-steam",
];

const NOBREAKPAD_APPIDS = [570, 375360];
const NOBREAKPAD_OPTIONS = NOBREAKPAD_APPIDS.flatMap((appID) => ["-nobreakpad", appID.toString()]);

const TOOL_LAUNCH_OPTIONS = {
  [Tool.Game]: [],
  [Tool.Tools]: ["-tools"],
};

export default class LaunchCommand extends Base<Options> {
  #tool: Tool;
  #toolArgs: string[];

  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const toolChoices = inspect(Object.values(Tool));
    const mapChoices = inspect(PACKAGE.dota2.customGame.maps);
    const defaultMap = PACKAGE.dota2.customGame.maps[0];

    const command = parent
      .command("launch")
      .description(`Launches the given tool`)
      .argument("<tool>", `Tool to launch (choices: ${toolChoices})`)
      .argument("[toolArgs...]", `Extra arguments to pass to tool command`)
      .option(
        `-m, --map <map>`,
        `Map name for '${Tool.Game}' tool (choices: ${mapChoices})`,
        defaultMap
      )
      .action(
        async (tool: string, toolArgs: string[]) =>
          await new LaunchCommand(tool, toolArgs, command.opts(), configOptions).run()
      );
  }

  constructor(
    toolName: string,
    toolArgs: string[],
    options: Options,
    configOptions: ConfigOptions
  ) {
    super([toolName, ...toolArgs], options, configOptions);

    const tool = toolName as Tool;

    switch (tool) {
      case Tool.Game:
        break;
      case Tool.Tools:
        break;
      default:
        // eslint-disable-next-line no-var,@typescript-eslint/no-unused-vars
        var _check: never = tool;
        throw new Error(`Invalid tool: ${inspect(toolName)}`);
    }

    this.#tool = tool;
    this.#toolArgs = toolArgs;
  }

  override async run() {
    const {
      dota2: { binPath: cmd, path: cwd },
      customGame,
    } = this.config;

    const mapName = this.options.map || customGame.maps[0];
    let args: string[] = [];

    switch (this.#tool) {
      case Tool.Game:
        if (!mapName) {
          throw new Error("Could not determine a map with which to launch the custom game");
        }

        args.push("+dota_launch_custom_game", customGame.name, mapName);

        break;
      case Tool.Tools:
        args.push("-addon", customGame.name);

        break;
      default:
        // eslint-disable-next-line no-var,@typescript-eslint/no-unused-vars
        var _check: never = this.#tool;
        break;
    }

    args = [...launchOptions(this.#tool), ...args, ...this.#toolArgs];

    this.log.info(`Launching ${this.#tool}`);
    this.log.debug(inspect([cmd, ...args]));

    await this.exec(cmd, args, { cwd, echo: true });
  }
}

function launchOptions(tool: Tool) {
  return [...COMMON_LAUNCH_OPTIONS, ...NOBREAKPAD_OPTIONS, ...TOOL_LAUNCH_OPTIONS[tool]];
}
