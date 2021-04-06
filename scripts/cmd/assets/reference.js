const path = require("path");

const picomatch = require("picomatch");

const ASSET_DIRS = ["images", "layout", "scripts", "style"];
const GAME_ASSETS_BASE_DIR = "game";

const gameAssetFnmatch = picomatch(`{${ASSET_DIRS.join(",")}}/${GAME_ASSETS_BASE_DIR}/**`);

class Reference {
  constructor(uri) {
    this.uri = uri;
    this.url = new URL(this.uri);

    this._path = undefined;
    this._gamePath = undefined;
  }

  get isFile() {
    return this.url.protocol === "file:";
  }

  get isResource() {
    return this.url.hostname === "{resources}";
  }

  get path() {
    if (this._path === undefined) {
      this._path = this.url.pathname.slice(1);
    }

    return this._path;
  }

  get isGameAsset() {
    return gameAssetFnmatch(this.path);
  }

  get gamePath() {
    if (this._gamePath === undefined) {
      if (!this.isFile || !this.isResource || !this.isGameAsset) {
        this._gamePath = null;
      } else {
        const segments = this.path.split(path.sep);

        this._gamePath = [segments[0], ...segments.slice(2)].join(path.sep);
      }
    }

    return this._gamePath;
  }
}

module.exports = Reference;
