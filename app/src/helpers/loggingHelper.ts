import * as fs from 'fs';
import * as path from 'path';

import * as loglevel from 'loglevel';

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
          JSON.stringify(arg, null, 2)?.split('\n') ?? `${arg}`.split('\n');
        for (const line of lines) {
          fs.appendFileSync(
            LOG_FILENAME,
            `${new Date().getTime()} ${logLevelNames[level]} ${line}\n`,
          );
        }
      } catch {
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
