class PackagerConsole {

    constructor() {
        this.logs = [];
    }

    _log(...messages) {
        this.logs.push(...messages);
    }

    override() {
        this.consoleError = console.error;

        // need to bind because somehow when _log() is called this refers to console
        console.error = this._log.bind(this);
    }

    restore() {
        console.error = this.consoleError;
    }

    playback() {
        console.log(this.logs.join(' '));
    }
}

export default PackagerConsole;
