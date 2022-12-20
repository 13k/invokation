import { inspect } from "node:util";

import type { Command } from "commander";

import type { ConfigOptions } from "../config.mjs";
import { PACKAGE } from "../config.mjs";
import BaseCommand from "./base.mjs";

export interface Options {
  map?: string;
}

export enum Tool {
  Game = "game",
  Tools = "tools",
}

const NOBREAKPAD_APPIDS = [570, 375360];

const COMMON_LAUNCH_OPTIONS = [
  "-novid",
  "-dev",
  "-uidev",
  "-nominidumps",
  "-condebug",
  "-toconsole",
  "-vconsole",
];

const NOBREAKPAD_OPTIONS = NOBREAKPAD_APPIDS.flatMap((appID) => ["-nobreakpad", appID.toString()]);
const LAUNCH_OPTIONS = [...COMMON_LAUNCH_OPTIONS, ...NOBREAKPAD_OPTIONS];

export default class LaunchCommand extends BaseCommand<Options> {
  #tool: Tool;
  #toolArgs: string[];

  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const toolChoices = Object.values(Tool).join(", ");
    const mapChoices = PACKAGE.dota2.customGame.maps.join(", ");
    const defaultMap = PACKAGE.dota2.customGame.maps[0];

    const command = parent
      .command("launch")
      .description(`Launches the given tool`)
      .argument("<tool>", `Tool to launch (choices: ${toolChoices})`, parseTool)
      .argument("[toolArgs...]", `Extra arguments to pass to tool command`)
      .option(
        `-m, --map <map>`,
        `Map name for '${Tool.Game}' tool (choices: ${mapChoices})`,
        parseMap(PACKAGE.dota2.customGame.maps),
        defaultMap
      )
      .action(
        async (tool: Tool, toolArgs: string[]) =>
          await new LaunchCommand(tool, toolArgs, command.opts(), configOptions).run()
      );
  }

  constructor(tool: Tool, toolArgs: string[], options: Options, configOptions: ConfigOptions) {
    super([tool, ...toolArgs], options, configOptions);

    this.#tool = tool;
    this.#toolArgs = toolArgs;
  }

  override async run() {
    switch (this.#tool) {
      case Tool.Game:
        await this.launchGame();
        break;
      case Tool.Tools:
        await this.launchTools();
        break;
      default:
        // eslint-disable-next-line no-var
        var _check: never = this.#tool;
        throw new Error(`Invalid tool: ${inspect(_check)}`);
    }
  }

  async execGame(args: string[]) {
    const {
      dota2: { binPath: cmd, path: cwd },
    } = this.config;

    args = [...LAUNCH_OPTIONS, ...this.#toolArgs, ...args];

    this.log.info(`Launching ${this.#tool}`);
    this.log.debug(inspect([cmd, ...args]));

    await this.exec(cmd, args, { cwd, echo: true });
  }

  async launchGame() {
    const { customGame } = this.config;
    const mapName = this.options.map || customGame.maps[0];

    if (!mapName) {
      throw new Error("Could not determine a map with which to launch the custom game");
    }

    const args = ["+dota_launch_custom_game", customGame.name, mapName];

    await this.execGame(args);
  }

  async launchTools() {
    const { customGame } = this.config;
    const args = ["-tools", "-addon", customGame.name];

    await this.execGame(args);
  }
}

function parseTool(value: string): Tool {
  const tool = value as Tool;

  switch (tool) {
    case Tool.Game:
      break;
    case Tool.Tools:
      break;
    default:
      // eslint-disable-next-line no-var
      var _check: never = tool;
      throw new Error(`Invalid tool: ${inspect(_check)}`);
  }

  return tool;
}

function parseMap(available: string[]): (value: string) => string {
  return (value: string): string => {
    if (available.indexOf(value) < 0) {
      throw new Error(`Invalid map ${inspect(value)}`);
    }

    return value;
  };
}
