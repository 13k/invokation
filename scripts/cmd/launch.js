const { run } = require("../process");

const TOOLS = ["game", "tools"];

class LaunchCommand {
  static cliOptions(config) {
    const toolChoices = TOOLS.map((t) => `"${t}"`).join(", ");

    return {
      usage: "launch <tool> [toolArgs...]",
      description: [
        "Launches the given tool",
        {
          tool: `One of: ${toolChoices}`,
          toolArgs: "Tool arguments",
        },
      ],
      options: [
        {
          flags: "-m, --map <map>",
          description: 'Map name for "game" tool',
          default: config.customGame.maps[0],
          choices: config.customGame.maps,
        },
      ],
    };
  }

  constructor([tool, toolArgs], { map }, { log, ...config }) {
    this.tool = tool;
    this.toolArgs = toolArgs;
    this.map = map;
    this.log = log;
    this.config = config;
  }

  async run() {
    switch (this.tool) {
      case "game":
        return this.launchGame();
      case "tools":
        return this.launchTools();
      default:
        this.log.fatal(`${this.tool}: invalid tool`);
        return null;
    }
  }

  async launchGame() {
    const { customGame, dota2 } = this.config;
    const args = [
      "-novid",
      "-console",
      "+dota_launch_custom_game",
      customGame.name,
      this.map || customGame.maps[0],
    ];

    return run(dota2.binPath, [...args, ...this.toolArgs], { cwd: dota2.path });
  }

  async launchTools() {
    const { customGame, dota2 } = this.config;
    const args = ["-novid", "-console", "-addon", customGame.name];

    return run(dota2.toolsBinPath, [...args, ...this.toolArgs], { cwd: dota2.path });
  }
}

module.exports = LaunchCommand;
