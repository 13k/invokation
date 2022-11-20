const path = require("path");

function createConfig(rootPath, dota2Path, log) {
  const pkg = require(path.join(rootPath, "package.json"));
  const customGame = pkg.dota2.customGame;
  const dota2AddonsContentPath = path.join(dota2Path, "content", "dota_addons");
  const dota2AddonsGamePath = path.join(dota2Path, "game", "dota_addons");

  return {
    log: log,
    rootPath: rootPath,
    sources: {
      contentPath: path.join(rootPath, "content"),
      panoramaScriptsPath: path.join(rootPath, "content", "panorama", "scripts"),
      panoramaStylesPath: path.join(rootPath, "content", "panorama", "styles"),
      gamePath: path.join(rootPath, "game"),
      vscriptsPath: path.join(rootPath, "game", "scripts", "vscripts"),
    },
    dota2: {
      path: dota2Path,
      binPath: path.join(dota2Path, "game", "bin", "win64", "dota2.exe"),
      toolsBinPath: path.join(dota2Path, "game", "bin", "win64", "dota2cfg.exe"),
      resourceCompilerBinPath: path.join(dota2Path, "game", "bin", "win64", "resourcecompiler.exe"),
      addonsContentPath: dota2AddonsContentPath,
      addonsGamePath: dota2AddonsGamePath,
    },
    customGame: {
      ...customGame,
      contentPath: path.join(dota2AddonsContentPath, customGame.name),
      gamePath: path.join(dota2AddonsGamePath, customGame.name),
    },
  };
}

module.exports = {
  createConfig,
};
