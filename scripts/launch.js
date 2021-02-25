"use strict";

const { spawn } = require("./util");

async function launch(tool, toolArgs, { map }, { log, dota2, customGame }) {
  let cmd;
  const args = [];

  switch (tool) {
    case "game":
      cmd = dota2.binPath;
      map = map || customGame.maps[0];
      args.push("+dota_launch_custom_game", customGame.name, map);
      break;
    case "tools":
      cmd = dota2.toolsBinPath;
      args.push("-novid", "-console", "-addon", customGame.name);
      break;
    default:
      log.fatal(`Invalid tool '${tool}'`);
      return;
  }

  spawn(cmd, [...args, ...toolArgs], { cwd: dota2.path });
}

module.exports = (tool, toolArgs, options, config) => launch(tool, toolArgs, options, config);
