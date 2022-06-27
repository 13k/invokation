const path = require("path");
const globby = require("globby");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");

/** @typedef {import('webpack').Configuration} WebpackConfiguration */
/** @typedef {import('../config')} CustomGameConfiguration */

/**
 * @param {string} ctxPath
 * @returns {Promise<Record<string, string>>}
 */
async function createEntryPoints(ctxPath) {
  const components = await globby(path.join(ctxPath, "**", "*.vue"));
  /** @type {Record<string, string>} */
  const entries = {};

  return components.reduce((result, file) => {
    const relPath = path.relative(ctxPath, file);
    const filename = path.parse(relPath);
    const entryName = path.join(filename.dir, filename.name);

    result[entryName] = `./${relPath}`;

    return result;
  }, entries);
}

/**
 * @param {CustomGameConfiguration} customGameConfig
 * @returns {Promise<WebpackConfiguration>}
 */
async function createWebpackConfig(customGameConfig) {
  const context = path.resolve(customGameConfig.sources.contentPath, "panorama");
  const outputPath = path.resolve(customGameConfig.buildPath, "content", "panorama");
  const entry = await createEntryPoints(context);

  console.log(entry);

  /** @type {WebpackConfiguration} */
  const config = {
    mode: "development",
    entry,
    context,
    target: "es2017",
    devtool: false,
    output: {
      path: outputPath,
      publicPath: "file://{resources}/",
      chunkFormat: "array-push",
    },
    resolve: {
      extensions: [".ts"],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({ experimentalUseImportModule: true }),
    ],
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: "vue-loader",
        },
        {
          test: /\.xml$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[path][name].xml",
              },
            },
          ],
          // type: "asset/resource",
          // generator: {
          //   filename: "[path][name].xml",
          // },
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                appendTsSuffixTo: [/\.vue$/],
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, { loader: "css-loader" }],
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve("./css-url-quotes-loader"),
            },
            {
              loader: "css-loader",
              options: {
                modules: false,
                sourceMap: true,
              },
            },
            {
              loader: "resolve-url-loader",
              options: { sourceMap: true },
            },
            {
              loader: "sass-loader",
              options: { sourceMap: true },
            },
          ],
        },
        {
          test: /\.(png|jpe?g)$/,
          type: "asset/resource",
          generator: {
            filename: "[path][name][ext]",
          },
        },
      ],
    },
  };

  return config;
}

module.exports = createWebpackConfig;
