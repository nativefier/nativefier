// TODO: remove this file and use quiet mode of new version of electron packager
const log = require('loglevel');

class PackagerConsole {
  constructor() {
    this.logs = [];
  }

  _log(...messages) {
    this.logs.push(...messages);
  }

  override() {
    this.consoleError = log.error;

    // need to bind because somehow when _log() is called this refers to console
    // eslint-disable-next-line no-underscore-dangle
    log.error = this._log.bind(this);
  }

  restore() {
    log.error = this.consoleError;
  }

  playback() {
    log.log(this.logs.join(' '));
  }
}

export default PackagerConsole;
