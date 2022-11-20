const chalk = require("chalk");
const emoji = require("node-emoji");

const { createEnum } = require("./util.cjs");

const chalkOptions = chalk.supportsColor ? { level: chalk.supportsColor.level } : { level: 0 };
const chalkInstance = new chalk.Instance(chalkOptions);

const Level = createEnum({
  Debug: 1,
  Info: 2,
  Success: 3,
  Warn: 4,
  Error: 5,
  Fatal: 6,
});

const levelEmojis = new Map([
  [Level.Debug, "black_medium_small_square"],
  [Level.Info, "information_source"],
  [Level.Success, "heavy_check_mark"],
  [Level.Warn, "warning"],
  [Level.Error, "x"],
  [Level.Fatal, "skull_and_crossbones"],
]);

const levelColors = new Map([
  [Level.Debug, 240],
  [Level.Info, 111],
  [Level.Success, 70],
  [Level.Warn, 172],
  [Level.Error, 168],
  [Level.Fatal, 160],
]);

function emojize(id) {
  if (!id) return "";

  return emoji.get(id);
}

function colorize(color, text) {
  if (!color) return text;

  const fn =
    typeof color === `number`
      ? chalkInstance.ansi256(color)
      : color.startsWith(`#`)
      ? chalkInstance.hex(color)
      : chalkInstance[color];

  if (fn == null) throw Error(`Invalid Logger color '${color}'`);

  return fn(text);
}

class Logger {
  static Level = Level;

  static parseLevel(level) {
    switch (typeof level) {
      case "string":
        level = level.toLowerCase().replace(/^(\w)/, (ch) => ch.toUpperCase());
        return Level[level] || 0;
      case "number":
        return Level[level] ? level : 0;
      default:
        return 0;
    }
  }

  #_level;
  #_fields;

  constructor(level = Level.Info, fields = new Map()) {
    this.level = level;
    this.#_fields = this._parseFields(fields);
  }

  get level() {
    return this.#_level;
  }

  set level(level) {
    this.#_level = Logger.parseLevel(level);
  }

  _copy(fields) {
    return new Logger(this.level, this._mergeFields(this.#_fields, fields));
  }

  field(key, value) {
    return this._copy(new Map([[key, value]]));
  }

  fields(...fields) {
    if (fields.length === 0) return this.#_fields;

    fields = this._parseFields(fields);

    return this._copy(fields);
  }

  log(level, msg = null, { emoji, color, label } = {}) {
    level = Logger.parseLevel(level);

    if (level < this.level) return;

    const [message, extra] = this._formatMessage(msg);

    if (typeof emoji === `undefined`) emoji = levelEmojis.get(level);
    if (typeof color === `undefined`) color = levelColors.get(level);
    if (typeof label === `undefined`) label = Level[level].toLowerCase();

    const args = [];

    if (typeof emoji === `string`) args.push(emojize(emoji));
    if (typeof label === `string`) args.push(colorize(color, label.padStart(8)));
    if (typeof message === `string`) args.push(message);

    const formattedFields = this._formatFields(color);

    if (formattedFields != null) args.push(formattedFields);

    this._print(level, ...args);

    if (extra != null) this._print(level, extra);
  }

  debug(...args) {
    this.log(Level.Debug, ...args);
  }

  info(...args) {
    this.log(Level.Info, ...args);
  }

  success(...args) {
    this.log(Level.Success, ...args);
  }

  warn(...args) {
    this.log(Level.Warn, ...args);
  }

  error(...args) {
    this.log(Level.Error, ...args);
  }

  fatal(...args) {
    this.log(Level.Fatal, ...args);
  }

  _print(level, ...args) {
    let printFn = console.log;

    switch (level) {
      case Level.Debug:
        printFn = console.debug;
        break;
      case Level.Info:
        printFn = console.info;
        break;
      case Level.Success:
        printFn = console.info;
        break;
      case Level.Warn:
        printFn = console.warn;
        break;
      case Level.Error:
        printFn = console.error;
        break;
      case Level.Fatal:
        printFn = console.error;
        break;
    }

    printFn(...args);
  }

  _formatMessage(msg) {
    if (msg == null) return [];
    if (msg instanceof Error) return [msg.message, msg];

    return [msg];
  }

  _parseFields(fields) {
    if (fields instanceof Map) return fields;

    const parsed = new Map();

    if (fields instanceof Array) {
      if (fields.length % 2 !== 0) {
        throw Error(
          "Logger fields in Array form must be a flat list of key followed by value entries"
        );
      }

      for (let i = 0; i < fields.length; i += 2) {
        parsed.set(fields[i], fields[i + 1]);
      }
    }

    return parsed;
  }

  _formatFields(color) {
    if (this.#_fields.size === 0) return null;

    const parts = [];

    for (const [key, value] of this.#_fields) {
      parts.push(`${colorize(color, key)}=${value.toString()}`);
    }

    return parts.join(" ");
  }

  _mergeFields(...fieldMaps) {
    const fields = new Map();

    fieldMaps.forEach((fieldMap) => {
      for (const [key, value] of fieldMap) {
        fields.set(key, value);
      }
    });

    return fields;
  }
}

module.exports = {
  Logger,
};
