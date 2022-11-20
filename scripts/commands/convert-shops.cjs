const assert = require("assert");
const fs = require("fs");
const vdf = require("vdf-parser");

function validate(filename, doc) {
  const message = (msg) => `${filename}: not a valid shops.txt file: ${msg}`;

  assert(typeof doc === "object", message(`document is not an object`));

  const shops = doc["dota_shops"];

  assert(shops != null, message(`missing top-level 'dota_shops' key`));
  assert(typeof shops === "object", message(`entry 'dota_shops' is not an object`));

  for (const [category, items] of Object.entries(shops)) {
    assert(typeof items === "object", message(`category ${category} is not an object`));

    const list = items["item"];

    assert(list != null, message(`category ${category} has not 'item' entry`));
    assert(list instanceof Array, message(`entry 'item' in category ${category} is not an array`));
  }
}

function transform(doc) {
  const shops = {};
  const res = { dota_shops: shops };

  for (const [category, items] of Object.entries(doc["dota_shops"])) {
    const resCategory = {};

    for (const [i, item] of items.item.entries()) {
      if (item.match(/item_river_painter/)) continue;

      resCategory[i + 1] = item;
    }

    shops[category] = resCategory;
  }

  return res;
}

async function convert(input, output, { log }) {
  const data = fs.readFileSync(input, { encoding: "utf-8" });
  const doc = vdf.parse(data);

  validate(input, doc);

  const transformed = transform(doc);
  const transformedData = vdf.stringify(transformed, true);

  fs.writeFileSync(output, transformedData, { encoding: "utf-8" });

  log.field("output", output).info("converted");
}

module.exports = (input, output, _, config) => convert(input, output, config);
