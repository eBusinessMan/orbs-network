import * as uncaughtHandler from "uncaught-exception";
import * as os from "os";
import { logger } from "./logger";

export type Callback = (callback?: any) => void;

export class ErrorHandler {
  public static setup(abortOnUncaught: boolean = false, gracefulShutdown?: Callback) {
    const onError = uncaughtHandler({
      logger: {
        fatal: function fatal(message, meta, callback) {
          logger.error(message, meta.error);
          logger.error(meta.error.stack);

          callback();
        },
      },
      statsd: {
        // TODO: add stats support.
        immediateIncrement: (key, count, callback) => {
          callback();
        },
      },
      meta: {
        hostname: os.hostname()
      },
      abortOnUncaught: abortOnUncaught,
      gracefulShutdown: function (callback) {
        gracefulShutdown ? gracefulShutdown(callback) : callback();
      }
    });

    process.on("uncaughtException", onError);

    process.on("unhandledRejection", (err: Error) => {
      logger.error(`Unhandled rejection: ${err}\n${err.stack}`);
    });
  }
}