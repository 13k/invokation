const path = require("path");
const { inspect } = require("util");

const fse = require("fs-extra");

const CSSManifest = require("./assets/css_manifest");

class AssetsCommand {
  static cliOptions(config) {
    const srcPanoramaPath = path.join(config.sources.contentPath, "panorama");

    return {
      usage: "assets <inputDir> <manifests...>",
      description: [
        "Import game assets referenced in the given manifests",
        {
          inputDir: "Game assets directory",
          manifests: "List of manifest files",
        },
      ],
      options: [
        {
          flags: "-o, --output-dir <outputDir>",
          description: "Output directory",
          default: srcPanoramaPath,
        },
        {
          flags: "-n, --noop",
          description: "Only print paths that would be imported",
          default: false,
        },
      ],
    };
  }

  constructor([inputDir, manifests], { outputDir, noop }, { log, ...config }) {
    this.log = log;
    this.inputDir = inputDir;
    this.outputDir = outputDir || path.join(config.sources.contentPath, "panorama");
    this.manifests = manifests;
    this.noop = noop;
    this.config = config;
  }

  run() {
    this.log
      .fields(
        "inputDir",
        this.inputDir,
        "outputDir",
        this.outputDir,
        "manifests",
        inspect(this.manifests)
      )
      .debug("command start", { label: "assets", color: "magenta" });

    const promises = this.manifests.map(this.processManifest.bind(this));

    return Promise.all(promises);
  }

  async processManifest(manifest) {
    const log = this.log.field("manifest", manifest);

    log.info("processing manifest");

    let Parser;

    switch (path.extname(manifest)) {
      case ".css":
        Parser = CSSManifest;
        break;
      default:
        throw Error(`${manifest}: Unknown manifest type`);
    }

    const parser = new Parser(manifest, { log });
    const refs = await parser.parse();

    log.field("count", refs.length).info("parsed references");

    const promises = refs.map(this.processRef.bind(this));

    return Promise.all(promises);
  }

  processRef(ref) {
    if (!ref.gamePath) {
      this.log.field("ref", ref.uri).warn("ignoring non-game asset reference", { label: "skip" });

      return null;
    }

    const paths = this.resolveRef(ref);

    return this.importAsset(paths);
  }

  resolveRef(ref) {
    const src = path.join(this.inputDir, ref.gamePath);
    const dest = path.join(this.outputDir, ref.path);

    return { src, dest };
  }

  async importAsset({ src, dest }) {
    if (this.noop) {
      this.log.info(`${src} -> ${dest}`, { label: "noop", color: "cyan" });

      return { src, dest };
    }

    let srcSt, destSt;

    try {
      srcSt = await fse.stat(src);
    } catch (err) {
      if (err.code === "ENOENT") {
        this.log.field("asset", src).error("game asset not found");
      }

      throw err;
    }

    if (!srcSt.isFile()) {
      throw Error(`${src}: is not a file`);
    }

    try {
      destSt = await fse.stat(dest);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;

      destSt = null;
    }

    const destRelPath = path.relative(this.config.rootPath, dest);
    const logMsg = `${src} -> ${destRelPath}`;
    let logOpts;
    let copy = false;

    if (!destSt) {
      copy = true;
      logOpts = { label: "copy", color: "green" };
    } else if (destSt.mtimeMs < srcSt.mtimeMs) {
      copy = true;
      logOpts = { label: "update", color: "blue" };
    } else {
      logOpts = { label: "keep", color: "magenta" };
    }

    if (copy) {
      await fse.copy(src, dest);
    }

    this.log.success(logMsg, logOpts);

    return { src, dest };
  }
}

module.exports = AssetsCommand;
