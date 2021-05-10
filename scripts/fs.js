const fse = require("fs-extra");

async function isFileStale(src, dest) {
  let destSt;

  const srcSt = await fse.stat(src);

  try {
    destSt = await fse.stat(dest);
  } catch (error) {
    if (error.code === "ENOENT") {
      return true;
    }
  }

  return srcSt.mtime > destSt.mtime;
}

async function install(src, dest) {
  return fse.copy(src, dest, { preserveTimestamps: true, filter: isFileStale });
}

module.exports = {
  isFileStale,
  install,
};
