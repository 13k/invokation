import { ENV } from "./env";

export enum Level {
  Unknown = 0,
  Debug = 10,
  Info = 20,
  Warning = 30,
  Error = 40,
  Critical = 50,
}

export interface Options {
  level?: Level;
  name?: string;
}

// biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
export type LazyFn = () => any;

const MAX_LEVEL_NAME_LEN = Math.max(...Object.keys(Level).map((s) => s.length));

export class Logger {
  static LEVEL = Level;

  level: Level;
  #name: string | undefined;

  constructor(options: Options = {}) {
    this.level = options.level || (ENV.development ? Level.Debug : Level.Info);

    if (options.name) {
      this.#name = `[${options.name}]`;
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  log(level: Level, ...args: any[]): void {
    if (level < this.level || args.length < 1) {
      return;
    }

    const levelName = Level[level];
    // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
    let msgArgs: any[] = [levelName.padStart(MAX_LEVEL_NAME_LEN)];

    if (this.#name) {
      msgArgs.push(this.#name);
    }

    msgArgs = msgArgs
      .concat(args)
      .flatMap((arg) => [arg, " "])
      .slice(0, -1);

    $.Msg(...msgArgs);
  }

  logFn(level: Level, fn: LazyFn) {
    if (level < this.level) {
      return;
    }

    let values = fn();

    if (values == null) {
      return;
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    this.log(level, ...values);
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  unknown(...args: any[]) {
    this.log(Level.Unknown, ...args);
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  debug(...args: any[]) {
    this.log(Level.Debug, ...args);
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  info(...args: any[]) {
    this.log(Level.Info, ...args);
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  warning(...args: any[]) {
    this.log(Level.Warning, ...args);
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  error(...args: any[]) {
    this.log(Level.Error, ...args);
  }

  // biome-ignore lint/suspicious/noExplicitAny: passed to `$.Msg`
  critical(...args: any[]) {
    this.log(Level.Critical, ...args);
  }

  unknownFn(fn: LazyFn) {
    this.logFn(Level.Unknown, fn);
  }

  debugFn(fn: LazyFn) {
    this.logFn(Level.Debug, fn);
  }

  infoFn(fn: LazyFn) {
    this.logFn(Level.Info, fn);
  }

  warningFn(fn: LazyFn) {
    this.logFn(Level.Warning, fn);
  }

  errorFn(fn: LazyFn) {
    this.logFn(Level.Error, fn);
  }

  criticalFn(fn: LazyFn) {
    this.logFn(Level.Critical, fn);
  }
}
