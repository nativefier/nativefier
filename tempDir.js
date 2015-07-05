/**
 * Created by JiaHao on 5/7/15.
 */

var fs = require('fs');
var temp = require('temp').track();
var ncp = require('ncp').ncp;


/**
 * @callback tempDirCallback
 * @param error
 * @param tempDirPath
 */

/**
 * Creates a temporary directory and copies the './app folder' inside, and adds a text file with the configuration
 * for the single page app.
 *
 * @param {string} name
 * @param {string} targetURL
 * @param {tempDirCallback} callback
 */
module.exports = function (name, targetURL, callback) {

    var tempDir = temp.path();

    ncp('./app', tempDir, function (error) {
        if (error) {
            callback('Error creating temporary directory', null);

        } else {

            var appArgs = {
                name: name,
                targetUrl: targetURL
            };

            fs.writeFileSync(tempDir + '/targetUrl.txt', JSON.stringify(appArgs));

            callback(error, tempDir);
        }
    });
};


