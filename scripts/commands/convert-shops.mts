import assert from "node:assert";

import type { Command } from "commander";
import * as vdf from "vdf-parser";

import type { ConfigOptions } from "../config.mjs";
import { Label } from "../logger.mjs";
import Base from "./base.mjs";

export type Options = Record<string, never>;

interface GameShops {
  dota_shops: {
    [category: string]: {
      item: string[];
    };
  };
}

interface CustomGameShops {
  dota_shops: {
    [category: string]: Record<number, string>;
  };
}

const INVALID_ITEMS = [/item_river_paint/];

export default class ConvertShopsCommand extends Base<Options> {
  #input: string;
  #output: string;

  static subcommand(parent: Command, configOptions: ConfigOptions) {
    const command = parent
      .command("convert-shops")
      .description(`Convert a game KeyValues shops.txt file to custom game KeyValues shops.txt`)
      .argument("<input>", `Path to shops.txt file (extracted from game files)`)
      .argument("<output>", `Path to converted shops.txt`)
      .action(
        async (input: string, output: string) =>
          await new ConvertShopsCommand(input, output, command.opts(), configOptions).run()
      );
  }

  constructor(input: string, output: string, options: Options, configOptions: ConfigOptions) {
    super([input, output], options, configOptions);

    this.#input = input;
    this.#output = output;
  }

  override async run() {
    const data = await this.readFile(this.#input);
    const gameShops = vdf.parse(data) as GameShops;

    validate(this.#input, gameShops);

    const customGameShops = transform(gameShops);
    const serialized = vdf.stringify(customGameShops, true);

    await this.writeFile(this.#output, serialized);

    this.log
      .label(Label.Generate)
      .field("input", this.#input)
      .field("output", this.#output)
      .info("shops converted");
  }
}

const isInvalidItem = (item: string) => INVALID_ITEMS.find((re) => item.match(re) != null) != null;

function validate(filename: string, doc: GameShops) {
  const message = (msg: string) => `${filename}: not a valid shops.txt file: ${msg}`;

  assert(typeof doc === "object", message(`document is not an object`));
  assert("dota_shops" in doc, message(`missing top-level 'dota_shops' key`));

  const shops = doc["dota_shops"];

  assert(typeof shops === "object", message(`entry 'dota_shops' is not an object`));
  assert(shops != null, message(`top-level 'dota_shops' key has null value`));

  for (const [category, items] of Object.entries(shops)) {
    assert(typeof items === "object", message(`category ${category} is not an object`));
    assert(items != null, message(`category ${category} has null value`));
    assert("item" in items, message(`category ${category} has no 'item' entry`));

    const list = items["item"];

    assert(Array.isArray(list), message(`entry 'item' in category ${category} is not an array`));
  }
}

function transform(doc: GameShops) {
  const result: CustomGameShops = { dota_shops: {} };
  const { dota_shops: shops } = result;

  for (const [categoryName, items] of Object.entries(doc["dota_shops"])) {
    const category: Record<number, string> = {};

    for (const [i, item] of items.item.entries()) {
      if (isInvalidItem(item)) continue;

      category[i + 1] = item;
    }

    shops[categoryName] = category;
  }

  return result;
}
