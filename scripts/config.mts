import * as path from "node:path";

export const { default: PACKAGE }: PackageImport = await import("../package.json", {
  assert: { type: "json" },
});

interface PackageImport {
  default: PackageConfig;
}

export interface PackageConfig {
  dota2: PackageDota2;
}

export interface PackageDota2 {
  customGame: PackageCustomGame;
}

export interface PackageCustomGame {
  name: string;
  maps: string[];
}

export interface Config {
  rootPath: string;
  sources: ConfigSources;
  dota2: ConfigDota2;
  customGame: ConfigCustomGame;
}

export interface ConfigSources {
  contentPath: string;
  panoramaScriptsPath: string;
  panoramaStylesPath: string;
  gamePath: string;
  vscriptsPath: string;
}

export interface ConfigDota2 {
  path: string;
  binPath: string;
  toolsBinPath: string;
  resourceCompilerBinPath: string;
  addonsContentPath: string;
  addonsGamePath: string;
}

export interface ConfigCustomGame extends PackageCustomGame {
  contentPath: string;
  gamePath: string;
}

export interface ConfigOptions {
  rootPath: string;
  dota2Path: string;
}

export function createConfig({ rootPath, dota2Path }: ConfigOptions): Config {
  const {
    dota2: { customGame: pkgCustomGame },
  } = PACKAGE;

  const contentPath = path.join(rootPath, "content");
  const panoramaPath = path.join(contentPath, "panorama");
  const gamePath = path.join(rootPath, "game");
  const scriptsPath = path.join(gamePath, "scripts");
  const sources = {
    contentPath,
    panoramaPath,
    panoramaScriptsPath: path.join(panoramaPath, "scripts"),
    panoramaStylesPath: path.join(panoramaPath, "styles"),
    gamePath,
    scriptsPath,
    vscriptsPath: path.join(scriptsPath, "vscripts"),
  };

  const dota2BinDir = path.join(dota2Path, "game", "bin", "win64");
  const dota2 = {
    path: dota2Path,
    binDir: dota2BinDir,
    binPath: path.join(dota2BinDir, "dota2.exe"),
    toolsBinPath: path.join(dota2BinDir, "dota2cfg.exe"),
    resourceCompilerBinPath: path.join(dota2BinDir, "resourcecompiler.exe"),
    addonsContentPath: path.join(dota2Path, "content", "dota_addons"),
    addonsGamePath: path.join(dota2Path, "game", "dota_addons"),
  };

  const customGame = {
    ...pkgCustomGame,
    contentPath: path.join(dota2.addonsContentPath, pkgCustomGame.name),
    gamePath: path.join(dota2.addonsGamePath, pkgCustomGame.name),
  };

  return {
    rootPath,
    sources,
    dota2,
    customGame,
  };
}
