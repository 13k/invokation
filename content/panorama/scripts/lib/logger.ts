import { maxBy, padStart } from "lodash";

export enum LogLevel {
  UNKNOWN = 0,
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50,
}

const MAX_LEVEL_NAME_LEN = maxBy(Object.keys(LogLevel), "length")?.length || 10;

interface LoggerOptions {
  level?: LogLevel;
  progname?: string;
}

export type LogFn = () => unknown[] | null;

export class Logger {
  level: LogLevel;
  progname?: string;

  constructor({ level = LogLevel.INFO, progname }: LoggerOptions) {
    this.level = level;
    this.progname = progname && `[${progname}]`;
  }

  log(level: LogLevel, ...args: unknown[]): void {
    if (level < this.level || args.length === 0) {
      return;
    }

    const name = LogLevel[level];
    let msgArgs: unknown[] = [padStart(name, MAX_LEVEL_NAME_LEN)];

    if (this.progname) {
      msgArgs.push(this.progname);
    }

    msgArgs = msgArgs.concat(args).flatMap((arg) => [arg, " "]);

    if (level < LogLevel.WARNING) {
      $.Msg(...msgArgs);
    } else {
      $.Warning(...msgArgs);
    }
  }

  logFn(level: LogLevel, fn: LogFn): void {
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

  debug(...args: unknown[]): void {
    this.log(LogLevel.DEBUG, ...args);
  }

  debugFn(fn: LogFn): void {
    this.logFn(LogLevel.DEBUG, fn);
  }

  info(...args: unknown[]): void {
    this.log(LogLevel.INFO, ...args);
  }

  infoFn(fn: LogFn): void {
    this.logFn(LogLevel.INFO, fn);
  }

  warn(...args: unknown[]): void {
    this.log(LogLevel.WARNING, ...args);
  }

  warnFn(fn: LogFn): void {
    this.logFn(LogLevel.WARNING, fn);
  }

  error(...args: unknown[]): void {
    this.log(LogLevel.ERROR, ...args);
  }

  errorFn(fn: LogFn): void {
    this.logFn(LogLevel.ERROR, fn);
  }

  critical(...args: unknown[]): void {
    this.log(LogLevel.CRITICAL, ...args);
  }

  criticalFn(fn: LogFn): void {
    this.logFn(LogLevel.CRITICAL, fn);
  }
}
