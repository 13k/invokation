import type fs from "node:fs";
import path from "node:path";

import fse from "fs-extra";
import type { GlobOptionsWithFileTypesUnset } from "glob";
import { glob } from "glob";

import { capture } from "./exec";
import { PLATFORM, UnknownPlatformError } from "./platform";

export type GlobOptions = GlobOptionsWithFileTypesUnset;
export type PathLike = Path | string;

function pathLikeStrings(parts: PathLike[]): string[] {
  return parts.map((p) => p.toString());
}

export abstract class Path {
  protected abstract path: string;
  abstract parsed: path.ParsedPath;

  static new(...parts: PathLike[]): Path {
    if (PLATFORM.isWsl) {
      return new WslPosixPath(...parts);
    }

    if (PLATFORM.isUnix) {
      return new PosixPath(...parts);
    }

    if (PLATFORM.isWindows) {
      return new WindowsPath(...parts);
    }

    throw new UnknownPlatformError();
  }

  protected ctor(): new (..._parts: PathLike[]) => this {
    return Object.getPrototypeOf(this).constructor;
  }

  protected new(path: string): this {
    return new (this.ctor())(path);
  }

  toString(): string {
    return this.path;
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

  root(): this | undefined {
    return this.parsed.root ? new (this.ctor())(this.parsed.root) : undefined;
  }

  abstract basename(ext?: string): this;
  abstract dirname(): this;
  abstract ext(): string | undefined;
  abstract join(...parts: PathLike[]): this;
  abstract relative(to: PathLike): this;
  abstract resolve(): this;

  async stat(): Promise<fs.Stats>;
  async stat(options: fs.StatOptions & { bigint: true }): Promise<fs.BigIntStats>;

  async stat(options?: fs.StatOptions): Promise<fs.Stats | fs.BigIntStats> {
    return await fse.stat(this.toString(), options);
  }

  async lstat(): Promise<fs.Stats>;
  async lstat(options: fs.StatOptions & { bigint: true }): Promise<fs.BigIntStats>;

  async lstat(options?: fs.StatOptions): Promise<fs.Stats | fs.BigIntStats> {
    return await fse.lstat(this.toString(), options);
  }

  async exists(): Promise<boolean> {
    return await fse.exists(this.toString());
  }

  async mkdir(options?: fs.MakeDirectoryOptions): Promise<void> {
    await fse.mkdir(this.toString(), options);
  }

  async rm(options?: fs.RmOptions): Promise<void> {
    await fse.rm(this.toString(), options);
  }

  async link(dest: PathLike): Promise<void> {
    await fse.ensureLink(this.toString(), dest.toString());
  }

  async symlink(dest: PathLike, type?: fs.symlink.Type | undefined): Promise<void> {
    await fse.ensureSymlink(this.toString(), dest.toString(), type);
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

export class PosixPath extends Path {
  protected path: string;
  parsed: path.ParsedPath;

  constructor(...parts: PathLike[]) {
    super();

    this.path = path.posix.join(...pathLikeStrings(parts));
    this.parsed = path.posix.parse(this.toString());
  }

  override basename(ext?: string): this {
    return this.new(path.posix.basename(this.toString(), ext));
  }

  override dirname(): this {
    return this.new(path.posix.dirname(this.toString()));
  }

  override ext(): string | undefined {
    const ext = path.posix.extname(this.toString());

    return ext !== "" ? ext : undefined;
  }

  override join(...parts: PathLike[]): this {
    return this.new(path.posix.join(this.toString(), ...pathLikeStrings(parts)));
  }

  override relative(to: PathLike): this {
    return this.new(path.posix.relative(this.toString(), to.toString()));
  }

  override resolve(): this {
    return this.new(path.posix.resolve(this.toString()));
  }
}

export class WindowsPath extends Path {
  protected path: string;
  parsed: path.ParsedPath;

  constructor(...parts: PathLike[]) {
    super();

    this.path = path.win32.join(...pathLikeStrings(parts));
    this.parsed = path.win32.parse(this.toString());
  }

  override basename(ext?: string): this {
    return this.new(path.win32.basename(this.toString(), ext));
  }

  override dirname(): this {
    return this.new(path.win32.dirname(this.toString()));
  }

  override ext(): string | undefined {
    const ext = path.win32.extname(this.toString());

    return ext !== "" ? ext : undefined;
  }

  override join(...parts: PathLike[]): this {
    return this.new(path.win32.join(this.toString(), ...pathLikeStrings(parts)));
  }

  override relative(to: PathLike): this {
    return this.new(path.win32.relative(this.toString(), to.toString()));
  }

  override resolve(): this {
    return this.new(path.win32.resolve(this.toString()));
  }

  namespaced(): this {
    return this.new(path.win32.toNamespacedPath(this.toString()));
  }

  isUnc(): boolean {
    return this.path.startsWith("\\\\?\\UNC");
  }
}

export class WslPosixPath extends PosixPath {
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

  return capture(WSLPATH_BIN, args).trim();
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
