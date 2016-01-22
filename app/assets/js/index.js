/**
 * Created by JiaHao on 5/7/15.
 */

var ipc = require('electron').ipcRenderer;
var fs = require('fs');
var path = require('path');

var ScriptLoader = {
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

document.addEventListener("DOMContentLoaded", function (event) {
    ScriptLoader.runAll(document, event)
});

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
});

