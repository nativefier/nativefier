var fs = require('fs');
var path = require('path');

export default {
    _loadScripts: function () {
        var scriptDir = path.join(__dirname, '../scripts');
        if (!fs.existsSync(scriptDir)) {
            console.warn('Unable to load scripts');
            return null;
        }

        return fs.readdirSync(scriptDir).map(function (file) {
            return require(path.join(scriptDir, file))
        })
    },
    // Might be better to pass in an arg object and let scripts check props themselves
    // if there are more args than this
    runAll: function (document, event) {
        var scripts = this._loadScripts();
        if (scripts && scripts.length > 0) {
            scripts.forEach(function (script) {
                script.call(null, document, event)
            })
        }
    }
};
