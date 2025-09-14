import assert from "node:assert";

import type { Command } from "commander";
import vdf from "vdf-parser";

import { Label } from "../../logger";
import { Path } from "../../path";
import { BaseCommand } from "../base";

export interface Args {
  input: Path;
  output: Path;
}

export interface Options {
  module: boolean;
}

enum Kind {
  Abilities = "DOTAAbilities",
  Heroes = "DOTAHeroes",
}

interface KeyValues {
  [key: string]: boolean | number | string | KeyValues;
}

interface AbilitiesKeyValues {
  [Kind.Abilities]: KeyValues;
}

interface HeroesKeyValues {
  [Kind.Heroes]: KeyValues;
}

type KeyValuesDoc = AbilitiesKeyValues & HeroesKeyValues;

export class KeyValuesCommand extends BaseCommand<Args, Options> {
  override subcommand(parent: Command): Command {
    return parent
      .command("keyvalues")
      .alias("kv")
      .description(
        "\
Parse and convert a KeyValues file \
(abilities, heroes or items) to a Lua file \
        ",
      )
      .option("-m, --module", "Generate a Lua module file", true)
      .argument("<input>", "Input path")
      .argument("<output>", "Output path");
  }

  override parseArgs(input: string, output: string): Args {
    return {
      input: Path.new(input),
      output: Path.new(output),
    };
  }

  override async run(): Promise<void> {
    await this.generateOutputFile();
    await this.formatOutputFile();

    this.log
      .label(Label.Generate)
      .fields({ ...this.args })
      .info("abilities KeyValues");
  }

  async generateOutputFile(): Promise<void> {
    const data = await this.args.input.readFile();
    const doc: KeyValuesDoc = vdf.parse(data, {
      types: true,
      arrayify: true,
    });

    const kind = this.validate(doc);
    const serializer = new Serializer(doc[kind], { module: this.options.module });
    const serialized = serializer.serialize();

    await this.args.output.writeFile(serialized);
  }

  async formatOutputFile(): Promise<void> {
    const cmd = this.executable("stylua");

    if (cmd == null) {
      return;
    }

    const args = [
      "--line-endings",
      "Unix",
      "--column-width",
      "100",
      "--indent-type",
      "Spaces",
      "--indent-width",
      "2",
      "--quote-style",
      "AutoPreferDouble",
      this.args.output,
    ];

    this.exec(cmd, args, {
      echo: true,
    });
  }

  validate(doc: unknown): Kind {
    const message = (msg: string) => `${this.args.input}: cannot parse KeyValues file: ${msg}`;

    assert(doc != null, message("document is null"));
    assert(typeof doc === "object", message("document is not an object"));

    let kind: Kind | undefined;

    for (const key of Object.values(Kind)) {
      if (key in doc) {
        kind = key;
        break;
      }
    }

    assert(kind != null, message(`missing any of the root keys: '${Object.values(Kind)}'`));

    return kind;
  }
}

class Serializer {
  static LUA_INDENT = "  ";

  #kv: KeyValues;
  #options: { module: boolean };
  #level = 0;

  constructor(kv: KeyValues, options: { module: boolean } = { module: true }) {
    this.#kv = kv;
    this.#options = options;
  }

  serialize(): string {
    let out = this.#serialize(this.#kv);

    if (this.#options.module) {
      out = this.indentLines(out);
      out = `local M = ${out}\n\nreturn M\n`;
    }

    return out;
  }

  #serialize(kv: KeyValues): string {
    let out = "";

    const write = (s: string) => {
      out += s;
    };

    write("{\n");

    for (const [key, value] of Object.entries(kv)) {
      if (this.#level === 0 && key === "Version") {
        continue;
      }

      this.#level++;

      write(`${this.indent()}["${key}"] = `);

      switch (typeof value) {
        case "boolean": {
          write(`${value},\n`);
          break;
        }
        case "number": {
          write(`${value},\n`);
          break;
        }
        case "string": {
          write(`"${value}",\n`);
          break;
        }
        case "object": {
          write(this.#serialize(value));
          break;
        }
        default:
          throw new Error(`unknown KeyValues value type ${typeof value} for key ${key}`);
      }

      this.#level--;
    }

    write(`${this.indent()}}`);

    if (this.#level === 0) {
      write("\n");
    } else {
      write(",\n");
    }

    return out;
  }

  indent(): string {
    return Serializer.LUA_INDENT.repeat(this.#level);
  }

  indentLines(text: string): string {
    const indented = text.replaceAll("\n", `\n${Serializer.LUA_INDENT}`);

    return `${Serializer.LUA_INDENT}${indented}`;
  }
}
