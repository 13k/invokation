import type { Path } from "./path.mjs";

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

export interface ConfigOptions {
  rootDir: Path;
  dota2Dir: Path;
}

export class Config {
  rootDir: Path;
  sources: ConfigSources;
  dota2: ConfigDota2;
  customGame: ConfigCustomGame;

  constructor({ rootDir, dota2Dir }: ConfigOptions) {
    const {
      dota2: { customGame: pkgCustomGame },
    } = PACKAGE;

    this.rootDir = rootDir;
    this.sources = {
      srcDir: rootDir.join("src"),
      contentDir: rootDir.join("content"),
      gameDir: rootDir.join("game"),
    };

    const dota2BinDir = dota2Dir.join("game", "bin", "win64");

    this.dota2 = {
      baseDir: dota2Dir,
      binDir: dota2BinDir,
      gameBinPath: dota2BinDir.join("dota2.exe"),
      sdkBinPath: dota2BinDir.join("dota2cfg.exe"),
      resourceCompilerBinPath: dota2BinDir.join("resourcecompiler.exe"),
      addonsContentDir: dota2Dir.join("content", "dota_addons"),
      addonsGameDir: dota2Dir.join("game", "dota_addons"),
    };

    this.customGame = {
      ...pkgCustomGame,
      contentDir: this.dota2.addonsContentDir.join(pkgCustomGame.name),
      gameDir: this.dota2.addonsGameDir.join(pkgCustomGame.name),
    };
  }

  customGameContentRelPath(srcPath: Path): Path {
    const {
      sources: { contentDir: srcDir },
      customGame: { contentDir: destDir },
    } = this;

    const srcRelPath = srcDir.relative(srcPath);
    const destPath = destDir.join(srcRelPath);

    return this.dota2.baseDir.relative(destPath);
  }
}

export interface ConfigSources {
  srcDir: Path;
  contentDir: Path;
  gameDir: Path;
}

export interface ConfigDota2 {
  baseDir: Path;
  binDir: Path;
  gameBinPath: Path;
  sdkBinPath: Path;
  resourceCompilerBinPath: Path;
  addonsContentDir: Path;
  addonsGameDir: Path;
}

export interface ConfigCustomGame extends PackageCustomGame {
  contentDir: Path;
  gameDir: Path;
}
