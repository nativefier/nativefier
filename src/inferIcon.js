import request from 'request';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
tmp.setGracefulCleanup();

const BEST_ICON_API = 'http://icons.better-idea.org/icon';
/**
 *
 * @param {string} targetUrl
 * @param {string} outDir
 * @param {inferIconCallback} callback
 */
function inferIconFromUrlToPath(targetUrl, outDir, callback) {
    const outfilePath = path.join(outDir, '/icon.png');
    request({
        url: BEST_ICON_API,
        qs: {
            url: targetUrl,
            size: 57,
            formats: 'png'
        },
        encoding: null
    }, (error, response, body) => {
        if (error) {
            callback(error);
            return;
        }

        try {
            const parsedError = JSON.parse(body).error;
            callback(parsedError);
        } catch (exception) {
            if (/<html>/i.test(body)) {
                callback('BestIcon server 502 error');
                return;
            }
            // body is an image
            fs.writeFile(outfilePath, body, error => {
                callback(error, outfilePath);
            });
        }
    });
}

/**
 * @callback inferIconCallback
 * @param error
 * @param {string} [iconPath]
 */

/**
 * @param {string} targetUrl
 * @param {inferIconCallback} callback
 */
function inferIcon(targetUrl, callback) {
    const tmpObj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpObj.name;
    inferIconFromUrlToPath(targetUrl, tmpPath, callback);
}

export default inferIcon;
