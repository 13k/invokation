import packageJson from "../package.json";
import type { Path } from "./path";
import { DARWIN, LINUX, WINDOWS, WSL, unknownPlatform } from "./platform";

export const PACKAGE: Package = packageJson;

// interface PackageImport {
//   default: Package;
// }

interface Package {
  dota2: {
    customGame: PackageCustomGame;
  };
}

interface PackageCustomGame {
  name: string;
  maps: string[];
}

export interface ConfigSources {
  srcDir: Path;
  contentDir: Path;
  gameDir: Path;
}

export interface ConfigDota2 {
  baseDir: Path;
  gameBinPath: Path;
  sdkBinPath: Path | undefined;
  resourceCompiler: string[] | undefined;
  addonsContentDir: Path;
  addonsGameDir: Path;
}

export interface ConfigCustomGame extends PackageCustomGame {
  contentDir: Path;
  gameDir: Path;
}

export interface ConfigOptions {
  rootDir: Path;
  dota2Dir: Path;
  resourceCompiler?: string[];
}

export class Config {
  rootDir: Path;
  sources: ConfigSources;
  dota2: ConfigDota2;
  customGame: ConfigCustomGame;

  constructor(options: ConfigOptions) {
    const {
      dota2: { customGame: pkgCustomGame },
    } = PACKAGE;

    const { rootDir, dota2Dir } = options;

    this.rootDir = rootDir;
    this.sources = {
      srcDir: rootDir.join("src"),
      contentDir: rootDir.join("content"),
      gameDir: rootDir.join("game"),
    };

    this.dota2 = configDota2(dota2Dir, options.resourceCompiler);

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

// https://steamdb.info/app/570/config
function configDota2(baseDir: Path, resourceCompilerOpt?: string[]): ConfigDota2 {
  let gameBinPath: Path | undefined = undefined;
  let sdkBinPath: Path | undefined = undefined;
  let resourceCompiler: string[] | undefined = resourceCompilerOpt;

  if (WSL || WINDOWS) {
    const binDir = baseDir.join("game", "bin", "win64");

    gameBinPath = binDir.join("dota2.exe");
    sdkBinPath = binDir.join("dota2cfg.exe");
    resourceCompiler ??= [binDir.join("resourcecompiler.exe").toString()];
  } else if (LINUX) {
    gameBinPath = baseDir.join("game", "dota.sh");
  } else if (DARWIN) {
    gameBinPath = baseDir.join("game", "dota.sh");
  } else {
    unknownPlatform();
  }

  const addonsContentDir = baseDir.join("content", "dota_addons");
  const addonsGameDir = baseDir.join("game", "dota_addons");

  return {
    baseDir,
    gameBinPath,
    sdkBinPath,
    resourceCompiler,
    addonsContentDir,
    addonsGameDir,
  };
}
