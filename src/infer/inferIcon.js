import pageIcon from 'page-icon';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import gitCloud from 'gitcloud';
import helpers from './../helpers/helpers';

const {downloadFile, allowedIconFormats} = helpers;
tmp.setGracefulCleanup();

function inferIconFromStore(targetUrl, platform) {
    const allowedFormats = allowedIconFormats(platform);

    return gitCloud('http://jiahaog.com/nativefier-icons/')
        .then(fileIndex => {
            const matchingIcons = fileIndex
                .filter(item => {
                    // todo might have problems with matching length, e.g. `book` vs `facebook`
                    return targetUrl
                        .toLowerCase()
                        .includes(item.name);
                })
                .map(item => {
                    item.ext = path.extname(item.url);
                    return item;
                });

            let matchingUrl;
            for (let format of allowedFormats) {
                for (let icon of matchingIcons) {
                    if (icon.ext !== format) {
                        continue;
                    }
                    matchingUrl = icon.url;
                }
            }

            if (!matchingUrl) {
                return null;
            }
            return downloadFile(matchingUrl);
        });
}

function writeFilePromise(outPath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(outPath, data, error => {
            if (error) {
                reject(error);
                return;
            }
            resolve(outPath);
        });
    });
}

function inferFromPage(targetUrl, platform, outDir) {
    let preferredExt = '.png';
    if (platform === 'win32') {
        preferredExt = '.ico';
    }

    // todo might want to pass list of preferences instead
    return pageIcon(targetUrl, {ext: preferredExt})
        .then(icon => {
            if (!icon) {
                return null;
            }

            const outfilePath = path.join(outDir, `/icon${icon.ext}`);
            return writeFilePromise(outfilePath, icon.data);
        });
}
/**
 *
 * @param {string} targetUrl
 * @param {string} platform
 * @param {string} outDir
 */
function inferIconFromUrlToPath(targetUrl, platform, outDir) {

    return inferIconFromStore(targetUrl, platform)
        .then(icon => {
            if (!icon) {
                return inferFromPage(targetUrl, platform, outDir);
            }

            const outfilePath = path.join(outDir, `/icon${icon.ext}`);
            return writeFilePromise(outfilePath, icon.data);
        });
}

/**
 * @param {string} targetUrl
 * @param {string} platform
 */
function inferIcon(targetUrl, platform) {
    const tmpObj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpObj.name;
    return inferIconFromUrlToPath(targetUrl, platform, tmpPath);
}

export default inferIcon;
