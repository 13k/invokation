/// <reference path="./vendor/lodash.js" />
/// <reference path="./static.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace Logger {
    const {
      Static: { ENV },
    } = invk;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type LazyFn = () => any;

    const MAX_LEVEL_NAME_LEN = _.maxBy(_.keys(Level), "length")?.length || 1;

    export class Logger {
      static Level = Level;

      public level: Level = Level.Info;
      private name?: string;

      constructor(options: Options = {}) {
        this.level = options.level || (ENV.development ? Level.Debug : Level.Info);

        if (options.name) {
          this.name = `[${options.name}]`;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      log(level: Level, ...args: any[]) {
        if (level < this.level || args.length < 1) return;

        const name = Level[level];
        let msgArgs = _.chain([_.padStart(name, MAX_LEVEL_NAME_LEN)]);

        if (this.name) {
          msgArgs = msgArgs.push(this.name);
        }

        msgArgs = msgArgs
          .concat(args)
          .flatMap((arg) => [arg, " "])
          .dropRight();

        $.Msg(...msgArgs.value());
      }

      logFn(level: Level, fn: LazyFn) {
        if (level < this.level) return;

        let values = fn();

        if (values == null) return;

        if (!_.isArray(values)) {
          values = [values];
        }

        this.log(level, ...values);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unknown(...args: any[]) {
        this.log(Level.Unknown, ...args);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debug(...args: any[]) {
        this.log(Level.Debug, ...args);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      info(...args: any[]) {
        this.log(Level.Info, ...args);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      warning(...args: any[]) {
        this.log(Level.Warning, ...args);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error(...args: any[]) {
        this.log(Level.Error, ...args);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }
}
