import pageIcon from 'page-icon';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
tmp.setGracefulCleanup();

/**
 *
 * @param {string} targetUrl
 * @param {string} platform
 * @param {string} outDir
 * @param {inferIconCallback} callback
 */
function inferIconFromUrlToPath(targetUrl, platform, outDir, callback) {
    let preferredExt = 'png';
    if (platform === 'win32') {
        preferredExt = 'ico';
    }

    pageIcon(targetUrl, {ext: preferredExt})
        .then(icon => {
            if (!icon) {
                throw 'Icon not found';
            }
            const outfilePath = path.join(outDir, `/icon.${icon.ext}`);
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
 * @param {string} platform
 * @param {inferIconCallback} callback
 */
function inferIcon(targetUrl, platform, callback) {
    const tmpObj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpObj.name;
    inferIconFromUrlToPath(targetUrl, platform, tmpPath, callback);
}

export default inferIcon;
