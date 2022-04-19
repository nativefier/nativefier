// This helper allows logs to either be printed to the console as they would normally or if
// the USE_LOG_FILE environment variable is set (such as through our playwright tests), then
// the logs can be diverted from the command line to a log file, so that they can be displayed
// later (such as at the end of a playwright test run to help diagnose potential failures).
// Use this instead of loglevel whenever logging messages inside the app.

import * as fs from 'fs';
import * as path from 'path';

import loglevel from 'loglevel';

import { safeGetEnv } from './playwrightHelpers';

const USE_LOG_FILE = safeGetEnv('USE_LOG_FILE') === '1';
const LOG_FILE_DIR = safeGetEnv('LOG_FILE_DIR') ?? process.cwd();
const LOG_FILENAME = path.join(LOG_FILE_DIR, `${new Date().getTime()}.log`);

const logLevelNames = ['TRACE', 'DEBUG', 'INFO ', 'WARN ', 'ERROR'];

function _logger(
  logFunc: (...args: unknown[]) => void,
  level: loglevel.LogLevelNumbers,
  ...args: unknown[]
): void {
  if (USE_LOG_FILE && loglevel.getLevel() >= level) {
    for (const arg of args) {
      try {
        const lines =
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          JSON.stringify(arg, null, 2)?.split('\n') ?? `${arg}`.split('\n');
        for (const line of lines) {
          fs.appendFileSync(
            LOG_FILENAME,
            `${new Date().getTime()} ${logLevelNames[level]} ${line}\n`,
          );
        }
      } catch {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        fs.appendFileSync(LOG_FILENAME, `${logLevelNames[level]} ${arg}\n`);
      }
    }
  } else {
    logFunc(...args);
  }
}

export function debug(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  _logger(loglevel.debug, loglevel.levels.DEBUG, ...args);
}

export function error(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  _logger(loglevel.error, loglevel.levels.ERROR, ...args);
}

export function info(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  _logger(loglevel.info, loglevel.levels.INFO, ...args);
}

export function log(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  _logger(loglevel.info, loglevel.levels.INFO, ...args);
}

export function setLevel(
  level: loglevel.LogLevelDesc,
  persist?: boolean,
): void {
  loglevel.setLevel(level, persist);
}

export function trace(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  _logger(loglevel.trace, loglevel.levels.TRACE, ...args);
}

export function warn(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  _logger(loglevel.warn, loglevel.levels.WARN, ...args);
}
