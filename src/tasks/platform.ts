import os from "node:os";
import process from "node:process";

const WSL_DISTRO_ENV_VAR = "WSL_DISTRO_NAME";

export const HOSTNAME = os.hostname();
export const WSL_DISTRO = process.env[WSL_DISTRO_ENV_VAR];

export class Platform {
  static CURRENT: string = process.platform;

  #platform: string = process.platform;
  #isWsl: boolean;

  constructor() {
    this.#isWsl = this.isLinux && WSL_DISTRO != null;
  }

  get isDarwin(): boolean {
    return this.#platform === "darwin";
  }

  get isLinux(): boolean {
    return this.#platform === "linux";
  }

  get isUnix(): boolean {
    return this.isDarwin || this.isLinux;
  }

  get isWindows(): boolean {
    return this.#platform === "win32";
  }

  get isWsl(): boolean {
    return this.#isWsl;
  }
}

export const PLATFORM: Platform = new Platform();

export class UnknownPlatformError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    const msg = message ?? `Unknown platform: ${Bun.inspect(process.platform)}`;

    super(msg, options);
  }
}
