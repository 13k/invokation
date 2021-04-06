const os = require("os");
const path = require("path");

const fse = require("fs-extra");
const globby = require("globby");
const pmap = require("p-map");
const prettyMs = require("pretty-ms");
const yaml = require("js-yaml");

const { run } = require("../process");

const LUAFORMATTER_BIN = "lua-format";
const LUAFORMATTER_CONFIG = ".lua-format";

class FormatLuaCommand {
  static cliOptions(/* config */) {
    return {
      usage: "format-lua",
      description: "Format Lua (vscript) source files",
      options: [
        {
          flags: "-n, --noop",
          description: "Only print paths that would be formatted",
          default: false,
        },
      ],
    };
  }

  constructor(_, options, { log, rootPath }) {
    this.log = log;
    this.options = options;
    this.rootPath = rootPath;

    this._fmtConfigPath = path.join(rootPath, LUAFORMATTER_CONFIG);
    this._filesGlobPatt = path.join(rootPath, "**", "*.lua");
  }

  async run() {
    const files = await this.findFiles();
    const concurrency = os.cpus().length - 1;
    const results = await pmap(files, this.formatFile.bind(this), { concurrency });

    return Object.fromEntries(results);
  }

  async loadFmtConfig() {
    try {
      const data = await fse.readFile(this._fmtConfigPath, "utf-8");

      return yaml.load(data);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;

      return {};
    }
  }

  async findFiles() {
    const fmtConfig = await this.loadFmtConfig();
    const ignore = (fmtConfig.ignore || []).map((patt) => path.join(this.rootPath, patt));

    return globby(this._filesGlobPatt, {
      onlyFiles: true,
      ignore,
    });
  }

  formatFile(filename) {
    const relPath = path.relative(this.rootPath, filename);

    if (this.options.noop) {
      this.log.info(relPath, { label: "skip" });

      return [filename, false];
    }

    const args = ["-c", this._fmtConfigPath, "-i", filename];
    const startTime = new Date();

    return run(LUAFORMATTER_BIN, args, { log: this.log }).then(() => {
      const endTime = new Date();
      const durStr = prettyMs(endTime - startTime);

      this.log.field("duration", durStr).success(relPath, { label: "format" });

      return [filename, true];
    });
  }
}

module.exports = FormatLuaCommand;
