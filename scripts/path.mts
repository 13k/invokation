import type { Abortable } from "node:events";
import type fs from "node:fs";
import { fileURLToPath } from "node:url";

import { default as MojoPath } from "@mojojs/path";
import fse from "fs-extra";
import { glob } from "glob";
import type { GlobOptionsWithFileTypesUnset } from "glob";

import { exec } from "./exec.mjs";
import { UNIX, WINDOWS, WSL, unknownPlatform } from "./platform.mjs";

export type { GlobOptionsWithFileTypesUnset as GlobOptions } from "glob";

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

    unknownPlatform();
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

  async readFile(options?: { flag?: fs.OpenMode }): Promise<string> {
    return (await this.#path.readFile({ encoding: "utf8", ...options })) as string;
  }

  async writeFile(
    data: string,
    options?: {
      mode?: fs.Mode;
      flag?: fs.OpenMode;
    } & Abortable,
  ): Promise<void> {
    await this.#path.writeFile(data, { encoding: "utf8", ...options });
  }

  async glob(pattern: PathLike, options?: GlobOptionsWithFileTypesUnset): Promise<Path[]> {
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

  async windows(options: { absolute: boolean } = { absolute: false }) {
    return await wslpath(this.toString(), { windows: true, ...options }).then(
      (pathStr) => new WslWindowsPath(pathStr),
    );
  }
}

export class WslWindowsPath extends WindowsPath {
  async posix(options: { absolute: boolean } = { absolute: false }) {
    return await wslpath(this.toString(), { unix: true, ...options }).then(
      (pathStr) => new WslPosixPath(pathStr),
    );
  }
}

const WSLPATH_BIN = "wslpath";

interface WslPathOptions {
  unix?: boolean;
  windows?: boolean;
  absolute?: boolean;
}

async function wslpath(path: string, options: WslPathOptions = {}) {
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

  const cp = await exec(WSLPATH_BIN, args, { encoding: "utf8" });

  if (cp instanceof Error) {
    throw cp;
  }

  return cp.stdout;
}

// FIXME: This will not work if compiling to javascript
export const ROOT_DIR = Path.new(fileURLToPath(import.meta.url))
  .dirname()
  .dirname();
