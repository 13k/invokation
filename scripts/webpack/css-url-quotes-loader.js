"use strict";

const { promisify } = require("util");

const postcss = require("postcss");
const postcssUrl = require("postcss-url");

async function pitch(request) {
  const callback = this.async();
  const publicPath = this._compilation.outputOptions.publicPath;
  const importModule = promisify(this.importModule);

  let originalExports;

  try {
    originalExports = await importModule(
      `${this.resourcePath}.webpack[javascript/auto]!=!${request}`,
      { publicPath }
    );
  } catch (err) {
    callback(err);
    return;
  }

  const exports = originalExports.__esModule ? originalExports.default : originalExports;

  const result = Array.isArray(exports)
    ? await Promise.all(exports.map(transformExport({ publicPath })))
    : exports;

  const resultSource = `export default ${JSON.stringify(result)}`;

  callback(null, resultSource);
}

const transformExport = ({ publicPath }) => async ([id, content, media, sourceMap]) => {
  const plugins = [postcssUrl({ url: transformUrl({ publicPath }) })];

  const options = {
    from: id,
    map: {
      absolute: true,
      inline: false,
      prev: sourceMap,
    },
  };

  const result = await postcss(plugins).process(content, options);

  return [id, result.css, media, result.map.toJSON()];
};

const transformUrl = ({ publicPath }) => (asset) =>
  asset.url.startsWith(publicPath) ? `'${asset.url}'` : asset.url;

module.exports = { pitch };
