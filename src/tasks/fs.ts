import assert from "node:assert";

import { exec } from "./exec";
import type { Logger } from "./logger";
import type { Path, WindowsPath } from "./path";
import { PLATFORM } from "./platform";
import { isError } from "./util";

const ERR_FILE_NOT_FOUND = "ENOENT";
const POWERSHELL_BIN = "pwsh.exe";

export enum LinkType {
  Symbolic = "SymbolicLink",
  Hard = "HardLink",
  Junction = "Junction", // replaced with Symbolic on Unix
}

export interface LinkAttributes {
  type: LinkType;
  src: Path;
  dest: Path;
}

export interface CreateLinkOptions {
  log?: Logger | undefined;
  // wslNetworkDrive?: string | undefined;
}

export class Link implements LinkAttributes {
  type: LinkType;
  src: Path;
  dest: Path;

  constructor({ type, src, dest }: LinkAttributes) {
    this.type = type;
    this.src = src;
    this.dest = dest;
  }

  async create(options?: CreateLinkOptions): Promise<boolean> {
    if (await this.#tryExists()) {
      return false;
    }

    switch (this.type) {
      case LinkType.Symbolic: {
        await this.#symlink(options);
        break;
      }
      case LinkType.Junction: {
        await this.#junction(options);
        break;
      }
      case LinkType.Hard: {
        await this.#link();
        break;
      }
      default: {
        const _check: never = this.type;
        throw new Error(`Invalid link type: ${Bun.inspect(_check)}`);
      }
    }

    return true;
  }

  async #tryExists(): Promise<boolean> {
    try {
      // TODO: check if it's a link that points to `this.src`
      await this.dest.lstat();
      return true;
    } catch (err: unknown) {
      if (isError(err) && err.code === ERR_FILE_NOT_FOUND) {
        return false;
      }

      throw err;
    }
  }

  async #link() {
    // NOTE: it seems regular hard-link from WSL works, so avoid spawning a process
    await this.src.link(this.dest);
  }

  async #symlink(options?: CreateLinkOptions) {
    const srcSt = await this.src.stat();

    if (PLATFORM.isWsl) {
      await this.#wslLink(options);
    } else if (PLATFORM.isWindows) {
      const type = srcSt.isDirectory() ? "dir" : "file";

      await this.src.symlink(this.dest, type);
    } else {
      await this.src.symlink(this.dest);
    }
  }

  async #junction(options?: CreateLinkOptions) {
    if (PLATFORM.isWsl) {
      await this.#wslLink(options);
    } else if (PLATFORM.isWindows) {
      await this.src.symlink(this.dest, "junction");
    } else {
      await this.src.symlink(this.dest);
    }
  }

  async #wslLink(options?: CreateLinkOptions) {
    assert(this.dest.isWslPosix(), "expected WSL path");

    const { type, path: src } = await this.#remapSource(options);
    const dest = this.dest.windows({ absolute: true });

    await this.dest.dirname().mkdir({ recursive: true });

    await pwshLink(type, src, dest, options?.log);
  }

  async #remapSource(_options?: CreateLinkOptions): Promise<{ type: LinkType; path: WindowsPath }> {
    assert(this.src.isWslPosix(), "expected WSL path");

    const type = this.type;
    const path = this.src.windows({ absolute: true });

    // convert
    //   - [Windows/local path] `C:\foo` to `\\?\C:\foo`
    //   - [WSL/remote path] `\\wsl_host\distro\foo` to `\\?\UNC\wsl_host\distro\foo`
    const nsPath = path.namespaced();

    // only accept windows paths here
    if (nsPath.isUnc()) {
      throw new Error(`Path must be outside WSL disk: ${this.src}`);
    }

    // NOTE: disabled: resourcecompiler doesn't like this
    // TODO: last resort: try a virtual filesystem
    /*
    // This will mount a network drive pointing to the current WSL disk
    // and remap source path to use the network drive
    if (options?.wslNetworkDrive != null) {
      // links over network mounts must be symbolic
      type = LinkType.Symbolic;

      // only accept WSL paths here
      if (!nsPath.isUnc()) {
        throw new Error(`Path is outside WSL disk: ${this.src}`);
      }

      // `path`: `\\wsl_host\distro\foo\bar\baz`
      // `root`: `\\wsl_host\distro`
      const root = path.root();

      assert(root, "expected path with root");

      // mount: `\\wsl_host\distro` to drive `X`
      await pwshMount(options.wslNetworkDrive, root, options?.log);

      // remap root: from `\\wsl_host\distro` to `X:\`
      const localRoot = `${options.wslNetworkDrive}:\\`;
      // relative path without root: `foo\bar\baz`
      const relPath = root.relative(path);
      // remap path: `\\wsl_host\distro\foo\bar\baz` to `X:\foo\bar\baz`
      path = new WslWindowsPath(localRoot).join(relPath);
    }
    */

    return { type, path };
  }
}

async function pwshLink(type: LinkType, src: WindowsPath, dest: WindowsPath, log?: Logger) {
  const args = ["-Command", `New-Item -ItemType "${type}" -Target "${src}" -Path "${dest}"`];

  exec(POWERSHELL_BIN, args, { log });
}

/*
async function pwshMount(drive: string, path: WindowsPath, log?: Logger) {
  const pathStr = path.toString().replace(/[\/\\]$/, "");

  const psCmd = `
$driveName = "${drive}"
$path = "${pathStr}"
$drive = Get-PSDrive -Name "$driveName" -ErrorAction Ignore

if ($null -eq $drive) {
  $drive = New-PSDrive -Name "$driveName" -PSProvider "FileSystem" -Root "$path" -Persist
}

if ($drive.DisplayRoot -ne "$path") {
  $display = $drive.Root

  if ($null -ne $drive.DisplayRoot) {
    $display = "$display ($($drive.DisplayRoot))"
  }

  throw "Drive $display already exists"
}
`;

  const args = ["-Command", psCmd];

  exec(POWERSHELL_BIN, args, { log });
}
*/
