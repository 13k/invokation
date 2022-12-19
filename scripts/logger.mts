import { inspect } from "node:util";

import _ from "lodash";
import type { TransformableInfo } from "logform";
import emoji from "node-emoji";
import { LEVEL, SPLAT } from "triple-beam";
import { config, createLogger, format, transports } from "winston";

import type { ColorStyle } from "./colors.mjs";
import { colorStyle } from "./colors.mjs";

type Levels = {
  [K in keyof config.CliConfigSetLevels as string extends K
    ? never
    : number extends K
    ? never
    : K]: config.CliConfigSetLevels[K];
};

type Level = keyof Levels;

export enum Option {
  Label = "label",
  Emojify = "emojify",
  Padding = "padding",
}

export interface Options {
  [Option.Label]?: string;
  [Option.Emojify]?: boolean;
  [Option.Padding]?: number;
}

export type Fields = Map<string, unknown>;
export const Fields: new (fields?: FieldsLike) => Fields = Map;
export type FieldsLike = Iterable<[string, unknown]>;

const LEVELS = config.cli.levels;
const LEVEL_COLORS = config.cli.colors;

const LEVEL_LENGTH = _.chain(LEVELS)
  .map((_v, k) => k.length + 1)
  .max()
  .value();

const LEVEL_PADDING = _.mapValues(LEVELS, (_v, k) => LEVEL_LENGTH - k.length);

export enum Label {
  Compile = "compile",
  Copy = "copy",
  Generate = "generate",
  Install = "install",
  Link = "link",
  Remove = "remove",
}

const LABEL_EMOJI: Record<string, string> = {
  [Label.Compile]: emoji.get("comet"),
  [Label.Copy]: emoji.get("cat2"),
  [Label.Generate]: emoji.get("broccoli"),
  [Label.Install]: emoji.get("teapot"),
  [Label.Link]: emoji.get("anchor"),
  [Label.Remove]: emoji.get("ghost"),
};

const LABEL_STYLES: Record<string, ColorStyle> = {
  [Label.Compile]: colorStyle(214),
  [Label.Copy]: colorStyle(142),
  [Label.Generate]: colorStyle(70),
  [Label.Install]: colorStyle(200),
  [Label.Link]: colorStyle(81),
  [Label.Remove]: colorStyle(160),
};

const LOG = createLogger({
  levels: LEVELS,
  format: format.combine(
    format.errors({ stack: true, cause: true }),
    format.metadata({ fillExcept: ["level", "message", ...Object.values(Option)] }),
    format.colorize({ level: true, message: false }),
    format.printf(printf)
  ),
  transports: [new transports.Console()],
});

export class Logger {
  #options: Options;
  #fields: Fields;

  constructor(options?: Options, fields?: FieldsLike) {
    this.#options = options || {};
    this.#fields = new Fields(fields);
  }

  #fork(options?: Options, fields?: FieldsLike): Logger {
    const log = new Logger();

    log.#addOptions(this.#options);
    log.#addFields(this.#fields);

    if (options) {
      log.#addOptions(options);
    }

    if (fields) {
      log.#addFields(fields);
    }

