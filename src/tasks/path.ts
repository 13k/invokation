import type fs from "node:fs";

import { default as MojoPath } from "@mojojs/path";
import fse from "fs-extra";
import { glob } from "glob";
import type { GlobOptionsWithFileTypesUnset } from "glob";

import { capture } from "./exec";
import { UNIX, UnknownPlatformError, WINDOWS, WSL } from "./platform";

export type GlobOptions = GlobOptionsWithFileTypesUnset;
export type PathLike = Path | string;

export enum LinkType {
  Symbolic = "SymbolicLink",
  Hard = "HardLink",
  Junction = "Junction",
}

export interface Link {
  type: LinkType;
  src: Path;
  dest: Path;
}

function pathLikeStrings(parts: PathLike[]): string[] {
  return parts.map((p) => p.toString());
}

export class Path {
  #path: MojoPath;

  static new(...parts: PathLike[]): Path {
    if (WSL) {
      return new WslPosixPath(...parts);
    }

    if (UNIX) {
      return new PosixPath(...parts);
    }

    if (WINDOWS) {
      return new WindowsPath(...parts);
    }

    throw new UnknownPlatformError();
  }

  constructor(...parts: PathLike[]) {
    this.#path = new MojoPath(...pathLikeStrings(parts));
  }

  toString(): string {
    return this.#path.toString();
  }

  isPosix(): this is PosixPath {
    return this instanceof PosixPath;
  }

  isWslPosix(): this is WslPosixPath {
    return this instanceof WslPosixPath;
  }

  isWslWindows(): this is WslWindowsPath {
    return this instanceof WslWindowsPath;
  }

  isWindows(): this is WindowsPath {
    return this instanceof WindowsPath;
  }

  #new(path: MojoPath | string): this {
    const ctor = Object.getPrototypeOf(this).constructor;

    return new ctor(path.toString());
  }

  join(...parts: PathLike[]): this {
    return this.#new(this.#path.child(...pathLikeStrings(parts)));
  }

  basename(ext?: string): this {
    return this.#new(this.#path.basename(ext));
  }

  dirname(): this {
    return this.#new(this.#path.dirname());
  }

  relative(to: PathLike): this {
    return this.#new(this.#path.relative(to.toString()));
  }

  async stat(options?: fs.StatOptions): Promise<fs.Stats | fs.BigIntStats> {
    return await this.#path.stat(options);
  }

  async exists(): Promise<boolean> {
    return await this.#path.exists();
  }

  async mkdir(options?: fs.MakeDirectoryOptions & { recursive: true }): Promise<void> {
    await this.#path.mkdir(options);
  }

  async rm(options?: fs.RmOptions): Promise<void> {
    return await this.#path.rm(options);
  }

  async link(dest: PathLike): Promise<void> {
    return await fse.ensureLink(this.toString(), dest.toString());
  }

  async readFile(): Promise<string> {
    const file = Bun.file(this.toString());

    return await file.text();
  }

  async writeFile(data: string): Promise<void> {
    await Bun.write(this.toString(), data);
  }

  async glob(pattern: PathLike, options?: GlobOptions): Promise<Path[]> {
    const strPaths = await glob(this.join(pattern).toString(), options);

    return strPaths.map((s) => Path.new(s));
  }
}

export class PosixPath extends Path {}

export class WindowsPath extends Path {}

export class WslPosixPath extends PosixPath {
  constructor(...parts: PathLike[]) {
    if (!WSL) {
      throw new Error("Cannot use WslPath when not in WSL environment");
    }

    super(...parts);
  }

  windows(options: { absolute: boolean } = { absolute: false }) {
    const path = wslpath(this.toString(), { windows: true, ...options });

    return new WslWindowsPath(path);
  }
}

export class WslWindowsPath extends WindowsPath {
  posix(options: { absolute: boolean } = { absolute: false }) {
    const path = wslpath(this.toString(), { unix: true, ...options });

    return new WslPosixPath(path);
  }
}

const WSLPATH_BIN = "wslpath";

interface WslPathOptions {
  unix?: boolean;
  windows?: boolean;
  absolute?: boolean;
}

function wslpath(path: string, options: WslPathOptions = {}) {
  const args: string[] = [];

  if (options.unix) {
    args.push("-u");
  } else if (options.windows) {
    args.push("-w");
  }

  if (options.absolute) {
    args.push("-a");
  }

  args.push(path);

  return capture(WSLPATH_BIN, args);
}

function rootDir(): Path {
  try {
    const path = Bun.resolveSync("../../package.json", import.meta.dir);

    return Path.new(path).dirname();
  } catch (err) {
    throw new Error(`Could not determine project root directory! Error: ${err}`);
  }
}

export const ROOT_DIR: Path = rootDir();
