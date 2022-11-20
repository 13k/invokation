const { spawnSync } = require("child_process");

const WSLPATH_BIN = "wslpath";

function wslpath(path, options) {
  const args = [];

  if (options.unix) {
    args.push("-u");
  } else if (options.windows) {
    args.push("-w");
  }

  if (options.absolute) {
    args.push("-a");
  }

  args.push(path);

  const proc = spawnSync(WSLPATH_BIN, args, { encoding: "utf-8" });

  if (proc.error) {
    throw proc.error;
  }

  if (proc.status !== 0) {
    throw `${WSLPATH_BIN} exited with status ${proc.status}: ${proc.stderr}`;
  }

  return proc.stdout.trim();
}

module.exports = {
  isWSL() {
    return !!process.env.WSL_DISTRO_NAME;
  },

  unixPath(path, options) {
    return wslpath(path, { unix: true, ...options });
  },

  windowsPath(path, options) {
    return wslpath(path, { windows: true, ...options });
  },
};
