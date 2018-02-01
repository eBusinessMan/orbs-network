import * as uncaughtHandler from "uncaught-exception";
import * as os from "os";
import { logger } from "./logger";
import { config } from "./config";
import { Raven } from "raven";
export type Callback = (callback?: any) => void;

const { NODE_NAME, NODE_IP, NODE_ENV, SERVICE_NAME } = process.env;

const SENTRY_CONFIG_API_KEY = "logger:sentry:apiKey";
const SETNRY_CONFIG_ENABLED_KEY = "logger:sentry:enabled";
const SENTRY_ENABLED = config.get(SETNRY_CONFIG_ENABLED_KEY);

const Raven = require('raven');

if (SENTRY_ENABLED) {
  Raven.config(config.get(SENTRY_CONFIG_API_KEY));

  Raven.context({
    extra: {
      node: NODE_NAME,
      node_ip: NODE_IP,
      environment: NODE_ENV
    }
  })
}

export class ErrorHandler {
  public static setup(abortOnUncaught: boolean = false, gracefulShutdown?: Callback) {
    const onError = uncaughtHandler({
      logger: {
        fatal: function fatal(message, meta, callback) {
          logger.error(message, meta.error);
          logger.error(meta.error.stack);

          if (SENTRY_ENABLED) {
            Raven.captureException();
          }

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
