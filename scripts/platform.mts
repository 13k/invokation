import process from "node:process";

const WSL_ENV_VAR = "WSL_DISTRO_NAME";

export const LINUX = process.platform === "linux";
export const DARWIN = process.platform === "darwin";
export const UNIX = LINUX || DARWIN;
export const WINDOWS = process.platform === "win32";
export const WSL = LINUX && process.env[WSL_ENV_VAR] != null;
