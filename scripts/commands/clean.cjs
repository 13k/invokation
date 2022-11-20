const rmrf = require("rimraf");

async function clean({ noop }, { log, customGame: { contentPath, gamePath } }) {
  [contentPath, gamePath].forEach((path) => {
    if (noop) {
      return log.info(path, { label: "skip" });
    }

    rmrf.sync(path);
    log.success(path, { label: "remove" });
  });
}

module.exports = (options, config) => clean(options, config);
