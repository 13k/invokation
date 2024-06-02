import { inspect } from "node:util";

import type { Command } from "commander";

import { PACKAGE } from "../config.mjs";
import type { PathLike } from "../path.mjs";
import BaseCommand from "./base.mjs";

export interface Args {
  tool: Tool;
  toolArgs: string[];
}

export interface Options {
  map?: string;
}

export enum Tool {
  Game = "game",
  Tools = "tools",
}

function parseTool(value: string): Tool {
  const tool = value as Tool;

  switch (tool) {
    case Tool.Game:
      break;
    case Tool.Tools:
      break;
    default: {
      const _check: never = tool;
      throw new Error(`Invalid tool: ${inspect(_check)}`);
    }
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

const BREAKPAD_APPIDS: number[] = [570, 375360];
const COMMON_LAUNCH_OPTIONS: string[] = ["-1080", "-novid", "-nominidumps", "-toconsole", "-steam"];
const GAME_LAUNCH_OPTIONS: string[] = ["-dev", "-uidev", "-condebug", "-vconsole"];
const SDK_LAUNCH_OPTIONS: string[] = [];
const NOBREAKPAD_OPTIONS = BREAKPAD_APPIDS.flatMap((appID) => ["-nobreakpad", appID.toString()]);
const LAUNCH_OPTIONS = [...COMMON_LAUNCH_OPTIONS, ...NOBREAKPAD_OPTIONS];

export default class LaunchCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    const toolChoices = Object.values(Tool).join(", ");
    const mapChoices = PACKAGE.dota2.customGame.maps.join(", ");
    const defaultMap = PACKAGE.dota2.customGame.maps[0];

    return parent
      .command("launch")
      .description("Launches the given tool")
      .argument("<tool>", `Tool to launch (choices: ${toolChoices})`, parseTool)
      .argument("[toolArgs...]", "Extra arguments to pass to tool command")
      .option(
        "-m, --map <map>",
        `Map name for '${Tool.Game}' tool (choices: ${mapChoices})`,
        parseMap(PACKAGE.dota2.customGame.maps),
        defaultMap,
      );
  }

  override parseArgs(tool: Tool, ...toolArgs: string[]): Args {
    return {
      tool,
      toolArgs,
    };
  }

  override async run(): Promise<void> {
    switch (this.args.tool) {
      case Tool.Game:
        await this.launchGame();
        break;
      case Tool.Tools:
        await this.launchTools();
        break;
      default: {
        const _check: never = this.args.tool;
        throw new Error(`Invalid tool: ${inspect(_check)}`);
      }
    }
  }

  async execBin(cmd: PathLike, args: PathLike[]): Promise<void> {
    const {
      dota2: { baseDir: cwd },
    } = this.config;

    const execArgs = [...LAUNCH_OPTIONS, ...this.args.toolArgs, ...args];

    this.log.info(`Launching ${this.args.tool}`);
    this.log.debug(inspect([cmd, ...execArgs]));

    await this.exec(cmd, execArgs, { cwd: cwd.toString(), echo: true });
  }

  async execGame(args: PathLike[]): Promise<void> {
    const {
      dota2: { gameBinPath: cmd },
    } = this.config;

    await this.execBin(cmd, [...GAME_LAUNCH_OPTIONS, ...args]);
  }

  async execSdk(args: PathLike[]): Promise<void> {
    const {
      dota2: { sdkBinPath: cmd },
    } = this.config;

    if (!cmd) {
      throw new Error("Could not find workshop tools executable");
    }

    await this.execBin(cmd, [...SDK_LAUNCH_OPTIONS, ...args]);
  }

  async launchGame(): Promise<void> {
    const { customGame } = this.config;
    const mapName = this.options.map ?? customGame.maps[0];

    if (!mapName) {
      throw new Error("Could not determine a map with which to launch the custom game");
    }

    const args = ["+dota_launch_custom_game", customGame.name, mapName];

    await this.execGame(args);
  }

  async launchTools(): Promise<void> {
    const { customGame } = this.config;
    const args = ["-addon", customGame.name];

    await this.execSdk(args);
  }
}
