const fse = require("fs-extra");

class CleanCommand {
  static cliOptions(/* config */) {
    return {
      usage: "clean",
      description: "Remove custom game resources and unlink source code",
      options: [
        {
          flags: "-n, --noop",
          description: "Only print paths that would be removed",
          default: false,
        },
      ],
    };
  }

  constructor(_, { noop }, { log, customGame: { contentPath, gamePath } }) {
    this.log = log;
    this.contentPath = contentPath;
    this.gamePath = gamePath;
    this.noop = noop;
  }

  async run() {
    const promises = [this.contentPath, this.gamePath].map(this.cleanPath.bind(this));

    return Promise.all(promises);
  }

  async cleanPath(path) {
    if (this.noop) {
      this.log.info(path, { label: "noop", color: "cyan" });
      return path;
    }

    await fse.remove(path);

    this.log.success(path, { label: "remove" });

    return path;
  }
}

module.exports = CleanCommand;
