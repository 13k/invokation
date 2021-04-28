const dotenv = require("dotenv");
const fse = require("fs-extra");

async function load(path) {
  if (!(await fse.pathExists(path))) return;

  const result = dotenv.config({ path });

  if (result.error) {
    throw result.error;
  }

  return result;
}

module.exports = {
  load,
};
