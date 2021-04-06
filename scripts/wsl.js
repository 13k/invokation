const { run } = require("./process");

const WSLPATH_BIN = "wslpath";

async function wslpath(path, { log, ...options } = {}) {
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

  const proc = await run(WSLPATH_BIN, args, { log });

  return proc.stdout.trim();
}

const isWSL = () => !!process.env.WSL_DISTRO_NAME;
const unixPath = async (path, options) => wslpath(path, { unix: true, ...options });
const windowsPath = async (path, options) => wslpath(path, { windows: true, ...options });

module.exports = {
  isWSL,
  unixPath,
  windowsPath,
};