    return log;
  }

  #addOption<K extends keyof Options>(key: K, value: Options[K]): this {
    if (value != null) {
      this.#options[key] = value;
    }

    return this;
  }

  #addOptions(options: Options): this {
    _.each(Option, (k) => this.#addOption(k, options[k]));

    return this;
  }

  #addField(key: string, value: unknown): this {
    this.#fields.set(key, value);

    return this;
  }

  #addFields(fields: FieldsLike): this {
    for (const [k, v] of fields) {
      this.#addField(k, v);
    }

    return this;
  }

  set level(level: string) {
    LOG.level = level;
  }

  options(options: Options): Logger {
    return this.#fork(options);
  }

  label(value: string): Logger {
    return this.#fork({ [Option.Label]: value });
  }

  emojify(value = true): Logger {
    return this.#fork({ [Option.Emojify]: value });
  }

  padding(value: number): Logger {
    return this.#fork({ [Option.Padding]: value });
  }

  field(key: string, value: unknown): Logger {
    const log = this.#fork();

    log.#fields.set(key, value);

    return log;
  }

  fields(fields: FieldsLike | Record<string, unknown>): Logger {
    const it: FieldsLike =
      Symbol.iterator in fields ? (fields as FieldsLike) : Object.entries(fields);

    return this.#fork(undefined, it);
  }

  log(
    this: this,
    level: Level,
    message: string | Error,
    options?: Options,
    fields?: FieldsLike
  ): void {
    if (message instanceof Error) {
      LOG.log(level, message);
      return;
    }

    if (!_.isString(message)) {
      throw new Error(`Invalid Logger message: ${inspect(message)}`);
    }

    let log = this as Logger;

    if (options) {
      log = log.options(options);
    }

    if (fields) {
      log = log.fields(fields);
    }

    LOG.log(level, message, log.#options, log.#fields);
  }

  error(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("error", message, options, fields);
  }

  warn(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("warn", message, options, fields);
  }

  help(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("help", message, options, fields);
  }

  data(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("data", message, options, fields);
  }

  info(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("info", message, options, fields);
  }

  debug(message: string | Error, options?: Options, fields?: FieldsLike): void {
    this.log("debug", message, options, fields);
  }

  prompt(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("prompt", message, options, fields);
  }

  verbose(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("verbose", message, options, fields);
  }

  input(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("input", message, options, fields);
  }

  silly(message: string, options?: Options, fields?: FieldsLike): void {
    this.log("silly", message, options, fields);
  }
}

interface Info extends TransformableInfo {
  [LEVEL]: string;
  [SPLAT]: unknown[];

  metadata?: Metadata;
}

interface Metadata extends Record<string, unknown> {
  stack?: string;
  cause?: Error;
}

function printf(info: TransformableInfo) {
  const { level, levelOut, message, metadata, fields, options } = parseInfo(info as Info);
  const levelPad = " ".repeat(LEVEL_PADDING[level] || 1);
  const pad = " ".repeat(options[Option.Padding] || 0);
  const label = formatLabel(options[Option.Label]);
  const messageOut = formatMessage(message, options[Option.Emojify]);
  let fieldsOut = formatFields(level, fields);
  let body = formatBody(metadata);

  if (fieldsOut !== "") {
    fieldsOut = `  ${fieldsOut}`;
  }

  if (body) {
    body = `\n${body}`;
  }

  return `${levelOut}${levelPad}${pad}${label}${messageOut}${fieldsOut}${body}`;
}

function parseInfo(info: Info) {
  const { level: levelOut, message, metadata } = info;
  const level = info[LEVEL];
  const splat = info[SPLAT];

  let fields = new Fields();
  let options: Options = {};
  let last: unknown = _.last(splat);

  if (last instanceof Map) {
    fields = splat.pop() as Fields;
  }

  last = _.last(splat);

  if (_.isObject(last) && _.isPlainObject(last)) {
    options = splat.pop() as Options;
  }

  return { level, levelOut, message, metadata, fields, options };
}

function formatLabel(labelOpt?: string) {
  let label = "";

  if (labelOpt) {
    const emoji = LABEL_EMOJI[labelOpt];

    if (emoji) {
      label += `${emoji} `;
    }

    label += labelOpt;

    const style = LABEL_STYLES[labelOpt];

    if (style) {
      label = style(label);
    }

    label += "  ";
  }

  return label;
}

function formatMessage(message: unknown, emojify?: boolean) {
  let sMessage = _.toString(message);

  if (emojify) {
    sMessage = emoji.emojify(sMessage);
  }

  return sMessage;
}

function formatFields(level: string, fields: Fields) {
  let s = "";

  if (fields.size === 0) {
    return s;
  }

  const color = _.chain(LEVEL_COLORS[level]).castArray().get(0, "reset").value();
  const style = colorStyle(color);

  for (const [k, v] of fields) {
    s += `${style(k)}=${v} `;
  }

  return s.trimEnd();
}

function formatBody(metadata?: Metadata): string {
  let s = "";

  if (!metadata) {
    return s;
  }

  const { stack } = metadata;

  if (stack) {
    s += stack;
  }

  return s;
}

export default new Logger();
