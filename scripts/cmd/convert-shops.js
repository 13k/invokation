const assert = require("assert");

const fse = require("fs-extra");
const vdf = require("vdf-parser");

class ConvertShopsCommand {
  static cliOptions(/* config */) {
    return {
      usage: "convert-shops <input> <output>",
      description: [
        "Convert a game shops.txt input file to custom game shops.txt",
        {
          input: "A game shops.txt input file",
          output: "A custom game shops.txt output file",
        },
      ],
    };
  }

  constructor([input, output], _options, { log }) {
    this.input = input;
    this.output = output;
    this.log = log;
  }

  async run() {
    const doc = await this.parse();

    this.validate(doc);

    await this.write(this.transform(doc));

    this.log.fields("input", this.input, "output", this.output).info("converted");

    return { input: this.input, output: this.output };
  }

  async parse() {
    const data = await fse.readFile(this.input, { encoding: "utf-8" });

    return vdf.parse(data);
  }

  async write(doc) {
    const data = vdf.stringify(doc, true);

    return fse.outputFile(this.output, data, { encoding: "utf-8" });
  }

  validate(doc) {
    const message = (msg) => `${this.input}: not a valid shops.txt file: ${msg}`;

    assert(typeof doc === "object", message(`document is not an object`));

    const shops = doc["dota_shops"];

    assert(shops != null, message(`missing top-level 'dota_shops' key`));
    assert(typeof shops === "object", message(`entry 'dota_shops' is not an object`));

    for (const [category, items] of Object.entries(shops)) {
      assert(typeof items === "object", message(`category ${category} is not an object`));

      const list = items["item"];

      assert(list != null, message(`category ${category} has not 'item' entry`));
      assert(
        list instanceof Array,
        message(`entry 'item' in category ${category} is not an array`)
      );
    }
  }

  transform(doc) {
    const shops = {};
    const result = { dota_shops: shops };

    for (const [category, items] of Object.entries(doc["dota_shops"])) {
      const resCategory = {};

      for (const [i, item] of items.item.entries()) {
        if (item.match(/item_river_painter/)) continue;

        resCategory[i + 1] = item;
      }

      shops[category] = resCategory;
    }

    return result;
  }
}

module.exports = ConvertShopsCommand;
