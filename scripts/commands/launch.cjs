const { spawn } = require("../util");

const NOBREAKPAD_APPIDS = [375360];

const LAUNCH_OPTIONS = {
  __common__: ["-novid", "-dev", "-uidev", "-nominidumps", "-condebug", "-toconsole", "-vconsole"],
  game: [],
  tools: ["-tools"],
};

async function launch(tool, toolArgs, { map }, { log, dota2, customGame }) {
  const cmd = dota2.binPath;
  let args = [];

  switch (tool) {
    case "game":
      map = map || customGame.maps[0];

      args.push("+dota_launch_custom_game", customGame.name, map);

      break;
    case "tools":
      args.push("-addon", customGame.name);

      break;
    default:
      log.fatal(`Invalid tool '${tool}'`);

      return;
  }

  args = [...args, ...LAUNCH_OPTIONS["__common__"], ...LAUNCH_OPTIONS[tool], ...toolArgs];

  NOBREAKPAD_APPIDS.forEach((appID) => {
    args.push("-nobreakpad", appID.toString());
  });

  log.field("command", [cmd, ...args].join(" ")).info(`Launching ${tool}`);

  spawn(cmd, args, { cwd: dota2.path });
}

module.exports = (tool, toolArgs, options, config) => launch(tool, toolArgs, options, config);
