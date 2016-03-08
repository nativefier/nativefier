import pageIcon from 'page-icon';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
tmp.setGracefulCleanup();

/**
 *
 * @param {string} targetUrl
 * @param {string} outDir
 * @param {inferIconCallback} callback
 */
function inferIconFromUrlToPath(targetUrl, outDir, callback) {
    const outfilePath = path.join(outDir, '/icon.png');
    pageIcon(targetUrl, {ext: 'png'})
        .then(icon => {
            fs.writeFile(outfilePath, icon.data, error => {
                callback(error, outfilePath);
            });
        })
        .catch(callback);
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
