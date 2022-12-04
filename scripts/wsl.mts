import { exec } from "./util.mjs";

export interface PathOptions {
  unix?: boolean;
  windows?: boolean;
  absolute?: boolean;
}

const WSL_ENV_VAR = "WSL_DISTRO_NAME";
const WSLPATH_BIN = "wslpath";

async function wslpath(path: string, options: PathOptions = {}) {
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

  const cp = await exec(WSLPATH_BIN, args, { encoding: "utf-8" });

  if (cp instanceof Error) {
    throw cp;
  }

  return cp.stdout;
}

export const IS_WSL = process.env[WSL_ENV_VAR] != null;

export async function unixPath(path: string, options: PathOptions = {}) {
  return await wslpath(path, { unix: true, ...options });
}

export async function windowsPath(path: string, options: PathOptions = {}) {
  return await wslpath(path, { windows: true, ...options });
}
