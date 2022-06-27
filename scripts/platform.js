const Enum = require("./enum");
const wsl = require("./wsl");

const Platform = Enum({
  Darwin: "darwin",
  Linux: "linux",
  Windows: "win32",
  WSL: "wsl",
});

const PLATFORM = wsl.isWSL() ? Platform.WSL : process.platform;

module.exports = {
  PLATFORM,
  Platform,
};
