// TODO: remove this file and use quiet mode of new version of electron packager
import log = require('loglevel');

export class PackagerConsole {
  private logs: any[];

  private consoleError: any;

  constructor() {
    this.logs = [];
  }

  // eslint-disable-next-line no-underscore-dangle
  _log(...messages): void {
    this.logs.push(...messages);
  }

  override(): void {
    this.consoleError = log.error;

    // need to bind because somehow when _log() is called this refers to console
    // eslint-disable-next-line no-underscore-dangle
    log.error = this._log.bind(this);
  }

  restore(): void {
    log.error = this.consoleError;
  }

  playback(): void {
    log.info(this.logs.join(' '));
  }
}
