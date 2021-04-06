const fse = require("fs-extra");
const safeParser = require("postcss-safe-parser");
const valueParser = require("postcss-value-parser");

const Reference = require("./reference");

const identity = (x) => x;
const isDefineAtRuleNode = (node) => node.type === "atrule" && node.name === "define";
const isDeclNode = (node) => node.type === "decl";
const isUrlFnNode = (node) => node.type === "function" && node.value === "url";
const isStrNode = (node) => node.type === "string";

class CSSManifest {
  constructor(filename, { log }) {
    this.filename = filename;
    this.log = log;
  }

  async parse() {
    const data = await fse.readFile(this.filename, { encoding: "utf-8" });
    const ast = safeParser(data);

    return ast.nodes
      .map(this._parseDefineAtRule.bind(this))
      .filter(identity)
      .map((decl) => this._parseUrlValue(decl.value))
      .filter(identity);
  }

  _parseDefineAtRule(node) {
    if (!isDefineAtRuleNode(node) || !node.params) return null;

    const ast = safeParser(node.params);

    if (ast.nodes.length !== 1) return null;

    const declNode = ast.first;

    if (!isDeclNode(declNode)) return null;

    return declNode;
  }

  _parseUrlValue(value) {
    const ast = valueParser(value);

    if (ast.nodes.length !== 1) return null;

    const fnNode = ast.nodes[0];

    if (!isUrlFnNode(fnNode)) return null;

    if (fnNode.nodes.length !== 1) return null;

    const strNode = fnNode.nodes[0];

    if (!isStrNode(strNode)) return null;

    return new Reference(strNode.value);
  }
}

module.exports = CSSManifest;
